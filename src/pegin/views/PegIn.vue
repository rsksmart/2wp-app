<template>
  <v-container fluid class="exchange normalized-height container max-width">
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
import { useAction } from '@/common/store/helper';
import * as constants from '@/common/store/constants';

export default defineComponent({
  name: 'PegIn',
  components: {
    SelectBitcoinWallet,
    BtcToRbtcDialog,
  },
  setup() {
    const showDialog = ref(false);

    const initPegin = useAction('pegInTx', constants.PEGIN_TX_INIT);

    function closeDialog() {
      showDialog.value = false;
    }

    onBeforeMount(() => {
      showDialog.value = localStorage.getItem('BTRD_COOKIE_DISABLED') !== 'true';
    });

    initPegin();

    return {
      showDialog,
      closeDialog,
    };
  },
});
</script>
