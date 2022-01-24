<template>
  <v-container fluid class="exchange normalized-height container
  max-width mx-6">
    <select-bitcoin-wallet/>
  </v-container>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import SelectBitcoinWallet from '@/components/exchange/SelectBitcoinWallet.vue';

@Component({
  components: {
    SelectBitcoinWallet,
  },
})
export default class PegIn extends Vue {
}
</script>
