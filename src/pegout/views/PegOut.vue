<template>
  <v-container fluid class="exchange container max-width mx-6">
    <component :is="currentComponent"
    :confirmTxState="confirmTxState"
    @changePage="changePage"/>
  </v-container>
</template>

<script lang="ts">
import * as constants from '@/common/store/constants';
import PegOutForm from '@/pegout/components/PegOutForm.vue';
import { Machine } from '@/common/utils';
import { ref } from 'vue';
import { useAction } from '@/common/store/helper';

export default {
  name: 'PegOut',
  setup() {
    const currentComponent = ref('PegOutForm');
    const confirmTxState = ref<Machine<
      'idle'
      | 'loading'
      | 'error'
      | 'goingHome'
      > >(new Machine('idle'));

    const init = useAction('pegOutTx', constants.PEGOUT_TX_INIT);

    function changePage(componentName: string) {
      currentComponent.value = componentName;
      window.scrollTo(0, 0);
    }

    init();

    return {
      currentComponent,
      confirmTxState,
      changePage,
    };
  }
}

// @Component({
//   components: {
//     PegOutForm,
//     Confirmation,
//   },
// })
// class PegOut extends Vue {
//   @Action(constants.PEGOUT_TX_INIT, { namespace: 'pegOutTx' }) init !: () => Promise<void>;
//
//   currentComponent = 'PegOutForm';
//
//   confirmTxState: Machine<
//     'idle'
//     | 'loading'
//     | 'error'
//     | 'goingHome'
//     > = new Machine('idle');
//
//   created() {
//     this.init();
//   }
//
//   @Emit()
//   changePage(componentName: string) {
//     this.currentComponent = componentName;
//     window.scrollTo(0, 0);
//   }
// }
</script>
