<template>
  <v-container fluid class="exchange container max-width">
    <send-bitcoin @back="back"/>
  </v-container>
</template>

<script lang="ts">
import { defineComponent, onMounted } from 'vue';
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
    const initFlyover = useAction('flyoverPegin', constants.FLYOVER_PEGIN_INIT);
    const router = useRouter();

    function back() {
      clear();
      router.push({ name: 'PegIn' });
    }

    onMounted(() => {
      initFlyover();
    });

    return {
      back,
    };
  },
});
</script>
