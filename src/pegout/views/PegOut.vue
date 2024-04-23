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
import { useAction } from '@/common/store/helper';
import { ApiService } from '@/common/services';
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

    function changePage(componentName: string) {
      currentComponent.value = componentName;
      window.scrollTo(0, 0);
    }

    onBeforeMount(() => {
      ApiService.getFeatures()
        .then((features) => {
          const flag = features.find((feature) => feature.name === 'flyover_pegout');
          if (flag?.value === 'enabled') {
            initFlyover();
            currentComponent.value = 'FlyoverPegout';
          } else {
            currentComponent.value = 'PegOutForm';
          }
        })
        .catch(() => {
          currentComponent.value = 'PegOutForm';
        });
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
