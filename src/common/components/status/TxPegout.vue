<template>
  <v-container>
    <v-row>
      <status-progress-bar :isFlyover="isFlyover"/>
    </v-row>
      <status-summary :details="txPegoutSummary" :type="typeSummary"></status-summary>
  </v-container>
</template>

<script lang="ts">
import { computed, defineComponent } from 'vue';
import {
  SatoshiBig,
  TxStatusType,
  PegoutStatus,
  PegoutStatusDataModel, NormalizedSummary, FlyoverStatusModel,
} from '@/common/types';
import StatusProgressBar from '@/common/components/status/StatusProgressBar.vue';
import { useStateAttribute } from '@/common/store/helper';
import StatusSummary from '@/common/components/status/StatusSummary.vue';

export default defineComponent({
  name: 'TxPegout',
  components: {
    StatusProgressBar,
    StatusSummary,
  },
  props: {
    txId: String,
    isFlyover: Boolean,
  },
  setup(props) {
    const typeSummary = TxStatusType.PEGOUT;

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
      txPegoutSummary,
      summary,
      isRejectedPegout,
    };
  },
});
</script>
