<template>
  <v-container fluid class="exchange container max-width mx-6">
    <component :is="currentComponent"
    :confirmTxState="confirmTxState"
    @changePage="changePage"/>
  </v-container>
</template>

<script lang="ts">
import { ref, defineComponent, onBeforeMount } from 'vue';
import * as constants from '@/common/store/constants';
import PegOutForm from '@/pegout/components/PegOutForm.vue';
import FlyoverPegout from '@/pegout/components/FlyoverPegout.vue';
import { Machine } from '@/common/utils';
import { useAction, useGetter } from '@/common/store/helper';
import { Feature, FeatureNames } from '@/common/types';
import Confirmation from '../components/Confirmation.vue';

export default defineComponent({
  name: 'PegOut',
  components: {
    PegOutForm,
    Confirmation,
    FlyoverPegout,
  },
  setup() {
    const currentComponent = ref('');
    const confirmTxState = ref<Machine<
      'idle'
      | 'loading'
      | 'error'
      | 'goingHome'
      > >(new Machine('idle'));
    const init = useAction('pegOutTx', constants.PEGOUT_TX_INIT);
    const initFlyover = useAction('flyoverPegout', constants.FLYOVER_PEGOUT_INIT);
    const flyoverFeature = useGetter<(name: FeatureNames) => Feature>('web3Session', constants.SESSION_GET_FEATURE);

    function changePage(componentName: string) {
      currentComponent.value = componentName;
      window.scrollTo(0, 0);
    }

    onBeforeMount(() => {
      const feature = flyoverFeature.value(FeatureNames.FLYOVER_PEG_OUT);
      if (feature?.value === 'enabled') {
        initFlyover();
        currentComponent.value = 'FlyoverPegout';
      } else {
        currentComponent.value = 'PegOutForm';
      }
    });

    init();

    return {
      currentComponent,
      confirmTxState,
      changePage,
    };
  },
});
</script>
