<template>
  <v-container class="px-0">
    <v-row class="mb-16">
      <status-progress-bar :isFlyover="isFlyover" :txNotFound="txNotFound"
                           :txWithError="txWithError" :details="summary" />
    </v-row>
    <v-row class="mt-16">
      <status-summary :details="summary" :type="typeSummary"
                      :txWithError="txWithError" />
    </v-row>
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
import {
  toWeiBigIntString,
  toSatoshiBigIntString,
} from '@/common/utils';

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
        return '0';
      }
      if (status.valueInSatoshisToBeReceived) {
        return new SatoshiBig(status.valueInSatoshisToBeReceived, 'satoshi').toBTCTrimmedString();
      }
      const requestedAmount = new WeiBig(status.valueRequestedInSatoshis, 'wei');
      const requestedAmountString = toWeiBigIntString(requestedAmount.toRBTCTrimmedString());
      const pegOutEstimatedString = toWeiBigIntString(pegOutEstimatedFee.value
        .toBTCTrimmedString());
      const amountToReceive = new WeiBig(BigInt(requestedAmountString) - BigInt(pegOutEstimatedString), 'wei');
      return amountToReceive.toRBTCTrimmedString();
    });

    const txPegoutSummary = computed((): NormalizedSummary => {
      const status = txDetails.value as PegoutStatusDataModel;
      const valueRequested = new SatoshiBig(status.valueRequestedInSatoshis, 'satoshi');
      const amountSent = new WeiBig(toSatoshiBigIntString(valueRequested.toBTCTrimmedString()), 'wei').plus(calculatedGasFee.value);
      const btcTxId = status.status === PegoutStatus.RELEASE_BTC ? status.btcTxId : '';
      return {
        amountFromString: isRejectedPegout.value ? valueRequested.toBTCTrimmedString()
          : amountSent.toRBTCTrimmedString(),
        amountReceivedString: amountToBeReceived.value,
        gas: calculatedGasFee.value.toRBTCTrimmedString(),
        fee: status.feeInSatoshisToBePaid ?? '0',
        recipientAddress: status.btcRecipientAddress,
        senderAddress: status.rskSenderAddress,
        txId: status.rskTxHash ? status.rskTxHash : props.txId,
        estimatedFee: pegOutEstimatedFee.value.toBTCTrimmedString(),
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
