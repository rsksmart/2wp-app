<template>
  <div class="transactions">
    <v-row class="mx-0 d-flex justify-center">
      <v-col cols="10" lg="8" xl="6" class="d-flex justify-center">
        <h1 class="text-center">
          Your BTC is on its way!
        </h1>
      </v-col>
    </v-row>
     <v-row class="mx-0 my-8 flex-column text-center">
      <p>
        You can follow the conversion from the status page.
      </p>
      <p class="mt-4">
        Click <a class="d-inline" href="https://developers.rsk.co/guides/two-way-peg-app/getting-started/#getting-funds" target="_blank" >here</a> to know how to get your funds at the end of the peg-out process.
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
      </v-col>
      <v-col cols="10" class="d-flex justify-end ma-0 py-0">
        <v-btn rounded class="big_button" color="#000000" @click="goToStatus">
          <span class="whiteish">Go to status page</span>
        </v-btn>
      </v-col>
    </v-row>
  </div>
</template>

<script lang="ts">
import {
  Component, Prop,
  Vue,
} from 'vue-property-decorator';
import { Machine } from '@/services/utils';
import { TxStatusType } from '@/types/store';
import { TxSummaryOrientation } from '@/types/Status';
import { Getter, State, Action } from 'vuex-class';
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

  @Action(constants.PEGOUT_TX_CLEAR, { namespace: 'pegOutTx' }) clearPegOut !: () => void;

  @Getter(constants.PEGOUT_TX_GET_SAFE_TX_FEE, { namespace: 'pegOutTx' }) safeFee !: WeiBig;

  @Getter(constants.PEGOUT_TX_GET_ESTIMATED_BTC_TO_RECEIVE, { namespace: 'pegOutTx' }) estimatedBtcToReceive !: SatoshiBig;

  @Action(constants.STATUS_CLEAR, { namespace: 'pegOutTx' }) clearPegOutTx !: () => Promise<void>;

  @Prop() confirmTxState!: Machine<
    'idle'
    | 'loading'
    | 'error'
    | 'goingHome'
    >;

  VALUE_INCOMPLETE_MESSAGE = 'Not Found';

  backPage = 'PegOutForm';

  goToHome() {
    this.clearPegOut();
    this.$router.push({
      name: 'Home',
    });
  }

  goToStatus() {
    this.clearPegOutTx();
    this.$router.push({
      name: 'Status',
      params: { txId: String(this.pegoutTxState.txHash) },
    });
  }

  get successPegOutSummary(): NormalizedSummary {
    return {
      amountFromString: this.pegoutTxState.amountToTransfer.toRBTCTrimmedString(),
      amountReceivedString: this.estimatedBtcToReceive.toBTCTrimmedString(),
      estimatedFee: Number(this.pegoutTxState.btcEstimatedFee.toBTCTrimmedString()),
      recipientAddress: this.session.btcDerivedAddress,
      senderAddress: this.session.account,
      txId: this.pegoutTxState.txHash,
      gas: Number(this.pegoutTxState.efectivePaidFee?.toRBTCTrimmedString()),
    };
  }
}
</script>
