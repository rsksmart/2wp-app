<template>
  <v-container fluid class="exchange normalized-height container max-width">
    <select-bitcoin-wallet/>
  </v-container>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import SelectBitcoinWallet from '@/common/components/exchange/SelectBitcoinWallet.vue';
import { useAction } from '@/common/store/helper';
import * as constants from '@/common/store/constants';

export default defineComponent({
  name: 'PegIn',
  components: {
    SelectBitcoinWallet,
  },
  setup() {
    const initPegin = useAction('pegInTx', constants.PEGIN_TX_INIT);

    initPegin();
  },
});
</script>
