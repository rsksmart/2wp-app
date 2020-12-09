<template>
  <v-navigation-drawer permanent app color="#1732A4" class="drawer">
    <v-row class="mx-0 mt-auto d-flex justify-center">
      <v-col cols="3" class="d-flex justify-center">
        <span v-if="!bitcoinWallet" class="number text-center">1</span>
        <v-icon v-else color="#23CB7D">mdi-checkbox-marked-circle</v-icon>
      </v-col>
      <v-col cols="6">
        Select
      </v-col>
    </v-row>
    <v-row class="mx-0 d-flex justify-center">
      <v-col cols="3" class="d-flex justify-center">
        <p class="number text-center">2</p>
      </v-col>
      <v-col cols="6">
        Send Bitcoin
      </v-col>
    </v-row>
  </v-navigation-drawer>
</template>

<script lang="ts">
import {
  Vue,
  Component,
  Prop,
  Watch,
} from 'vue-property-decorator';
import * as constants from '@/store/constants';

@Component
export default class Drawer extends Vue {
  @Prop(String) readonly bitcoinWallet!: string;

  @Watch('bitcoinWallet')
  onBitcoinWalletSelection() {
    if (this.bitcoinWallet === constants.WALLET_LEDGER) console.log('ledger on drawer!');
  }
}
</script>
