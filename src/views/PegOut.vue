<template>
  <v-container fluid class="exchange normalized-height container
  max-width mx-6 pt-6">
    <component :is="currentComponent"
    :confirmTxState="confirmTxState"
    @changePage="changePage"/>
  </v-container>
</template>

<script lang="ts">
import { Component, Vue, Emit } from 'vue-property-decorator';
import { Action } from 'vuex-class';
import * as constants from '@/store/constants';
import PegOutForm from '@/components/pegout/PegOutForm.vue';
import Confirmation from '@/components/pegout/Confirmation.vue';
import { Machine } from '@/services/utils';

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
  }
}
</script>
