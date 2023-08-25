<template>
  <v-col>
      <v-row justify="center" class="mt-1">
        <pegout-progress-bar/>
         <tx-summary-fixed
           :summary="txPegoutSummary"
           :initialExpand="true"
           :type="typeSummary"
           :txId="txId"
           :isRejected="isRejectedPegout"
           :orientation="orientationSummary"/>
      </v-row>
  </v-col>
</template>

<script lang="ts">
import {
  SatoshiBig,
  TxStatusType,
  TxSummaryOrientation,
  PegoutStatus,
  PegoutStatusDataModel, NormalizedSummary,
} from '@/common/types';
import * as constants from '@/common/store/constants';
import PegoutProgressBar from '@/common/components/status/PegoutProgressBar.vue';
import TxSummaryFixed from '@/common/components/exchange/TxSummaryFixed.vue';
import { useStateAttribute } from '@/common/store/helper';
import { computed } from 'vue';


export default {
  name: 'TxPegout',
  components: {
    PegoutProgressBar,
    TxSummaryFixed,
  },
  props: {
    txId: String,
  },
  setup() {
    const typeSummary = TxStatusType.PEGOUT;
    const orientationSummary = TxSummaryOrientation.HORIZONTAL;

    const txDetails = useStateAttribute<PegoutStatusDataModel>('status', 'txDetails');
    const pegOutEstimatedFee = useStateAttribute<SatoshiBig>('status', 'pegOutEstimatedFee');

    const txPegoutSummary = computed((): NormalizedSummary => {
      const status = txDetails.value;
      return {
        amountFromString: new SatoshiBig(status.valueRequestedInSatoshis, 'satoshi').toBTCTrimmedString(),
        amountReceivedString: amountToBeReceived.value,
        fee: Number(new SatoshiBig(status.feeInSatoshisToBePaid || 0, 'satoshi').toBTCTrimmedString()),
        recipientAddress: status.btcRecipientAddress,
        senderAddress: status.rskSenderAddress,
        txId: status.rskTxHash ? status.rskTxHash : this.txId,
        estimatedFee: Number(pegOutEstimatedFee.value.toBTCTrimmedString()),
      };
    });

    const amountToBeReceived = computed((): string => {
      const status = txDetails.value;
      if (isRejectedPegout.value) {
        return '';
      }
      if (status.valueInSatoshisToBeReceived) {
        return new SatoshiBig(status.valueInSatoshisToBeReceived, 'satoshi').toBTCTrimmedString();
      }
      const requestedAmount = new SatoshiBig(status.valueRequestedInSatoshis, 'satoshi');
      return requestedAmount.minus(pegOutEstimatedFee.value).toBTCTrimmedString();
    });

    const isRejectedPegout = computed(() => {
      return txDetails.value.status === PegoutStatus.REJECTED;
    });

    return {
      typeSummary,
      orientationSummary,
      txPegoutSummary,
      isRejectedPegout,
    };
  }
}
</script>