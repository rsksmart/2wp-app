<template>
  <v-container fluid class="exchange container max-width">
    <send-bitcoin @back="back" :isFlyoverAvailable="isFlyoverAvailable"/>
  </v-container>
</template>

<script lang="ts">
import { defineComponent, onBeforeMount, ref } from 'vue';
import { useRouter } from 'vue-router';
import * as constants from '@/common/store/constants';
import { useAction, useGetter } from '@/common/store/helper';
import SendBitcoin from '@/pegin/components/create/SendBitcoin.vue';
import { Feature, FeatureNames } from '@/common/types';

export default defineComponent({
  name: 'CreatePegIn',
  components: {
    SendBitcoin,
  },
  setup() {
    const clear = useAction('pegInTx', constants.PEGIN_TX_CLEAR_STATE);
    const initFlyover = useAction('flyoverPegin', constants.FLYOVER_PEGIN_INIT);
    const flyoverFeature = useGetter<(name: FeatureNames) => Feature>('web3Session', constants.SESSION_GET_FEATURE);
    const isFlyoverAvailable = ref(false);
    const router = useRouter();

    function back() {
      clear();
      router.push({ name: 'PegIn' });
    }

    onBeforeMount(() => {
      const flag = flyoverFeature.value(FeatureNames.FLYOVER_PEG_IN);
      if (flag.value === constants.ENABLED) {
        initFlyover()
          .then(() => { isFlyoverAvailable.value = true; })
          .catch(() => { isFlyoverAvailable.value = false; });
      }
    });

    return {
      back,
      isFlyoverAvailable,
    };
  },
});
</script>
