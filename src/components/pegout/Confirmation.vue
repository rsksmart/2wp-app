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
      <tx-summary-fixed
        :summary="successPegOutSummary"
        :initialExpand="true"
        :type="typeSummary"
        :orientation="orientationSummary"/>
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
import { Machine } from '@/services/utils';
import { TxStatusType } from '@/types/store';
import { TxSummaryOrientation } from '@/types/Status';
import { Getter, State } from 'vuex-class';
import {
  NormalizedSummary, PegOutTxState, SatoshiBig, SessionState, WeiBig,
} from '@/types';
import TxSummaryFixed from '@/components/exchange/TxSummaryFixed.vue';
import * as constants from '@/store/constants';

@Component({
  components: {
    TxSummaryFixed,
  },
})

export default class Confirmation extends Vue {
  typeSummary = TxStatusType.PEGOUT;

  orientationSummary = TxSummaryOrientation.HORIZONTAL;

  @State('pegOutTx') pegoutTxState!: PegOutTxState;

  @State('web3Session') session !: SessionState;

  @Getter(constants.PEGOUT_TX_GET_SAFE_TX_FEE, { namespace: 'pegOutTx' }) safeFee !: WeiBig;

  @Getter(constants.PEGOUT_TX_GET_ESTIMATED_BTC_TO_RECEIVE, { namespace: 'pegOutTx' }) estimatedBtcToReceive !: SatoshiBig;

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

  get successPegOutSummary(): NormalizedSummary {
    return {
      amountFromString: this.pegoutTxState.amountToTransfer.toRBTCTrimmedString(),
      amountReceivedString: this.estimatedBtcToReceive.toBTCTrimmedString(),
      fee: Number(this.pegoutTxState.btcEstimatedFee.toBTCTrimmedString()),
      recipientAddress: this.session.btcDerivedAddress,
      senderAddress: this.session.account,
      txId: this.pegoutTxState.txHash,
      gas: Number(this.pegoutTxState.efectivePaidFee?.toRBTCTrimmedString()),
    };
  }
}
</script>
