<template>
  <div class="exchange">
    <select-bitcoin-wallet v-if="!sendBitcoinStep" @bitcoinWalletSelected="toSendBitcoin"/>
    <component v-else :is="currentComponent" :bitcoinWallet="bitcoinWallet" :btc="btcObj"
               @sendBTC="send" @success="succeed" @track="track"/>
  </div>
</template>

<script lang="ts">
import { Vue, Component, Emit } from 'vue-property-decorator';
import SelectBitcoinWallet from '@/components/exchange/SelectBitcoinWallet.vue';
import SendBitcoinLedger from '@/components/ledger/SendBitcoinLedger.vue';
import SendBitcoinTrezor from '@/components/trezor/SendBitcoinTrezor.vue';
import VerifyConfirmTransaction from '@/components/ledger/VerifyConfirmTransaction.vue';
import SuccessSend from '@/components/exchange/SuccessSend.vue';
import TrackingId from '@/components/exchange/TrackingId.vue';
import * as constants from '@/store/constants';

@Component({
  components: {
    SelectBitcoinWallet,
    SendBitcoinLedger,
    SendBitcoinTrezor,
    VerifyConfirmTransaction,
    SuccessSend,
    TrackingId,
  },
})
export default class Exchange extends Vue {
  sendBitcoinStep = false;

  currentComponent = '';

  bitcoinWallet = '';

  btcObj = {};

  @Emit('bitcoinWallet')
  toSendBitcoin(bitcoinWallet: string): string {
    this.bitcoinWallet = bitcoinWallet;
    this.sendBitcoinStep = true;
    if (bitcoinWallet === constants.WALLET_LEDGER) this.currentComponent = 'SendBitcoinLedger';
    if (bitcoinWallet === constants.WALLET_TREZOR) this.currentComponent = 'SendBitcoinTrezor';
    return bitcoinWallet;
  }

  @Emit()
  send(btcObject: object): void {
    this.currentComponent = 'VerifyConfirmTransaction';
    this.btcObj = btcObject;
  }

  @Emit()
  succeed(): void {
    this.currentComponent = 'SuccessSend';
  }

  @Emit()
  track(): void {
    this.currentComponent = 'TrackingId';
  }
}
</script>
