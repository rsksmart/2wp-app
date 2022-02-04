<template>
  <v-container fluid class="exchange container max-width mx-6">
    <component :is="selectedWalletComponent" @back="back"/>
  </v-container>
</template>

<script lang="ts">
import {
  Component, Emit, Vue,
} from 'vue-property-decorator';
import { Action, State } from 'vuex-class';
import { BtcWallet, PegInTxState } from '@/store/peginTx/types';
import * as constants from '@/store/constants';
import SendBitcoinTrezor from '@/components/trezor/SendBitcoinTrezor.vue';
import SendBitcoinLedger from '@/components/ledger/SendBitcoinLedger.vue';

@Component({
  components: {
    SendBitcoinTrezor,
    SendBitcoinLedger,
  },
})
export default class Create extends Vue {
  currentComponent = '';

  bitcoinWallet = '';

  @State('pegInTx') pegInTxState!: PegInTxState;

  @Action(constants.PEGIN_TX_ADD_BITCOIN_WALLET, { namespace: 'pegInTx' }) setBitcoinWallet !: (wallet: BtcWallet) => void;

  @Action(constants.PEGIN_TX_CLEAR_STATE, { namespace: 'pegInTx' }) clear !: () => void;

  @Action(constants.PEGIN_TX_INIT, { namespace: 'pegInTx' }) init !: () => void;

  get selectedWalletComponent(): 'SendBitcoinTrezor' | 'SendBitcoinLedger' {
    switch (this.pegInTxState.bitcoinWallet) {
      case 'WALLET_LEDGER':
        return 'SendBitcoinLedger';
      case 'WALLET_TREZOR':
        return 'SendBitcoinTrezor';
      default:
        return 'SendBitcoinTrezor';
    }
  }

  @Emit('bitcoinWallet')
  toSendBitcoin(bitcoinWallet: BtcWallet): string {
    this.setBitcoinWallet(bitcoinWallet);
    if (this.pegInTxState.bitcoinWallet === constants
      .WALLET_LEDGER) this.currentComponent = 'SendBitcoinLedger';
    if (this.pegInTxState.bitcoinWallet === constants
      .WALLET_TREZOR) this.currentComponent = 'SendBitcoinTrezor';
    return bitcoinWallet;
  }

  @Emit()
  back(currentComponent: 'ConnectDevice' | 'PegInForm') {
    if (currentComponent === 'ConnectDevice') {
      this.clear();
      this.init();
      this.$router.replace({ name: 'PegIn' });
    }
  }
}
</script>
