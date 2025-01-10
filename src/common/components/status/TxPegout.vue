<template>
  <v-container>
    <v-row class="mb-4">
      <status-progress-bar :isFlyover="isFlyover" :txNotFound="txNotFound"
                           :txWithError="txWithError"/>
    </v-row>
      <status-summary :details="summary" :type="typeSummary"
                      :txWithError="txWithError" />
  </v-container>
</template>

<script lang="ts">
import { computed, defineComponent } from 'vue';
import {
  SatoshiBig,
  TxStatusType,
  PegoutStatus,
  PegoutStatusDataModel,
  NormalizedSummary,
  FlyoverStatusModel,
  WeiBig,
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
    txNotFound: Boolean,
    txWithError: Boolean,
  },
  setup(props) {
    const typeSummary = props.isFlyover ? TxStatusType.FLYOVER_PEGOUT : TxStatusType.PEGOUT;

    const txDetails = useStateAttribute<PegoutStatusDataModel | FlyoverStatusModel>('status', 'txDetails');
    const pegOutEstimatedFee = useStateAttribute<SatoshiBig>('status', 'pegOutEstimatedFee');
    const calculatedGasFee = useStateAttribute<WeiBig>('pegOutTx', 'calculatedFee');

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
      const valueRequested = new SatoshiBig(status.valueRequestedInSatoshis, 'satoshi').toBTCTrimmedString();
      const amountSent = new WeiBig(valueRequested, 'rbtc').plus(calculatedGasFee.value).toRBTCTrimmedString();
      const btcTxId = status.status === PegoutStatus.RELEASE_BTC ? status.btcTxId : '';
      return {
        amountFromString: amountSent,
        amountReceivedString: amountToBeReceived.value,
        gas: calculatedGasFee.value,
        fee: status.feeInSatoshisToBePaid ?? BigInt(0),
        recipientAddress: status.btcRecipientAddress,
        senderAddress: status.rskSenderAddress,
        txId: status.rskTxHash ? status.rskTxHash : props.txId,
        estimatedFee: pegOutEstimatedFee.value.toSatoshiBigInt(),
        status: status.status,
        btcTxId,
      };
    });

    const flyoverPegoutSummary = computed((): NormalizedSummary => {
      const status = txDetails.value as FlyoverStatusModel;
      const amount = new WeiBig(status.amount, 'wei');
      const fee = new WeiBig(status.fee, 'wei');
      const total = amount.plus(fee);
      return {
        amountFromString: total.toRBTCTrimmedString(),
        amountReceivedString: amount.toRBTCTrimmedString(),
        fee: fee.toWeiBigInt(),
        recipientAddress: status.recipientAddress,
        senderAddress: status.senderAddress,
        txId: status.txHash,
      };
    });

    const summary = computed(() => (props.isFlyover
      ? flyoverPegoutSummary.value
      : txPegoutSummary.value));

    return {
      typeSummary,
      summary,
      isRejectedPegout,
    };
  },
});
</script>
