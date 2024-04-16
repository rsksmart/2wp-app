<template>
  <v-col>
      <v-row justify="center" class="mt-1">
        <pegout-progress-bar v-if="!isFlyover"/>
        <tx-summary-fixed
          :summary="summary"
          :initialExpand="true"
          :type="typeSummary"
          :txId="txId"
          :isRejected="isRejectedPegout"
          :orientation="orientationSummary"/>
      </v-row>
  </v-col>
</template>

<script lang="ts">
import { computed, defineComponent } from 'vue';
import {
  SatoshiBig,
  TxStatusType,
  TxSummaryOrientation,
  PegoutStatus,
  PegoutStatusDataModel, NormalizedSummary, FlyoverStatusModel,
} from '@/common/types';
import PegoutProgressBar from '@/common/components/status/PegoutProgressBar.vue';
import { useStateAttribute } from '@/common/store/helper';
import TxSummaryFixed from '@/common/components/exchange/TxSummaryFixed.vue';

export default defineComponent({
  name: 'TxPegout',
  components: {
    PegoutProgressBar,
    TxSummaryFixed,
  },
  props: {
    txId: String,
    isFlyover: Boolean,
  },
  setup(props) {
    const typeSummary = TxStatusType.PEGOUT;
    const orientationSummary = TxSummaryOrientation.HORIZONTAL;

    const txDetails = useStateAttribute<PegoutStatusDataModel | FlyoverStatusModel>('status', 'txDetails');
    const pegOutEstimatedFee = useStateAttribute<SatoshiBig>('status', 'pegOutEstimatedFee');

    const isRejectedPegout = computed(() => txDetails.value.status === PegoutStatus.REJECTED);

    const amountToBeReceived = computed((): string => {
      const status = txDetails.value as PegoutStatusDataModel;
      if (isRejectedPegout.value) {
        return '';
      }
      if (status.valueInSatoshisToBeReceived) {
        return new SatoshiBig(status.valueInSatoshisToBeReceived, 'satoshi').toBTCTrimmedString();
      }
      const requestedAmount = new SatoshiBig(status.valueRequestedInSatoshis, 'satoshi');
      return requestedAmount.minus(pegOutEstimatedFee.value).toBTCTrimmedString();
    });

    const txPegoutSummary = computed((): NormalizedSummary => {
      const status = txDetails.value as PegoutStatusDataModel;
      return {
        amountFromString: new SatoshiBig(status.valueRequestedInSatoshis, 'satoshi').toBTCTrimmedString(),
        amountReceivedString: amountToBeReceived.value,
        fee: Number(new SatoshiBig(status.feeInSatoshisToBePaid ?? 0, 'satoshi').toBTCTrimmedString()),
        recipientAddress: status.btcRecipientAddress,
        senderAddress: status.rskSenderAddress,
        txId: status.rskTxHash ? status.rskTxHash : props.txId,
        estimatedFee: Number(pegOutEstimatedFee.value.toBTCTrimmedString()),
      };
    });

    const flyoverPegoutSummary = computed((): NormalizedSummary => {
      const status = txDetails.value as FlyoverStatusModel;
      const amount = new SatoshiBig(status.amount, 'btc');
      const fee = new SatoshiBig(status.fee, 'btc');
      const totalAmount = amount.plus(fee).toBTCTrimmedString();
      return {
        amountFromString: totalAmount,
        amountReceivedString: amount.toBTCTrimmedString(),
        fee: Number(fee.toBTCTrimmedString()),
        recipientAddress: status.recipientAddress,
        senderAddress: status.senderAddress,
        txId: props.txId,
      };
    });

    const summary = computed(() => (props.isFlyover
      ? flyoverPegoutSummary.value
      : txPegoutSummary.value));

    return {
      typeSummary,
      orientationSummary,
      summary,
      isRejectedPegout,
    };
  },
});
</script>
