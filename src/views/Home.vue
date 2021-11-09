<template>
  <v-container fluid class="exchange normalized-height container
  max-width mx-6">
    <select-bitcoin-wallet  :peg="peg" @bitcoinWalletSelected="toSendBitcoin"/>
  </v-container>
</template>

<script lang="ts">
import {
  Vue, Component, Emit, Prop,
} from 'vue-property-decorator';
import { Action, State } from 'vuex-class';
import SelectBitcoinWallet from '@/components/exchange/SelectBitcoinWallet.vue';
import * as constants from '@/store/constants';
import { PegInTxState } from '@/store/peginTx/types';
import { TransactionType } from '@/store/session/types';

@Component({
  components: {
    SelectBitcoinWallet,
  },
})
export default class Home extends Vue {
  @Prop({ default: '' }) peg!: string;

  @State('pegInTx') peginTxState!: PegInTxState;

  @Action(constants.PEGIN_TX_ADD_BITCOIN_WALLET, { namespace: 'pegInTx' }) setBitcoinWallet !: any;

  @Action(constants.SESSION_ADD_TX_TYPE, { namespace: 'web3Session' }) addPeg!: (peg: TransactionType) => void;

  @Action(constants.PEGIN_TX_CLEAR_STATE, { namespace: 'pegInTx' }) clear !: () => void;

  @Action(constants.PEGIN_TX_INIT, { namespace: 'pegInTx' }) init !: () => void;

  @Emit()
  toSendBitcoin(bitcoinWallet: string): void {
    this.setBitcoinWallet(bitcoinWallet);
    this.addPeg('PEG_IN');
    if (this.peginTxState.bitcoinWallet === constants
      .WALLET_LEDGER) this.$router.push({ name: 'Exchange', params: { selectedWallet: 'SendBitcoinLedger' } });
    if (this.peginTxState.bitcoinWallet === constants
      .WALLET_TREZOR) this.$router.push({ name: 'Exchange', params: { selectedWallet: 'SendBitcoinTrezor' } });
  }

  @Emit()
  back() {
    this.setBitcoinWallet('');
  }

  created() {
    this.clear();
    this.init();
  }
}
</script>
