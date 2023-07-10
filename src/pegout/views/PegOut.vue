<template>
  <v-container fluid class="exchange container max-width mx-6">
    <component :is="currentComponent"
    :confirmTxState="confirmTxState"
    @changePage="changePage"/>
  </v-container>
</template>

<script lang="ts">
import { Component, Vue, Emit } from 'vue-facing-decorator';
import { Action } from 'vuex-class';
import * as constants from '@/common/store/constants';
import PegOutForm from '@/pegout/components/PegOutForm.vue';
import Confirmation from '@/pegout/components/Confirmation.vue';
import { Machine } from '@/common/utils';

@Component({
  components: {
    PegOutForm,
    Confirmation,
  },
})
export default class PegOut extends Vue {
  @Action(constants.PEGOUT_TX_INIT, { namespace: 'pegOutTx' }) init !: () => Promise<void>;

  currentComponent = 'PegOutForm';

  confirmTxState: Machine<
    'idle'
    | 'loading'
    | 'error'
    | 'goingHome'
    > = new Machine('idle');

  created() {
    this.init();
  }

  @Emit()
  changePage(componentName: string) {
    this.currentComponent = componentName;
    window.scrollTo(0, 0);
  }
}
</script>
