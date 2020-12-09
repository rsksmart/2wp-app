<template>
  <div class="exchange">
    <select-bitcoin-wallet v-if="!sendBitcoinStep" @bitcoinWalletSelected="toSendBitcoin"/>
    <component v-else :is="currentComponent" :bitcoinWallet="bitcoinWallet"/>
  </div>
</template>

<script lang="ts">
import { Vue, Component, Emit } from 'vue-property-decorator';
import SelectBitcoinWallet from '@/components/exchange/SelectBitcoinWallet.vue';
import SendBitcoinLedger from '@/components/ledger/SendBitcoinLedger.vue';
import * as constants from '@/store/constants';

@Component({
  components: {
    SelectBitcoinWallet,
    SendBitcoinLedger,
  },
})
export default class Exchange extends Vue {
  sendBitcoinStep = false;

  currentComponent = '';

  bitcoinWallet = '';

  @Emit('bitcoinWallet')
  toSendBitcoin(bitcoinWallet: string): string {
    this.bitcoinWallet = bitcoinWallet;
    this.sendBitcoinStep = true;
    if (bitcoinWallet === constants.WALLET_LEDGER) this.currentComponent = 'SendBitcoinLedger';
    return bitcoinWallet;
  }
}
</script>
