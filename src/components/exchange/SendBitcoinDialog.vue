<template>
  <v-dialog width="60%" v-model="showDialog" :persistent="showDialog">
    <v-card class="container dialog">
      <div class="container">
        <v-row class="mx-0 my-5 d-flex justify-center">
          <h1 class="text-center">Send Bitcoin</h1>
        </v-row>
        <v-row class="mx-0 my-5 d-flex justify-center">
          <v-col cols="9">
            <p class="text-center">
              Now that you have completed the Select step, you are ready to go on with the process.
            </p>
          </v-col>
        </v-row>
        <v-row class="mx-0 d-flex justify-center">
          <v-col cols="9">
            <p class="text-center">
              The task to complete on this step will be to send your Bitcoins to the RSK Address
              using your {{ walletName }}, so that the conversion of tokens can be executed.
            </p>
          </v-col>
        </v-row>
      </div>
      <v-row class="mx-0 my-5 d-flex justify-center">
        <v-btn class="button" color="#126DF2" @click="showDialog = false">
          Continue
        </v-btn>
      </v-row>
    </v-card>
  </v-dialog>
</template>

<script lang="ts">
import {
  Vue,
  Component,
  Prop,
} from 'vue-property-decorator';
import * as constants from '@/store/constants';

@Component
export default class SendBitcoinDialog extends Vue {
  showDialog = true;

  @Prop(String) readonly bitcoinWallet!: string;

  get walletName() {
    switch (this.bitcoinWallet) {
      case constants.WALLET_LEDGER: {
        return 'Ledger wallet';
      }
      case constants.WALLET_TREZOR: {
        return 'Trezor wallet';
      }
      case constants.WALLET_ELECTRUM: {
        return 'Electrum wallet';
      }
      case constants.WALLET_RWALLET: {
        return 'RWallet';
      }
      case constants.WALLET_DEFIANT: {
        return 'Defiant wallet';
      }
      default: {
        return 'wallet';
      }
    }
  }
}
</script>
