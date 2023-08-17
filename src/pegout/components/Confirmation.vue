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
        Click
        <a
          class="d-inline blackish"
          :href=appConstants.GETTING_FUNDS_DOCUMENTATION_URL
          target="_blank" >here</a>
        to know how to get your funds at the end of the peg-out process.
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
import { computed, PropType, defineComponent } from 'vue';
import { useRouter } from 'vue-router';
import { Machine } from '@/common/utils';
import { TxStatusType } from '@/common/types/store';
import { TxSummaryOrientation } from '@/common/types/Status';
import {
  NormalizedSummary, PegOutTxState, SatoshiBig,
} from '@/common/types';
import TxSummaryFixed from '@/common/components/exchange/TxSummaryFixed.vue';
import * as constants from '@/common/store/constants';
import {
  useAction, useGetter, useState, useStateAttribute,
} from '@/common/store/helper';

export default defineComponent({
  name: 'ConfirmationPegout',
  components: {
    TxSummaryFixed,
  },
  props: {
    confirmTxState: {
      type: Object as PropType<Machine<'idle' | 'loading' | 'error' | 'goingHome'>>,
      required: true,
    },
  },
  setup() {
    const appConstants = constants;
    const typeSummary = TxStatusType.PEGOUT;
    const orientationSummary = TxSummaryOrientation.HORIZONTAL;
    const router = useRouter();

    const pegoutTxState = useState<PegOutTxState>('pegOutTx');
    const btcDerivedAddress = useStateAttribute<string>('web3Session', 'btcDerivedAddress');
    const account = useStateAttribute<string>('web3Session', 'account');
    const clearStatus = useAction('status', constants.STATUS_CLEAR);
    const estimatedBtcToReceive = useGetter<SatoshiBig>('pegOutTx', constants.PEGOUT_TX_GET_ESTIMATED_BTC_TO_RECEIVE);

    const successPegOutSummary = computed((): NormalizedSummary => ({
      amountFromString: pegoutTxState.value.amountToTransfer.toRBTCTrimmedString(),
      amountReceivedString: estimatedBtcToReceive.value.toBTCTrimmedString(),
      estimatedFee: Number(pegoutTxState.value.btcEstimatedFee.toBTCTrimmedString()),
      recipientAddress: btcDerivedAddress.value,
      senderAddress: account.value,
      txId: pegoutTxState.value.txHash,
      gas: Number(pegoutTxState.value.efectivePaidFee?.toRBTCTrimmedString()),
    }));

    function goToStatus() {
      clearStatus();
      router.push({
        name: 'Status',
        params: { txId: String(pegoutTxState.value.txHash) },
      });
    }

    return {
      appConstants,
      successPegOutSummary,
      typeSummary,
      orientationSummary,
      goToStatus,
    };
  },
});
</script>
