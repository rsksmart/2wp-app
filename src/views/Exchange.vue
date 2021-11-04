<template>
  <v-container fluid class="exchange normalized-height container
  max-width mx-6">
    <component :is="selectedWalletComponent" @back="back"/>
  </v-container>
</template>

<script lang="ts">
import {
  Vue, Component, Emit, Prop,
} from 'vue-property-decorator';
import { Action, State } from 'vuex-class';
import SelectBitcoinWallet from '@/components/exchange/SelectBitcoinWallet.vue';
import SendBitcoinTrezor from '@/components/trezor/SendBitcoinTrezor.vue';
import SendBitcoinLedger from '@/components/ledger/SendBitcoinLedger.vue';
import SuccessSend from '@/components/exchange/SuccessSend.vue';
import TrackingId from '@/components/exchange/TrackingId.vue';
import * as constants from '@/store/constants';
import { PegInTxState } from '@/store/peginTx/types';

@Component({
  components: {
    SelectBitcoinWallet,
    SendBitcoinTrezor,
    SuccessSend,
    TrackingId,
    SendBitcoinLedger,
  },
})
export default class Exchange extends Vue {
  currentComponent = '';

  bitcoinWallet = '';

  @Prop({ default: 'SendBitcoinTrezor' }) selectedWalletComponent!: string;

  @State('pegInTx') peginTxState!: PegInTxState;

  @Action(constants.PEGIN_TX_ADD_BITCOIN_WALLET, { namespace: 'pegInTx' }) setBitcoinWallet !: any;

  @Emit('bitcoinWallet')
  toSendBitcoin(bitcoinWallet: string): string {
    this.setBitcoinWallet(bitcoinWallet);
    if (this.peginTxState.bitcoinWallet === constants
      .WALLET_LEDGER) this.currentComponent = 'SendBitcoinLedger';
    if (this.peginTxState.bitcoinWallet === constants
      .WALLET_TREZOR) this.currentComponent = 'SendBitcoinTrezor';
    return bitcoinWallet;
  }

  @Emit()
  back() {
    this.$router.replace({ name: 'Home', params: { peg: 'BTC2RBTC' } });
  }
}
</script>
