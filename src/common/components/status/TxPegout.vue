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
  Component,
  Prop,
  Vue,
} from 'vue-property-decorator';
import {
  TxStatus,
  SatoshiBig,
  TxStatusType,
  TxSummaryOrientation,
  PegoutStatus,
  PegoutStatusDataModel, NormalizedSummary,
} from '@/common/types';
import { State, Getter } from 'vuex-class';
import * as constants from '@/common/store/constants';
import PegoutProgressBar from '@/common/components/status/PegoutProgressBar.vue';
import TxSummaryFixed from '@/common/components/exchange/TxSummaryFixed.vue';

@Component({
  components: {
    PegoutProgressBar,
    TxSummaryFixed,
  },
})
export default class TxPegout extends Vue {
  typeSummary = TxStatusType.PEGOUT;

  orientationSummary = TxSummaryOrientation.HORIZONTAL;

  @Prop() txId!: string;

  @State('status') txStatus!: TxStatus;

  @Getter(constants.STATUS_IS_REJECTED, { namespace: 'status' }) isRejected!: boolean;

  get txPegoutSummary(): NormalizedSummary {
    const status = this.txStatus.txDetails as PegoutStatusDataModel;
    return {
      amountFromString: new SatoshiBig(status.valueRequestedInSatoshis, 'satoshi').toBTCTrimmedString(),
      amountReceivedString: this.amountToBeReceived,
      fee: Number(new SatoshiBig(status.feeInSatoshisToBePaid || 0, 'satoshi').toBTCTrimmedString()),
      recipientAddress: status.btcRecipientAddress,
      senderAddress: status.rskSenderAddress,
      txId: status.rskTxHash ? status.rskTxHash : this.txId,
      estimatedFee: Number(this.txStatus.pegOutEstimatedFee.toBTCTrimmedString()),
    };
  }

  get amountToBeReceived(): string {
    const status = this.txStatus.txDetails as PegoutStatusDataModel;
    if (this.isRejectedPegout) {
      return '';
    }
    if (status.valueInSatoshisToBeReceived) {
      return new SatoshiBig(status.valueInSatoshisToBeReceived, 'satoshi').toBTCTrimmedString();
    }
    const requestedAmount = new SatoshiBig(status.valueRequestedInSatoshis, 'satoshi');
    return requestedAmount.minus(this.txStatus.pegOutEstimatedFee).toBTCTrimmedString();
  }

  get isRejectedPegout() {
    return this.txStatus.txDetails?.status === PegoutStatus.REJECTED;
  }
}
</script>
