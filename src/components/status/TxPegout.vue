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
  PegoutStatus,
  TxSummaryOrientation,
  WeiBig,
  PegoutStatusDataModel, NormalizedSummary,
} from '@/types';
import { State, Getter, Action } from 'vuex-class';
import * as constants from '@/store/constants';
import PegoutProgressBar from '@/components/status/PegoutProgressBar.vue';
import TxSummaryFixed from '@/components/exchange/TxSummaryFixed.vue';

@Component({
  components: {
    PegoutProgressBar,
    TxSummaryFixed,
  },
})
export default class TxPegout extends Vue {
  typeSummary = TxStatusType.PEGOUT;

  orientationSummary = TxSummaryOrientation.HORIZONTAL;

  currentFee = new SatoshiBig('0', 'btc');

  currentRefundAddress = '';

  @Prop() txId!: string;

  @State('status') txStatus!: TxStatus;

  @Action(constants.PEGOUT_TX_ADD_AMOUNT, { namespace: 'pegOutTx' }) setAmount!: (amount: WeiBig) => void;

  @Getter(constants.STATUS_IS_REJECTED, { namespace: 'status' }) isRejected!: boolean;

  get txPegoutSummary(): NormalizedSummary {
    const status = this.txStatus.txDetails as PegoutStatusDataModel;
    return {
      amountFromString: new SatoshiBig(status.valueRequestedInSatoshis, 'satoshi').toBTCTrimmedString(),
      amountReceivedString: new SatoshiBig(status.valueInSatoshisToBeReceived, 'satoshi').toBTCTrimmedString(),
      fee: status.feeInSatoshisToBePaid || 0,
      recipientAddress: status.btcRecipientAddress,
      senderAddress: status.rskSenderAddress,
      txId: status.rskTxHash,
      estimatedFee: Number(this.txStatus.pegOutEstimatedFee.toSatoshiString()),
    };
  }

  get isRejectedPegout() {
    return this.txStatus.txDetails?.status === PegoutStatus.REJECTED;
  }

  setSummaryData() {
    const pegoutStatusDataModel = this.txStatus?.txDetails as PegoutStatusDataModel;

    const txData = {
      amount: new SatoshiBig(pegoutStatusDataModel.valueRequestedInSatoshis, 'btc'),
      recipient: pegoutStatusDataModel.btcRecipientAddress,
      refundAddress: pegoutStatusDataModel.rskSenderAddress,
      feeBTC: new SatoshiBig(pegoutStatusDataModel.fees ? pegoutStatusDataModel.fees : 0, 'btc'),
      change: '',
    };
    this.setAmount(new WeiBig(pegoutStatusDataModel.valueRequestedInSatoshis * 10000000000, 'wei'));
    this.currentRefundAddress = txData.refundAddress;
    this.currentFee = txData.feeBTC;
  }

  created() {
    this.setSummaryData();
  }
}
</script>
