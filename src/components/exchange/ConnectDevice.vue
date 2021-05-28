<template>
  <div class="transactions">
    <v-col offset="2" cols="8" offset-lg="3" lg="6">
      <v-row class="mx-0 mb-5 mt-10 d-flex justify-center">
        <v-progress-circular indeterminate :size="60" :width="8" color="#00B520" />
      </v-row>
      <v-row class="mx-0 d-flex justify-center">
        <h1>Connect your {{ walletName }}</h1>
      </v-row>
      <v-row class="ma-0 mb-10 d-flex justify-center">
        <p class="ma-0">(Keep your {{ walletName }} close so you can authorize access)</p>
      </v-row>
      <v-col class="ma-0 mb-10">
        <v-row class="ma-0 d-flex justify-start">
          <span class="number">1</span>
          <p class="ma-0">Plug in your {{ walletName }} device to your computer</p>
        </v-row>
        <v-row class="ma-0 mt-5 d-flex justify-start">
          <span class="number">2</span>
          <p class="ma-0">Insert PIN into {{ walletName }} device</p>
        </v-row>
        <v-row v-if="isLedgerWallet" class="ma-0 mt-5 d-flex justify-start">
          <span class="number">3</span>
          <p class="ma-0">Select Bitcoin aplication into {{ walletName }} device</p>
        </v-row>
      </v-col>
      <v-row class="mx-0 d-flex justify-center">
        <v-img :src="deviceImagePath" height="300" contain />
      </v-row>
      <v-row class="mx-0 mt-8 mb-10 d-flex justify-center">
        <v-btn width="142" height="50" dense rounded color="#00B520" @click="continueToForm">
          <span class="whiteish">Continue</span>
        </v-btn>
      </v-row>
    </v-col>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue, Emit } from "vue-property-decorator";
import { Getter, State } from "vuex-class";
import * as constants from "@/store/constants";
import { PegInTxState } from "@/store/peginTx/types";
import LedgerConnect from "@/assets/exchange/ledger/connect_ledger.png";
import TrezorConnect from "@/assets/exchange/trezor/connect_trezor.png";
import Connect from "@/assets/exchange/wallet.png";

@Component
export default class ConnectDevice extends Vue {
  @Prop() device!: string;

  @State("pegInTx") peginTxState!: PegInTxState;

  @Getter(constants.WALLET_NAME, { namespace: "pegInTx" }) walletName!: string;

  get deviceImagePath() {
    if (this.peginTxState.bitcoinWallet === constants.WALLET_LEDGER) return LedgerConnect;
    if (this.peginTxState.bitcoinWallet === constants.WALLET_TREZOR) return TrezorConnect;
    return Connect;
  }

  get isLedgerWallet() {
    return this.peginTxState.bitcoinWallet === constants.WALLET_LEDGER;
  }

  @Emit('continueToForm')
  continueToForm() {
    return this.peginTxState.bitcoinWallet;
  }
}
</script>
