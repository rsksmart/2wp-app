<template>
  <v-container fluid class="exchange normalized-height container
  max-width mx-6 pt-6">
  <template v-if="showDialog">
      <disclaimer-dialog :showDialog="showDialog" @closeDialog="closeDialog"
      :from="from" :to="to" :cookie="cookie" :hours="hours"
      :blockConfirmations="blockConfirmations" :network="network"/>
    </template>
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
import EnvironmentContextProviderService from '@/providers/EnvironmentContextProvider';
import DisclaimerDialog from '@/components/exchange/DisclaimerDialog.vue';

@Component({
  components: {
    PegOutForm,
    Confirmation,
    DisclaimerDialog,
  },
})
export default class PegOut extends Vue {
  @Action(constants.PEGOUT_TX_INIT, { namespace: 'pegOutTx' }) init !: () => Promise<void>;

  currentComponent = 'PegOutForm';

  environmentContext = EnvironmentContextProviderService.getEnvironmentContext();

  showDialog = false;

  from = this.environmentContext.getRbtcTicker();

  to = this.environmentContext.getBtcTicker();

  cookie = 'RTBD_COOKIE_DISABLED';

  hours = 34;

  blockConfirmations = 4000;

  network = this.environmentContext.getRskText();

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
  closeDialog() {
    this.showDialog = false;
  }

  beforeMount() {
    this.showDialog = localStorage.getItem(this.cookie) !== 'true';
  }

  @Emit()
  changePage(componentName: string) {
    this.currentComponent = componentName;
  }
}
</script>
