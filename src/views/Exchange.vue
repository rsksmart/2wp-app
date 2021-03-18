<template>
  <div class="exchange container">
    <select-bitcoin-wallet v-if="!sendBitcoinStep" @bitcoinWalletSelected="toSendBitcoin"/>
    <component v-else :is="currentComponent"/>
  </div>
</template>

<script lang="ts">
import { Vue, Component, Emit } from 'vue-property-decorator';
import SelectBitcoinWallet from '@/components/exchange/SelectBitcoinWallet.vue';
import SendBitcoinLedger from '@/components/ledger/SendBitcoinLedger.vue';
import SendBitcoinTrezor from '@/components/trezor/SendBitcoinTrezor.vue';
import VerifyConfirmTransaction from '@/components/ledger/ConfirmTransaction.vue';
import SuccessSend from '@/components/exchange/SuccessSend.vue';
import TrackingId from '@/components/exchange/TrackingId.vue';
import * as constants from '@/store/constants';
import { Action, State } from 'vuex-class';
import { PegInTxState } from '@/store/peginTx/types';

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

  @State('pegInTx') peginTxState!: PegInTxState;

  @Action(constants.PEGIN_TX_ADD_BITCOIN_WALLET, { namespace: 'pegInTx' }) setBitcoinWallet !: any;

  @Emit('bitcoinWallet')
  toSendBitcoin(bitcoinWallet: string): string {
    this.setBitcoinWallet(bitcoinWallet);
    this.sendBitcoinStep = true;
    if (this.peginTxState.bitcoinWallet === constants
      .WALLET_LEDGER) this.currentComponent = 'SendBitcoinLedger';
    if (this.peginTxState.bitcoinWallet === constants
      .WALLET_TREZOR) this.currentComponent = 'SendBitcoinTrezor';
    return bitcoinWallet;
  }
}
</script>
