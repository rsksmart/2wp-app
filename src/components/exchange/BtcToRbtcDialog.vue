<template>
  <v-dialog v-model="showDialog" width="600" persistent>
    <v-card class="container dialog">
      <v-row class="mx-0 mt-10 mb-3 d-flex justify-center">
        <h2>BTC TO RBTC CONVERSION REQUIRES THESE STEPS</h2>
      </v-row>
      <v-row class="mx-0 d-flex justify-center">
        <v-col cols="10">
          <p>Remember that the conversion process from BTC to RBTC must have 100 confirmations.
            This means the conversion will take 17 hours.</p>
        </v-col>
      </v-row>
      <v-row class="mx-0 mb-3 mt-1">
        <v-img src="@/assets/exchange/trezor/btc_conversion.png" height="135" contain/>
      </v-row>
      <v-row class="mx-0 mt-8 mb-10 d-flex justify-center">
        <v-btn width="142" height="50" dense rounded color="#00B520" @click="closeDialog">
          <span class="whiteish">Continue</span>
        </v-btn>
      </v-row>
    </v-card>
  </v-dialog>
</template>

<script lang="ts">
import {
  Component, Prop, Emit,
  Vue,
} from 'vue-property-decorator';

@Component
export default class BtcToRbtcDialog extends Vue {
  @Prop() showDialog!: boolean;

  @Emit('closeDialog')
  closeDialog() {
    return this.showDialog;
  }
}
</script>
