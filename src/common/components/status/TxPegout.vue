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
import { computed, defineComponent } from 'vue';
import {
  SatoshiBig,
  TxStatusType,
  TxSummaryOrientation,
  PegoutStatus,
  PegoutStatusDataModel, NormalizedSummary,
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
  },
  setup(props) {
    const typeSummary = TxStatusType.PEGOUT;
    const orientationSummary = TxSummaryOrientation.HORIZONTAL;

    const txDetails = useStateAttribute<PegoutStatusDataModel>('status', 'txDetails');
    const pegOutEstimatedFee = useStateAttribute<SatoshiBig>('status', 'pegOutEstimatedFee');

    const isRejectedPegout = computed(() => txDetails.value.status === PegoutStatus.REJECTED);

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

    const txPegoutSummary = computed((): NormalizedSummary => {
      const status = txDetails.value;
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

    return {
      typeSummary,
      orientationSummary,
      txPegoutSummary,
      isRejectedPegout,
    };
  },
});

// @Component({
//   components: {
//     PegoutProgressBar,
//     TxSummaryFixed,
//   },
// })
// class TxPegout extends Vue {
//   typeSummary = TxStatusType.PEGOUT;
//
//   orientationSummary = TxSummaryOrientation.HORIZONTAL;
//
//   @Prop() txId!: string;
//
//   @State('status') txStatus!: TxStatus;
//
//   @Getter(constants.STATUS_IS_REJECTED, { namespace: 'status' }) isRejected!: boolean;
//
//   get txPegoutSummary(): NormalizedSummary {
//     const status = this.txStatus.txDetails as PegoutStatusDataModel;
//     return {
//       amountFromString: new SatoshiBig(status.valueRequestedInSatoshis, 'satoshi').toBTCTrimmedString(),
//       amountReceivedString: this.amountToBeReceived,
//       fee: Number(new SatoshiBig(status.feeInSatoshisToBePaid || 0, 'satoshi').toBTCTrimmedString()),
//       recipientAddress: status.btcRecipientAddress,
//       senderAddress: status.rskSenderAddress,
//       txId: status.rskTxHash ? status.rskTxHash : this.txId,
//       estimatedFee: Number(this.txStatus.pegOutEstimatedFee.toBTCTrimmedString()),
//     };
//   }
//
//   get amountToBeReceived(): string {
//     const status = this.txStatus.txDetails as PegoutStatusDataModel;
//     if (this.isRejectedPegout) {
//       return '';
//     }
//     if (status.valueInSatoshisToBeReceived) {
//       return new SatoshiBig(status.valueInSatoshisToBeReceived, 'satoshi').toBTCTrimmedString();
//     }
//     const requestedAmount = new SatoshiBig(status.valueRequestedInSatoshis, 'satoshi');
//     return requestedAmount.minus(this.txStatus.pegOutEstimatedFee).toBTCTrimmedString();
//   }
//
//   get isRejectedPegout() {
//     return this.txStatus.txDetails?.status === PegoutStatus.REJECTED;
//   }
// }
</script>
