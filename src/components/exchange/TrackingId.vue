<template>
  <div class="d-flex justify-center exchange-form">
    <v-card width="550" class="container">
      <v-row class="mx-0 my-8 d-flex justify-center">
        <v-col cols="9">
          <h2 class="text-center ma-0">
            Copy the tracking ID below to check your transaction status
          </h2>
        </v-col>
      </v-row>
      <v-row class="mx-0 d-flex justify-center">
        <p class="text-center">Remember it will take between 16-17 hours.</p>
      </v-row>
      <v-row class="mx-0 d-flex justify-center">
        <p class="text-center">Transaction ID:  35gf676g</p>
      </v-row>
      <v-row class="mx-0 d-flex justify-center">
        <p class="text-center">Transaction link: https://www.2wp/prototype.rsk/35gf676g</p>
      </v-row>
      <v-row class="mx-0 mb-8 d-flex justify-center">
        <p class="text-center ma-0">Email:  _______________________</p>
      </v-row>
      <v-row class="mx-0 mb-3 d-flex justify-center dialog">
        <v-btn class="button" color="#126DF2">
          <span class="whiteish">Continue</span>
        </v-btn>
      </v-row>
    </v-card>
  </div>
</template>

<script lang="ts">
import {
  Component,
  Vue,
} from 'vue-property-decorator';

@Component
export default class TrackingId extends Vue {
}
</script>
