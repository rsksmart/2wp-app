<template>
  <v-container fluid class="exchange container max-width">
    <div v-if="loadingProviders"
      class="d-flex justify-center"
      style="position: absolute; top: 40%; left: 50%; transform: translate(-50%, -50%);">
        <v-progress-circular
          :size="250"
          :width="18"
          color="warning"
          indeterminate />
    </div>
    <pegout-form v-else :flyoverEnabled="flyoverEnabled" />
  </v-container>
</template>

<script lang="ts">
import {
  ref, defineComponent, onBeforeMount,
} from 'vue';
import * as constants from '@/common/store/constants';
import PegoutForm from '@/pegout/components/PegoutForm.vue';
import { useAction, useGetter, useStateAttribute } from '@/common/store/helper';
import { Feature, FeatureNames } from '@/common/types';
import { providers } from 'ethers';

export default defineComponent({
  name: 'PegOut',
  components: {
    PegoutForm,
  },
  setup() {
    const ethersProvider = useStateAttribute<providers.Web3Provider>('web3Session', 'ethersProvider');
    const init = useAction('pegOutTx', constants.PEGOUT_TX_INIT);
    const initFlyover = useAction('flyoverPegout', constants.FLYOVER_PEGOUT_INIT);
    const flyoverFeature = useGetter<(name: FeatureNames) => Feature>('web3Session', constants.SESSION_GET_FEATURE);
    const flyoverEnabled = ref(false);
    const loadingProviders = ref(true);

    onBeforeMount(() => {
      const feature = flyoverFeature.value(FeatureNames.FLYOVER_PEG_OUT);
      if (feature?.value === constants.ENABLED) {
        initFlyover(ethersProvider.value)
          .then(() => {
            flyoverEnabled.value = true;
            loadingProviders.value = false;
          })
          .catch(() => {
            flyoverEnabled.value = false;
            loadingProviders.value = false;
          });
      } else loadingProviders.value = false;
    });

    init();

    return {
      flyoverEnabled,
      loadingProviders,
    };
  },
});
</script>
