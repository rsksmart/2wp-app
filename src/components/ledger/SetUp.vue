<template>
  <v-card class="container dialog" width="90%">
    <v-row class="mx-0 mb-8 mt-10 d-flex justify-center">
      <h1 class="text-center">SetUp Ledger</h1>
    </v-row>
    <v-row class="mx-0 d-flex justify-center">
      <v-col cols="3">
        <v-row class="mx-0 d-flex justify-center">
          <p class="number ligth-grayish text-center">1</p>
        </v-row>
        <v-row class="mx-0 d-flex justify-center">
          <p class="text-center">Plug in your Ledger device to your computer</p>
        </v-row>
        <v-row class="mx-0 d-flex justify-center">
          <v-img src="@/assets/exchange/ledger/00.png" contain height="80"/>
        </v-row>
      </v-col>
      <v-col cols="3">
        <v-row class="mx-0 d-flex justify-center">
          <p class="number ligth-grayish text-center">2</p>
        </v-row>
        <v-row class="mx-0 d-flex justify-center">
          <p class="text-center">Enter your PIN in your Ledger device</p>
        </v-row>
        <v-row class="mx-0 d-flex justify-center">
          <p class="text-center">
            Press both buttons at the same time in order to confirm your PIN
          </p>
        </v-row>
        <v-row class="mx-0 d-flex justify-center">
          <v-img src="@/assets/exchange/ledger/01.png" contain height="80"/>
        </v-row>
      </v-col>
      <v-col cols="3">
        <v-row class="mx-0 d-flex justify-center">
          <p class="number ligth-grayish text-center">3</p>
        </v-row>
        <v-row class="mx-0 d-flex justify-center">
          <p class="text-center">Select Bitcoin Wallet in your Ledger device</p>
        </v-row>
        <v-row class="mx-0 d-flex justify-center">
          <p class="text-center">
            Press both buttons at the same time in order to confirm your Bitcoin account
          </p>
        </v-row>
        <v-row class="mx-0 d-flex justify-center">
          <v-img src="@/assets/exchange/ledger/02.png" contain height="80"/>
        </v-row>
      </v-col>
    </v-row>
    <v-row class="mx-0 d-flex justify-end">
      <v-col cols="3" class="d-flex justify-end">
        <v-btn rounded solo dense color="#126DF2" @click="succeed">
          <span class="whiteish">NEXT</span>
          <v-icon color="#FFF" class="ml-2">mdi-arrow-right</v-icon>
        </v-btn>
      </v-col>
    </v-row>
  </v-card>
</template>

<script lang="ts">
import {
  Component,
  Emit,
  Prop,
  Vue, Watch,
} from 'vue-property-decorator';

@Component
export default class SetUp extends Vue {
  flag = false;

  @Prop(Boolean) setUpFlag!: boolean;

  @Emit('succeed')
  succeed(): boolean {
    return this.setUpFlag;
  }

  @Watch('setUpFlag')
  setUpFlagValue() {
    this.flag = this.setUpFlag;
  }
}
</script>
