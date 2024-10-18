<template>
  <v-container fluid class="exchange container max-width">
    <pegout-form
      :flyoverEnabled="flyoverEnabled"/>
  </v-container>
</template>

<script lang="ts">
import { ref, defineComponent, onBeforeMount } from 'vue';
import * as constants from '@/common/store/constants';
import PegoutForm from '@/pegout/components/PegoutForm.vue';
import { useAction, useGetter } from '@/common/store/helper';
import { Feature, FeatureNames } from '@/common/types';

export default defineComponent({
  name: 'PegOut',
  components: {
    PegoutForm,
  },
  setup() {
    const init = useAction('pegOutTx', constants.PEGOUT_TX_INIT);
    const initFlyover = useAction('flyoverPegout', constants.FLYOVER_PEGOUT_INIT);
    const flyoverFeature = useGetter<(name: FeatureNames) => Feature>('web3Session', constants.SESSION_GET_FEATURE);
    const flyoverEnabled = ref(false);

    onBeforeMount(() => {
      const feature = flyoverFeature.value(FeatureNames.FLYOVER_PEG_OUT);
      if (feature?.value === 'enabled') {
        initFlyover();
        flyoverEnabled.value = true;
      }
    });

    init();

    return {
      flyoverEnabled,
    };
  },
});
</script>
