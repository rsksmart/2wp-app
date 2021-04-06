<template>
  <div class="transactions">
    <v-row class="mx-0 mb-5 mt-10 d-flex justify-center">
      <v-progress-circular indeterminate :size="60" :width="8" color="#00B520"/>
    </v-row>
    <v-row class="mx-0 d-flex justify-center">
      <h1>Connect your {{ walletName }}</h1>
    </v-row>
    <v-row class="ma-0 mt-5 d-flex justify-center">
      <p class="ma-0">Plug in your {{ walletName }} device to your computer</p>
    </v-row>
    <v-row class="ma-0 mb-8 d-flex justify-center">
      <p class="ma-0">Keep your {{ walletName }} close so you can authorize access</p>
    </v-row>
    <v-row class="mx-0 d-flex justify-center">
      <v-img :src="deviceImagePath" height="410" contain/>
    </v-row>
  </div>
</template>

<script lang="ts">
import {
  Component, Prop,
  Vue,
} from 'vue-property-decorator';
import { Getter, State } from 'vuex-class';
import * as constants from '@/store/constants';
import { PegInTxState } from '@/store/peginTx/types';
import LedgerConnect from '@/assets/exchange/ledger/connect_ledger.png';
import TrezorConnect from '@/assets/exchange/trezor/connect_trezor.png';
import Connect from '@/assets/exchange/wallet.png';

@Component
export default class ConnectDevice extends Vue {
  @Prop() device!: string;

  @State('pegInTx') peginTxState!: PegInTxState;

  @Getter(constants.WALLET_NAME, { namespace: 'pegInTx' }) walletName!: string;

  get deviceImagePath() {
    if (this.peginTxState.bitcoinWallet === constants
      .WALLET_LEDGER) return LedgerConnect;
    if (this.peginTxState.bitcoinWallet === constants
      .WALLET_TREZOR) return TrezorConnect;
    return Connect;
  }
}
</script>
