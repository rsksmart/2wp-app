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
  TxStatus,
} from '@/common/types';
import StatusProgressBar from '@/common/components/status/StatusProgressBar.vue';
import { useStateAttribute } from '@/common/store/helper';
import StatusSummary from '@/common/components/status/StatusSummary.vue';
import { bigNumberToSatoshiBigIntString, toWeiBigIntString } from '@/common/utils';

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
    const flyoverStatus = useStateAttribute<TxStatus['flyoverStatus']>('status', 'flyoverStatus');
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
      const valueRequested = bigNumberToSatoshiBigIntString(status.valueRequestedInSatoshis);
      const amountSent = new WeiBig(valueRequested, 'rbtc')
        .plus(calculatedGasFee.value).toRBTCTrimmedString();
      const btcTxId = status.status === PegoutStatus.RELEASE_BTC ? status.btcTxId : '';
      return {
        amountFromString: amountSent,
        amountReceivedString: amountToBeReceived.value,
        gas: calculatedGasFee.value.toString(),
        fee: status.feeInSatoshisToBePaid ?? '0',
        recipientAddress: status.btcRecipientAddress,
        senderAddress: status.rskSenderAddress,
        txId: status.rskTxHash ? status.rskTxHash : props.txId,
        estimatedFee: pegOutEstimatedFee.value.toString(),
        status: status.status,
        btcTxId,
      };
    });

    const flyoverPegoutSummary = computed((): NormalizedSummary => {
      const status = txDetails.value as FlyoverStatusModel;
      const amount = toWeiBigIntString(status.amount);
      const fee = toWeiBigIntString(status.fee);
      const total = new WeiBig(amount, 'wei')
        .plus(new WeiBig(fee, 'wei'));
      return {
        amountFromString: total.toRBTCTrimmedString(),
        amountReceivedString: status.amount,
        fee: status.fee,
        recipientAddress: status.recipientAddress,
        senderAddress: status.senderAddress,
        txId: status.txHash,
        btcTxId: flyoverStatus.value?.txId,
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
