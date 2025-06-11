<template>
  <v-container fluid class="exchange container max-width">
    <send-bitcoin @back="back" />
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
    const router = useRouter();

    function back() {
      clear();
      router.push({ name: 'Home' });
    }

    return {
      back,
    };
  },
});
</script>
