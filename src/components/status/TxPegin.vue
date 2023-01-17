<template>
  <v-col>
    <v-container fluid class="pa-0 mb-10 mt-0 max-width">
      <v-row justify="center" class="mt-6">
        <v-col class="ma-0 pa-0" cols="7">

          <!-- isReject -->
          <v-row v-if="isRejected" class="mx-0 d-flex justify-center progress-bar">
            <v-col cols="8" class="pa-0 d-flex justify-center">
              <v-row>
                <div class="rsk-icon-green">
                  <v-row>
                    <v-img class="icon-status-image
                      icon-rootstock-image-reject
                      icon-status-border-yellow d-flex justify-center"
                      src="@/assets/status/rootstock.png" height="78" contain/>
                  </v-row>
                  <v-row class="mt-4">
                    <h1>{{environmentContext.getRskText()}} Network</h1>
                  </v-row>
                </div>
                <v-progress-linear
                  :value="btcConfirmationsPercentage"
                  color="#F6C61B"
                  height="19"/>
                <div class="d-flex justify-end">
                  <div class="bitcoin-icon-yellow">
                    <v-row>
                      <v-img class="icon-status-image
                        icon-btc-image-reject
                        icon-status-border-yellow d-flex justify-center"
                        src="@/assets/status/btc.png" height="78" contain/>
                    </v-row>
                    <v-row class="mt-4">
                      <h1>Refund {{environmentContext.getBtcText()}} address</h1>
                    </v-row>
                  </div>
                </div>
              </v-row>
            </v-col>
          </v-row>

          <!-- success -->
          <v-row v-else class="mx-0 progress-bar">
            <v-col  cols="8" class="pa-0">
              <div class="d-flex justify-start">
                <div class="bitcoin-icon-green">
                  <v-row>
                    <v-img v-bind:class="bordersStyle.btc"
                      class="icon-status-image icon-btc-image d-flex justify-center"
                      src="@/assets/status/btc.png" height="78" contain/>
                  </v-row>
                  <v-row class="mt-5">
                    <v-col>
                      <h1>{{environmentContext.getBtcText()}} Network</h1>
                    </v-col>
                  </v-row>
                </div>
              </div>

              <v-progress-linear
                class="progress-bar-status"
                :value="btcConfirmationsPercentage"
                :color="currentBtcBarColor"
                height="19" />

                <div v-bind:class="`btc-circle ${btcCircleColor}`"></div>
              <v-row v-if="!btcConfirmationsAreDone" justify="center" class="mt-3 pa-0">
                <h5>
                  {{btcConfirmations}}/{{btcConfirmationsRequired}} confirmations
                </h5>
                <v-tooltip right>
                  <template v-slot:activator="{ on, attrs }">
                    <v-icon x-small color="teal darken-2" v-bind="attrs" v-on="on">
                      mdi-information
                    </v-icon>
                  </template>
                  <p class="tooltip-form mb-0">
                    The estimated time is calculated based on a 10-minute block time.
                  </p>
                </v-tooltip>
              </v-row>
              <v-row v-if="!btcConfirmationsAreDone" justify="center" class="mt-2 pa-0">
                <h5>
                  Estimated time left: {{leftBtcTime}} hours
                </h5>
              </v-row>
            </v-col>
            <v-col cols="auto" class="pa-0 d-flex justify-center">
              <div class="img-progress-bar">
                <v-row>
                  <v-img v-bind:class="bordersStyle.rootstock"
                    class="icon-status-image icon-rootstock-image d-flex justify-center"
                    src="@/assets/status/rootstock.png" height="78" contain/>
                </v-row>
                <v-row class="mt-5">
                  <h1>{{environmentContext.getRskText()}} Network</h1>
                </v-row>
              </div>
            </v-col>
            <v-col class="confirm-percentage pa-0">
              <v-row>
                <v-progress-linear
                class="progress-bar-status"
                :value="rskConfirmationsPercentage"
                :color="currentRskBarColor"
                height="19"/>
                <div v-bind:class="`rsk-circle ${rskCircleColor}`"></div>

                <v-row justify="center" class="mt-2 mx-0 pa-0 mb-0 confirmations-message" >
                  <h6 v-if="!rskConfirmationsAreDone">
                    Usually takes around 20 minutes
                  </h6>
                </v-row>

                <div class="d-flex justify-end pa-0 ma-0">
                  <div class="rbtc-icon-green">
                    <v-row>
                      <v-img v-bind:class="bordersStyle.rbtc"
                        class="icon-status-image icon-rbtc-image d-flex justify-center"
                        src="@/assets/status/rbtc.png" height="78" contain/>
                    </v-row>
                    <v-row class="justify-center mt-5">
                      <h1
                      :style="rskConfirmationsPercentage === 100 ?
                      `color:#00B520;` : ``">
                      {{environmentContext.getRbtcTicker()}} delivered
                      </h1>
                    </v-row>
                  </div>
                </div>
              </v-row>
            </v-col>
          </v-row>
        </v-col>
      </v-row>
    </v-container>
    <v-row>
      <tx-summary
        :statusFee="currentFee"
        :statusRefundAddress="currentRefundAddress"
        :txId="txId"
        :showTxId="true"
        :initialExpand="true"/>
    </v-row>
  </v-col>
</template>

<script lang="ts">
import {
  Component,
  Vue,
  Prop,
  Emit,
  Watch,
} from 'vue-property-decorator';
import { Action, State, Getter } from 'vuex-class';
import TxSummary from '@/components/exchange/TxSummary.vue';
import {
  PeginStatus,
  SatoshiBig,
  TxStatusType, TxStatus,
} from '@/types';
import EnvironmentContextProviderService from '@/providers/EnvironmentContextProvider';
import * as constants from '@/store/constants';
import { getTime, setStatusMessage } from '@/services/utils';

@Component({
  components: {
    TxSummary,
  },
})

export default class TxPegin extends Vue {
  currentFee = new SatoshiBig('0', 'btc');

  currentRefundAddress = '';

  btcConfirmationsRequired!: number;

  btcConfirmationsPercentage = 0;

  btcConfirmations = 0;

  rskConfirmationsPercentage = 0;

  leftBtcTime = '';

  colors = {
    blue: '#3D7DA1',
    gray: '#8c8c8c',
    green: '#9CE07B',
  };

  circleColor = {
    blue: 'circle-blue',
    gray: 'circle-gray',
    green: 'circle-green',
  };

  borderColor = {
    blue: 'icon-status-border-blue',
    gray: 'icon-status-border-gray',
    green: 'icon-status-border-green',
  };

  rskCircleColor = this.circleColor.gray;

  btcCircleColor = this.circleColor.gray;

  currentBtcBarColor = this.colors.gray;

  currentRskBarColor = this.colors.gray;

  bordersStyle = {
    btc: this.borderColor.gray,
    rootstock: this.borderColor.gray,
    rbtc: this.borderColor.gray,
  };

  environmentContext = EnvironmentContextProviderService.getEnvironmentContext();

  @State('status') txStatus!: TxStatus;

  @Prop() txId!: string;

  @Getter(constants.STATUS_IS_REJECTED, { namespace: 'status' }) isRejected!: boolean;

  @Action(constants.PEGIN_TX_ADD_AMOUNT_TO_TRANSFER, { namespace: 'pegInTx' }) setAmount!: (amount: SatoshiBig) => void;

  @Action(constants.PEGIN_TX_INIT, { namespace: 'pegInTx' }) peginInit!: () => void;

  @Action(constants.PEGIN_TX_ADD_RSK_ADDRESS, { namespace: 'pegInTx' }) setRskAddress!: (address: string) => void;

  get btcConfirmationsAreDone() {
    this.setProgressColor();
    this.setCircleColor();
    return this.btcConfirmations >= this.btcConfirmationsRequired;
  }

  get rskConfirmationsAreDone() {
    this.setProgressColor();
    this.setCircleColor();
    return this.txStatus.txDetails?.status === constants.PegStatus.CONFIRMED;
  }

  get showSteps(): boolean {
    return this.txStatus.type !== TxStatusType.UNSET_STATUS;
  }

  @Emit()
  refreshPercentage() {
    if (this.txStatus) {
      const { btc } = this.txStatus.txDetails as PeginStatus;
      this.btcConfirmationsRequired = btc.requiredConfirmation;
      this.btcConfirmations = btc.confirmations ?? 0;
      this.btcConfirmations = this.btcConfirmations > this.btcConfirmationsRequired
        ? this.btcConfirmationsRequired : this.btcConfirmations;
    }
    this.leftBtcTime = getTime((this.btcConfirmationsRequired - this.btcConfirmations) * 10);
    this.btcConfirmationsPercentage = this.btcConfirmations <= this.btcConfirmationsRequired
      ? (this.btcConfirmations * 100) / this.btcConfirmationsRequired : 100;
    if (this.txStatus.txDetails?.status === constants.PegStatus.CONFIRMED) {
      this.rskConfirmationsPercentage = 100;
    } else {
      this.rskConfirmationsPercentage = 0;
    }
  }

  setSummaryData() {
    const { btc, rsk } = this.txStatus?.txDetails as PeginStatus;
    const txData = {
      amount: new SatoshiBig(btc.amountTransferred, 'btc'),
      refundAddress: btc.refundAddress,
      recipient: rsk.recipientAddress ? rsk.recipientAddress : '',
      feeBTC: new SatoshiBig(btc.fees, 'btc'),
      change: '',
    };
    this.peginInit();
    this.setAmount(txData.amount);
    this.currentFee = txData.feeBTC;
    this.currentRefundAddress = txData.refundAddress;
    this.setRskAddress(txData.recipient);
  }

  @Watch('pegInStatus.status')
  @Emit('setMessage')
  setMessage() {
    if (this.txStatus.txDetails) {
      return setStatusMessage(TxStatusType.PEGIN, this.txStatus.txDetails.status);
    }
    return '';
  }

  setProgressColor() {
    if (this.btcConfirmationsPercentage <= 1) {
      this.currentBtcBarColor = this.colors.gray;
      this.bordersStyle.btc = this.borderColor.gray;
      this.bordersStyle.rootstock = this.borderColor.gray;
      this.bordersStyle.rbtc = this.borderColor.gray;
    } else if (this.btcConfirmationsPercentage > 1
    && this.btcConfirmationsPercentage < 100) {
      this.currentBtcBarColor = this.colors.blue;

      this.bordersStyle.btc = this.borderColor.blue;
      this.bordersStyle.rootstock = this.borderColor.gray;
      this.bordersStyle.rbtc = this.borderColor.gray;
    } else {
      this.currentBtcBarColor = this.colors.blue;
      this.currentRskBarColor = this.colors.blue;

      this.bordersStyle.btc = this.borderColor.blue;
      this.bordersStyle.rootstock = this.borderColor.blue;
      this.bordersStyle.rbtc = this.borderColor.gray;
    }

    if (this.rskConfirmationsPercentage === 100) {
      this.currentBtcBarColor = this.colors.green;
      this.currentRskBarColor = this.colors.green;

      this.bordersStyle.btc = this.borderColor.green;
      this.bordersStyle.rootstock = this.borderColor.green;
      this.bordersStyle.rbtc = this.borderColor.green;
    }
  }

  setCircleColor() {
    if (this.btcConfirmationsPercentage <= 50) {
      this.btcCircleColor = this.circleColor.gray;
    } else if (this.btcConfirmationsPercentage > 50
    && this.btcConfirmationsPercentage <= 100) {
      this.btcCircleColor = this.circleColor.blue;
    }

    if (this.rskConfirmationsPercentage <= 50) {
      this.rskCircleColor = this.circleColor.gray;
    } else if (this.rskConfirmationsPercentage > 50
    && this.rskConfirmationsPercentage < 100) {
      this.rskCircleColor = this.circleColor.blue;
    } else {
      this.btcCircleColor = this.circleColor.green;
      this.rskCircleColor = this.circleColor.green;
    }
  }

  created() {
    this.setSummaryData();
    this.refreshPercentage();
    this.setMessage();

    this.setProgressColor();
    this.setCircleColor();
  }
}
</script>
