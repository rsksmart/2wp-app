<template>
  <v-app>
    <v-main class="custom-background">
      <top/>
      <router-view @bitcoinWallet="getBitcoinWallet"/>
    </v-main>
  </v-app>
</template>
<script lang="ts">
import Vue from 'vue';
import Top from '@/components/layouts/Top.vue';

export default Vue.extend({
  name: 'App',
  data() {
    return {
      bitcoinWallet: '',
    };
  },
  components: {
    Top,
  },
  methods: {
    getBitcoinWallet(_bitcoinWallet: string) {
      this.bitcoinWallet = _bitcoinWallet;
    },
  },
});
</script>
