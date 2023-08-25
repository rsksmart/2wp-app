<template>
  <v-container fluid class="exchange container max-width mx-6">
    <send-bitcoin @back="back"/>
  </v-container>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { useRouter } from 'vue-router';
import * as constants from '@/common/store/constants';
import { useAction } from '@/common/store/helper';
import SendBitcoin from '@/pegin/components/create/SendBitcoin.vue';

export default defineComponent({
  name: 'CreatePegIn',
  components: {
    SendBitcoin,
  },
  setup() {
    const clear = useAction('pegInTx', constants.PEGIN_TX_CLEAR_STATE);
    const initPegin = useAction('pegInTx', constants.PEGIN_TX_INIT);
    const init = useAction('pegOutTx', constants.PEGOUT_TX_INIT);

    function back() {
      const router = useRouter();
      clear();
      init();
      initPegin();
      router.push({ name: 'Home' });
    }

    return {
      back,
    };
  },
});
</script>
