<template>
  <v-col>
      <v-row justify="center" class="mt-6">
        <pegout-progress-bar/>
         <tx-summary
          :txId="txId"
          :statusFee="currentFee"
          :showTxId="true"
          :initialExpand="true"
          :type="typeSummary"
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
  PegoutStatusDataModel,
} from '@/types';
import { State, Getter, Action } from 'vuex-class';
import * as constants from '@/store/constants';
import PegoutProgressBar from '@/components/status/PegoutProgressBar.vue';
import TxSummary from '@/components/exchange/TxSummary.vue';

@Component({
  components: {
    PegoutProgressBar,
    TxSummary,
  },
})
export default class TxPegout extends Vue {
  typeSummary = TxStatusType.PEGOUT;

  orientationSummary = TxSummaryOrientation.HORIZONTAL;

  currentFee = new SatoshiBig('0', 'btc');

  @Prop() txId!: string;

  @State('status') txStatus!: TxStatus;

  @Action(constants.PEGIN_TX_ADD_AMOUNT_TO_TRANSFER, { namespace: 'pegInTx' }) setAmount!: (amount: SatoshiBig) => void;

  @Action(constants.PEGIN_TX_INIT, { namespace: 'pegInTx' }) peginInit!: () => void;

  @Action(constants.PEGIN_TX_ADD_RSK_ADDRESS, { namespace: 'pegInTx' }) setRskAddress!: (address: string) => void;

  @Getter(constants.STATUS_IS_REJECTED, { namespace: 'status' }) isRejected!: boolean;

  setSummaryData() {
    console.log(this.txStatus);
    const pegoutStatusDataModel = this.txStatus?.txDetails as PegoutStatusDataModel;

    const txData = {
      amount: new SatoshiBig(pegoutStatusDataModel.valueRequestedInSatoshis, 'btc'),
      recipient: pegoutStatusDataModel.btcRecipientAddress,
      feeBTC: new SatoshiBig(pegoutStatusDataModel.fees ? pegoutStatusDataModel.fees : 0, 'btc'),
      change: '',
    };
    this.peginInit();
    this.setAmount(txData.amount);
    this.currentFee = txData.feeBTC;
    this.setRskAddress(txData.recipient);
  }

  created() {
    this.setSummaryData();
  }
}
</script>
