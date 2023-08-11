<template>
  <v-container fluid class="exchange normalized-height container
  max-width mx-6">
    <select-bitcoin-wallet/>
    <template v-if="showDialog">
      <btc-to-rbtc-dialog :showDialog="showDialog" @closeDialog="closeDialog"/>
    </template>
  </v-container>
</template>

<script lang="ts">
import { onBeforeMount, ref, defineComponent } from 'vue';
import SelectBitcoinWallet from '@/common/components/exchange/SelectBitcoinWallet.vue';
import BtcToRbtcDialog from '@/common/components/exchange/BtcToRbtcDialog.vue';

export default defineComponent({
  name: 'PegIn',
  components: {
    SelectBitcoinWallet,
    BtcToRbtcDialog,
  },
  setup() {
    const showDialog = ref(false);

    function closeDialog() {
      showDialog.value = false;
    }

    onBeforeMount(() => {
      showDialog.value = localStorage.getItem('BTRD_COOKIE_DISABLED') !== 'true';
    });

    return {
      showDialog,
      closeDialog,
    };
  },
});
</script>