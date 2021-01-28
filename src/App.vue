<template>
  <v-app style="z-index: 0 !important;">
    <v-main class="custom-background">
      <top/>
      <router-view @bitcoinWallet="getBitcoinWallet"/>
    </v-main>
  </v-app>
</template>
<script lang="ts">
import Vue from 'vue';
import Top from '@/components/layouts/Top.vue';
import { Component, Emit } from 'vue-property-decorator';

@Component({
  components: {
    Top,
  },
})
export default class App extends Vue {
  bitcoinWallet = '';

  @Emit()
  getBitcoinWallet(_bitcoinWallet: string) {
    this.bitcoinWallet = _bitcoinWallet;
  }
}
</script>
