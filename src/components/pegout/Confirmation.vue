<template>
  <div class="transactions">
    <v-row class="mx-0 d-flex justify-center">
      <v-col cols="10" lg="8" xl="6" class="d-flex justify-center">
        <h1 class="text-center">
            Congratulations Your RBTC were transferred
        </h1>
      </v-col>
    </v-row>
     <v-row class="mx-0 my-8 d-flex justify-center">
      <p class="text-center">
        You can follow the conversion from the status page.
      </p>
    </v-row>
    <v-row class="mx-0 my-8">
      <tx-summary
        :showTxId="true"
        :initialExpand="true"
        :txId="pegoutTxState.txHash"
        :type='typeSummary'
        :orientation='orientationSummary'/>
    </v-row>
    <v-row v-if="confirmTxState.matches(['idle', 'error', 'goingHome'])" class="ma-0">
      <v-col cols="2" class="d-flex justify-start ma-0 py-0" offset="10">
        <v-btn rounded outlined color="#00B520" width="110"
               @click="changePage"
               :disabled="confirmTxState.matches(['error', 'goingHome', 'loading'])">
          <span>Back</span>
        </v-btn>
      </v-col>
    </v-row>
  </div>
</template>

<script lang="ts">
import {
  Component, Prop,
  Emit,
  Vue,
} from 'vue-property-decorator';
import TxSummary from '@/components/exchange/TxSummary.vue';
import { Machine } from '@/services/utils';
import { TxStatusType } from '@/types/store';
import { TxSummaryOrientation } from '@/types/Status';
import { State } from 'vuex-class';
import { PegOutTxState } from '@/types';

@Component({
  components: {
    TxSummary,
  },
})

export default class Confirmation extends Vue {
  typeSummary = TxStatusType.PEGOUT;

  orientationSummary = TxSummaryOrientation.HORIZONTAL;

  @State('pegOutTx') pegoutTxState!: PegOutTxState;

  @Prop() confirmTxState!: Machine<
    'idle'
    | 'loading'
    | 'error'
    | 'goingHome'
    >;

  VALUE_INCOMPLETE_MESSAGE = 'Not Found';

  backPage = 'PegOutForm';

  @Emit('changePage')
  changePage() {
    return this.backPage;
  }
}
</script>
