<template>
  <v-app>
    <drawer :bitcoinWallet="bitcoinWallet"/>
    <div class="custom-background">
      <v-main class="gradient">
        <top/>
        <router-view @bitcoinWallet="getBitcoinWallet"/>
      </v-main>
    </div>
  </v-app>
</template>
<script lang="ts">
import Vue from 'vue';
import Drawer from '@/components/layouts/Drawer.vue';
import Top from '@/components/layouts/Top.vue';

export default Vue.extend({
  name: 'App',
  data() {
    return {
      bitcoinWallet: '',
    };
  },
  components: {
    Drawer,
    Top,
  },
  methods: {
    getBitcoinWallet(_bitcoinWallet: string) {
      this.bitcoinWallet = _bitcoinWallet;
    },
  },
});
</script>
