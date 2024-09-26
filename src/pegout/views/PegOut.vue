<template>
  <v-container fluid class="exchange container max-width">
    <component :is="currentComponent"
    :flyoverEnabled="flyoverEnabled"
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

export default defineComponent({
  name: 'PegOut',
  components: {
    PegOutForm,
    FlyoverPegout,
  },
  setup() {
    const currentComponent = ref('FlyoverPegout');
    const confirmTxState = ref<Machine<
      'idle'
      | 'loading'
      | 'error'
      | 'goingHome'
      > >(new Machine('idle'));
    const init = useAction('pegOutTx', constants.PEGOUT_TX_INIT);
    const initFlyover = useAction('flyoverPegout', constants.FLYOVER_PEGOUT_INIT);
    const getBalance = useAction('web3Session', constants.WEB3_SESSION_ADD_BALANCE);
    const flyoverFeature = useGetter<(name: FeatureNames) => Feature>('web3Session', constants.SESSION_GET_FEATURE);
    const flyoverEnabled = ref(false);

    function changePage(componentName: string) {
      currentComponent.value = componentName;
      window.scrollTo(0, 0);
    }

    onBeforeMount(() => {
      const feature = flyoverFeature.value(FeatureNames.FLYOVER_PEG_OUT);
      if (feature?.value === 'enabled') {
        initFlyover();
        flyoverEnabled.value = true;
      }
    });

    init();
    getBalance();

    return {
      currentComponent,
      confirmTxState,
      changePage,
      flyoverEnabled,
    };
  },
});
</script>
