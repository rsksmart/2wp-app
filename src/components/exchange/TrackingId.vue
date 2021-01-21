<template>
  <div class="exchange-form">
    <v-row class="mx-0 my-8 d-flex justify-center">
      <h2 class="text-center ma-0">
        Copy the tracking ID
        <br>
        to check your transaction status
      </h2>
    </v-row>
    <v-row class="mx-0 d-flex justify-center">
      <span class="text-center">Remember to copy any of the links shown on your clipboard</span>
    </v-row>
    <v-row class="mx-0 summary-box">
      <div class="container">
        <div class="container">
          <v-row class="mx-0">
            <h1>Transaction ID:</h1>
          </v-row>
          <v-row class="mx-0">
            <p>35gf676g</p>
          </v-row>
        </div>
        <v-divider color="#C4C4C4"/>
        <div class="container">
          <v-row class="mx-0">
            <h1>Transaction link: </h1>
          </v-row>
          <v-row class="mx-0">
            <p>https://www.2wp/prototype.rsk/35gf676g</p>
          </v-row>
        </div>
      </div>
    </v-row>
    <v-row class="mx-0 d-flex justify-center">
      <v-col cols="8">
        <v-text-field outlined label="Email (optional)" v-model="email" type="text"/>
      </v-col>
    </v-row>
    <v-row class="mx-0 mb-3 d-flex justify-center dialog">
      <v-btn class="button" color="#126DF2">
        <span class="whiteish">Continue</span>
      </v-btn>
    </v-row>
  </div>
</template>

<script lang="ts">
import {
  Component,
  Vue,
} from 'vue-property-decorator';

@Component
export default class TrackingId extends Vue {
  email = '';
}
</script>
