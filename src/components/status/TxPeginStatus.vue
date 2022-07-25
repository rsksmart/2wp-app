<template>
  <v-container fluid class="px-0 mx-0 max-width">
    <v-col>
      <!--
      <v-row justify="center" class="mt-6">
        <v-col cols="7">
          <v-row v-if="isRejected" class="mx-0 d-flex justify-center progress-bar">
            <v-col cols="8" class="pa-0 d-flex justify-center">
              <v-row>
                <div class="rsk-icon-green">
                  <v-row>
                    <v-img class="d-flex justify-center"
                            src="@/assets/status/rsk-yellow.png" height="78" contain/>
                  </v-row>
                  <v-row class="mt-4">
                    <h1>{{environmentContext.getRskText()}} Network</h1>
                  </v-row>
                </div>
                <v-progress-linear
                  :value="btcConfirmationsPercentage"
                  color="#F6C61B"
                  height="17"/>
                <div class="d-flex justify-end">
                  <div class="bitcoin-icon-yellow">
                    <v-row>
                      <v-img class="d-flex justify-center"
                              src="@/assets/status/btc-yellow.png" height="78" contain/>
                    </v-row>
                    <v-row class="mt-4">
                      <h1>Refund {{environmentContext.getBtcText()}} address</h1>
                    </v-row>
                  </div>
                </div>
              </v-row>
            </v-col>
          </v-row>
          <v-row v-else class="mx-0 progress-bar">
            <v-col  cols="8" class="pa-0">
              <div class="d-flex justify-start">
                <div class="bitcoin-icon-green">
                  <v-row>
                    <v-img class="d-flex justify-center"
                            src="@/assets/status/btc-green.png" height="78" contain/>
                  </v-row>
                  <v-row class="mt-4">
                    <h1>{{environmentContext.getBtcText()}} Network</h1>
                  </v-row>
                </div>
              </div>
              <v-progress-linear
                :value="btcConfirmationsPercentage"
                color="#00B43C"
                height="17" />
              <v-row v-if="!btcConfirmationsAreDone" justify="center" class="mt-4 pa-0">
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
                  <v-img class="d-flex justify-center"
                          src="@/assets/status/rsk-green.png" height="78" contain/>
                </v-row>
                <v-row class="mt-4">
                  <h1>{{environmentContext.getRskText()}} Network</h1>
                </v-row>
              </div>
            </v-col>
            <v-col class="confirm-percentage pa-0">
              <v-row>
                <v-progress-linear
                  :value="rskConfirmationsPercentage"
                  color="#00B43C"
                  height="17"/>
                <v-row   justify="center" class="mt-4 mx-0 pa-0 mb-0 confirmations-message" >
                  <h6 v-if="!rskConfirmationsAreDone">
                    Usually takes around 20 minutes
                  </h6>
                </v-row>
              </v-row>
              <div class="d-flex justify-end pa-0 ma-0">
                <div class="rbtc-icon-green">
                  <v-row>
                    <v-img class="d-flex justify-center"
                            src="@/assets/status/rbtc_green.png" height="78" contain/>
                  </v-row>
                  <v-row class="mt-4">
                    <h1>{{environmentContext.getRbtcTicker()}} delivered</h1>
                  </v-row>
                </div>
              </div>
            </v-col>
          </v-row>
        </v-col>
      </v-row>

      -->
      <v-row>
        <tx-summary
          :statusFee="currentFee"
          :statusRefundAddress="currentRefundAddress"
          :txId="txId"
          :showTxId="true"
          :initialExpand="true"/>
      </v-row>
    </v-col>
  </v-container>
</template>

<script lang="ts">
import {
  Component,
  Vue,
  Prop,
  Emit,
} from 'vue-property-decorator';
import { Action } from 'vuex-class';
import TxSummary from '@/components/exchange/TxSummary.vue';
import {
  PeginStatus,
  TxData,
  SatoshiBig,
} from '@/types';
import EnvironmentContextProviderService from '@/providers/EnvironmentContextProvider';
import * as constants from '@/store/constants';

@Component({
  components: {
    TxSummary,
  },
})

export default class TxPeginStatus extends Vue {
  txData!: TxData;

  currentFee = new SatoshiBig('0', 'btc');

  currentRefundAddress = '';

  btcConfirmationsRequired!: number;

  btcConfirmationsPercentage = 0;

  btcConfirmations = 0;

  rskConfirmationsPercentage = 0;

  leftBtcTime = '';

  @Prop() pegInStatus!: PeginStatus;

  @Prop() isRejected!: boolean;

  environmentContext = EnvironmentContextProviderService.getEnvironmentContext();

  @Action(constants.PEGIN_TX_ADD_AMOUNT_TO_TRANSFER, { namespace: 'pegInTx' }) setAmount!: (amount: SatoshiBig) => void;

  @Action(constants.PEGIN_TX_INIT, { namespace: 'pegInTx' }) peginInit!: () => void;

  @Action(constants.PEGIN_TX_ADD_RSK_ADDRESS, { namespace: 'pegInTx' }) setRskAddress!: (address: string) => void;

  get btcConfirmationsAreDone() {
    return this.btcConfirmations >= this.btcConfirmationsRequired;
  }

  get rskConfirmationsAreDone() {
    return this.pegInStatus.status === constants.PegStatus.CONFIRMED;
  }

  // eslint-disable-next-line class-methods-use-this
  getTime(totalMinutes: number): string {
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    const paddedMinutes = minutes < 10 ? `0${minutes}` : minutes;
    return `${hours}:${paddedMinutes}`;
  }

  @Emit()
  refreshPercentage() {
    if (this.pegInStatus) {
      this.btcConfirmationsRequired = this.pegInStatus.btc.requiredConfirmation;
      this.btcConfirmations = this.pegInStatus.btc.confirmations ?? 0;
      this.btcConfirmations = this.btcConfirmations > this.btcConfirmationsRequired
        ? this.btcConfirmationsRequired : this.btcConfirmations;
    }
    this.leftBtcTime = this.getTime((this.btcConfirmationsRequired - this.btcConfirmations) * 10);
    this.btcConfirmationsPercentage = this.btcConfirmations <= this.btcConfirmationsRequired
      ? (this.btcConfirmations * 100) / this.btcConfirmationsRequired : 100;
    if (this.pegInStatus.status === constants.PegStatus.CONFIRMED) {
      this.rskConfirmationsPercentage = 100;
    } else {
      this.rskConfirmationsPercentage = 0;
    }
  }

  @Emit()
  setSummary() {
    this.txData = {
      amount: new SatoshiBig(this.pegInStatus.btc.amountTransferred, 'btc'),
      refundAddress: this.pegInStatus.btc.refundAddress,
      recipient: this.pegInStatus.rsk.recipientAddress,
      feeBTC: new SatoshiBig(this.pegInStatus.btc.fees, 'btc'),
      change: '',
    };
    this.peginInit();
    this.setAmount(this.txData.amount);
    this.currentFee = this.txData.feeBTC;
    this.currentRefundAddress = this.txData.refundAddress;
    this.setRskAddress(this.txData.recipient);
  }
}
</script>
