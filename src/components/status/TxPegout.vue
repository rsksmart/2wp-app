<template>
  <v-col>
      <v-row justify="center" class="mt-6">
        <pegout-progress-bar/>
         <tx-summary
          :txId="txId"
          :showTxId="true"
          :initialExpand="true"
          :type="typeSummary"
          :orientation="orientationSummary"/>
      </v-row>
  </v-col>
</template>

<script lang="ts">
import {
  Component,
  Prop,
  Vue,
} from 'vue-property-decorator';
import {
  TxStatus,
  TxStatusType,
  TxSummaryOrientation,
} from '@/types';
import { State, Getter } from 'vuex-class';
import * as constants from '@/store/constants';
import PegoutProgressBar from '@/components/status/PegoutProgressBar.vue';
import TxSummary from '@/components/exchange/TxSummary.vue';

@Component({
  components: {
    PegoutProgressBar,
    TxSummary,
  },
})
export default class TxPegout extends Vue {
  typeSummary = TxStatusType.PEGOUT;

  orientationSummary = TxSummaryOrientation.HORIZONTAL;

  @Prop() txId!: string;

  @State('status') txStatus!: TxStatus;

  @Getter(constants.STATUS_IS_REJECTED, { namespace: 'status' }) isRejected!: boolean;
}
</script>
