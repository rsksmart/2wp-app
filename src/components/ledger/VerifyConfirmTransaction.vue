<template>
  <div class="exchange-form">
    <v-card class="container mb-5 d-flex align-center justify-center" width="650" height="340">
      <div @click="success">
        <v-row class="mx-0 d-flex justify-center">
          <v-img src="@/assets/ledger/bitcoin.png" height="64" contain/>
        </v-row>
        <v-row class="mx-0 my-2 d-flex justify-center">
          <h3 class="text-center">Verify ans confirm transaction</h3>
        </v-row>
        <v-row class="mx-0 d-flex justify-center">
          <p class="text-center ma-0">Check your transaction displayer on your device</p>
        </v-row>
        <v-row class="mx-0 d-flex justify-center">
          <p class="text-center">and confirm (or reject) it to continue.</p>
        </v-row>
        <v-row class="mx-0 d-flex justify-center">
          <v-img src="@/assets/ledger/summary.png" height="120" contain/>
        </v-row>
      </div>
    </v-card>
    <v-card class="container" width="410">
      <v-row class="mx-0 d-flex justify-center">
        <h3 class="text-center">Transaction Summary</h3>
      </v-row>
      <v-row class="mx-0">
        <v-col class="pl-0">
          <div class="input-box-inverted">
            <span class="label">BTC</span>
            <v-text-field solo hide-details full-width single-line flat readonly
                          v-model="btc.bitcoinAmount" background-color="#EBF0FF"/>
          </div>
        </v-col>
      </v-row>
      <v-row class="mx-0">
        <v-col class="pl-0">
          <div class="input-box-inverted">
            <span class="label">Deposit BTC Address</span>
            <v-text-field solo hide-details full-width single-line flat readonly
                          v-model="btc.btcRefundAddressSelected" background-color="#EBF0FF"/>
          </div>
        </v-col>
      </v-row>
      <v-row class="mx-0">
        <v-col class="pl-0">
          <div class="input-box-inverted">
            <span class="label">Destination RSK Address</span>
            <v-text-field solo hide-details full-width single-line flat readonly
                          v-model="btc.rskAddressSelected" background-color="#EBF0FF"/>
          </div>
        </v-col>
      </v-row>
      <v-row class="mx-0">
        <v-col class="pl-0">
          <div class="input-box-inverted">
            <span class="label">Destination RSK Address</span>
            <v-text-field solo hide-details full-width single-line flat readonly
                          v-model="btc.txFee" background-color="#EBF0FF"/>
          </div>
        </v-col>
      </v-row>
    </v-card>
  </div>
</template>

<script lang="ts">
import {
  Component,
  Prop,
  Emit,
  Vue,
} from 'vue-property-decorator';

@Component
export default class VerifyConfirmTransaction extends Vue {
  @Prop(Object) btc!: object;

  @Emit('success')
  success() {
    console.log(`Confirm ${this.btc}`);
  }
}
</script>
