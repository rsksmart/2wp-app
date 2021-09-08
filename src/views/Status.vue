<template>
  <div class="transactions container">
    <v-row class="mx-0 my-10 d-flex justify-center">
      <h1 class="text-center">Transaction Status</h1>
    </v-row>
    <v-row class="mx-0 mt-10 mb-8 d-flex justify-center">
      <p>Enter your Bitcoin transaction hash in the textbox below
        to check the status of your operation</p>
    </v-row>
    <v-row class="mx-0 d-flex justify-center">
      <v-col cols="7">
        <v-text-field dense outlined hide-details
                      append-icon="mdi-magnify"
                      @click:append="getPegStatus"
                      v-model="txId"
                      @keyup.enter="getPegStatus"
                      color="#C4C4C4" label="Bitcoin transaction ID"/>
      </v-col>
    </v-row>
    <v-row v-if="showStatus" class="mx-0 my-5 d-flex justify-center">
      <div class="my-4 status" :class="activeMessageStyle">
        {{ statusMessage }}
      </div>
    </v-row>
    <v-row v-if="error" class="mx-0 d-flex justify-center">
      <v-col class="my-4">
        <v-row class="statusRejected d-flex justify-center">
          There was an error getting the transaction information,
          please check it is a valid transaction ID.
        </v-row>
        <v-row class="statusRejected d-flex justify-center">
          {{ errorMessage }}
        </v-row>
      </v-col>
    </v-row>
    <v-row v-if="showStatus" class="d-flex justify-center mt-6">
      <v-col cols="9">
        <v-row v-if="isRejected" class="mx-0 d-flex justify-center progress-bar">
          <v-col cols="8" class="pa-0 d-flex justify-center">
            <v-row>
              <div style="{ z-index: 5; position: absolute;
                  margin-left: -75px; margin-top: -30px; }">
                <v-row>
                  <v-img class="d-flex justify-center"
                         src="@/assets/status/rsk-yellow.png" height="78" contain/>
                </v-row>
                <v-row class="mt-4">
                  <h1>RSK Network</h1>
                </v-row>
              </div>
              <v-progress-linear
                :value="btcConfirmationsPercentage"
                color="#F6C61B"
                height="17"/>
              <div class="d-flex justify-end">
                <div style="{ z-index: 2; position: absolute;
                  margin-right: -100px; margin-top: -30px; }">
                  <v-row>
                    <v-img class="d-flex justify-center"
                           src="@/assets/status/btc-yellow.png" height="78" contain/>
                  </v-row>
                  <v-row class="mt-4">
                    <h1>Refund BTC address</h1>
                  </v-row>
                </div>
              </div>
            </v-row>
          </v-col>
        </v-row>
        <v-row v-else class="mx-0 progress-bar">
          <v-col  cols="8" class="pa-0">
            <div class="d-flex justify-start">
              <div style="{ z-index: 5; position: absolute;
                  margin-left: -75px; margin-top: -30px; }">
                <v-row>
                  <v-img class="d-flex justify-center"
                         src="@/assets/status/btc-green.png" height="78" contain/>
                </v-row>
                <v-row class="mt-4">
                  <h1>BTC Network</h1>
                </v-row>
              </div>
            </div>
            <v-progress-linear
              :value="btcConfirmationsPercentage"
              color="#00B43C"
              height="17" />
            <v-row class="d-flex justify-center mt-4 pa-0">
              <h5>
                {{leftBtcTime}} hours left
              </h5>
            </v-row>
            <v-row class="d-flex justify-center mt-2 pa-0">
              <h5>
                {{btcConfirmations}}/{{btcConfirmationsRequired}} confirmations
              </h5>
            </v-row>
          </v-col>
          <v-col cols="auto" class="pa-0 d-flex justify-center">
            <div style="{ z-index: 2; position: absolute; margin-top: -30px; margin-right: 70px; }">
              <v-row>
                <v-img class="d-flex justify-center"
                       src="@/assets/status/rsk-green.png" height="78" contain/>
              </v-row>
              <v-row class="mt-4">
                <h1>RSK Network</h1>
              </v-row>
            </div>
          </v-col>
          <v-col class="pa-0">
            <v-progress-linear
              :value="rskConfirmationsPercentage"
              color="#00B43C"
              height="17"/>
            <v-row class="d-flex justify-center mt-4 pa-0 mx-0">
              <h6>
                Can last up to 20 minutes
              </h6>
            </v-row>
            <div class="d-flex justify-end">
              <div style="{ z-index: 5; position: absolute;
                  margin-right: -75px; margin-top: -75px; }">
                <v-row>
                  <v-img class="d-flex justify-center"
                         src="@/assets/status/rbtc_green.png" height="78" contain/>
                </v-row>
                <v-row class="mt-4">
                  <h1>RBTC delivered</h1>
                </v-row>
              </div>
            </div>
          </v-col>
        </v-row>
      </v-col>
    </v-row>
    <v-row v-if="showStatus" class="mt-4">
      <v-col>
        <tx-summary :txData="txData" :price="price" v-if="showStatus"
                    :txId="txId" :showTxId="true" :initialExpand="true"
                    :rsk-federation-address="pegInStatus.btc.federationAddress"/>
        <v-row v-if="!isRejected" class="d-flex justify-center mt-6">
          <v-btn class="px-5" width="117" color="#00B43C" rounded
                 @click="getPegStatus">
            Refresh
          </v-btn>
        </v-row>
      </v-col>
    </v-row>
  </div>
</template>

<script lang="ts">
import {
  Component, Emit, Prop, Vue,
} from 'vue-property-decorator';
import { State } from 'vuex-class';
import TxSummary from '@/components/exchange/TxSummary.vue';
import { PegStatus } from '@/store/constants';
import ApiService from '@/services/ApiService';
import { PeginStatus } from '@/store/types';
import { PegInTxState } from '@/store/peginTx/types';

@Component({
  components: {
    TxSummary,
  },
})
export default class Status extends Vue {
  txData = {};

  price = 0;

  txId = '';

  pegInStatus!: PeginStatus;

  statusMessage = '';

  loading = false;

  error = false;

  errorMessage = '';

  activeMessageStyle = 'statusRejected';

  btcConfirmationsPercentage = 0;

  btcConfirmations = 0;

  rskConfirmationsPercentage = 0;

  isRejected = false;

  leftBtcTime = '';

  btcConfirmationsRequired!: number;

  @Prop({ default: '' }) txIdProp!: string;

  @State('pegInTx') peginTxState!: PegInTxState;

  get showStatus() {
    return !this.loading && !this.error && !!this.statusMessage;
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
    this.rskConfirmationsPercentage = this.pegInStatus.status === PegStatus.CONFIRMED ? 100 : 0;
  }

  @Emit()
  getPegStatus() {
    this.loading = true;
    this.$router.replace({ name: 'Status', query: { txId: this.txId } });
    ApiService.getPegInStatus(this.txId)
      .then((pegInStatus: PeginStatus) => {
        this.pegInStatus = pegInStatus;
        this.setMessage();
        this.setSummary();
        this.refreshPercentage();
        this.loading = false;
        this.error = false;
      })
      .catch((e: Error) => {
        this.errorMessage = e.message;
        this.error = true;
        this.loading = false;
      });
  }

  @Emit()
  setMessage() {
    switch (this.pegInStatus.status) {
      case PegStatus.CONFIRMED:
        this.statusMessage = 'Your transaction was successful\n Check your transaction balance in the explorer';
        this.activeMessageStyle = 'statusSuccess';
        this.isRejected = false;
        break;
      case PegStatus.WAITING_CONFIRMATIONS:
        this.statusMessage = 'Your transaction is in progress.';
        this.activeMessageStyle = 'statusProgress';
        this.isRejected = false;
        break;
      case PegStatus.REJECTED_REFUND:
        this.statusMessage = 'Your transaction was declined. \n Your BTC will be sent to the refund address';
        this.activeMessageStyle = 'statusRejected';
        this.isRejected = true;
        break;
      case PegStatus.REJECTED_NO_REFUND:
        this.statusMessage = 'Your transaction was declined.';
        this.activeMessageStyle = 'statusRejected';
        this.isRejected = true;
        break;
      case PegStatus.NOT_IN_BTC_YET:
        this.statusMessage = 'Your transaction is not in BTC yet.';
        this.activeMessageStyle = 'statusRejected';
        this.isRejected = true;
        break;
      case PegStatus.NOT_IN_RSK_YET:
        this.statusMessage = 'More Bitcoin confirmations are yet needed, please wait';
        this.activeMessageStyle = 'statusProgress';
        this.isRejected = false;
        break;
      default:
    }
  }

  @Emit()
  setSummary() {
    this.txData = {
      amount: this.pegInStatus.btc.amountTransferred * 100000000,
      refundAddress: this.pegInStatus.btc.refundAddress,
      recipient: this.pegInStatus.rsk.recipientAddress,
      feeBTC: this.pegInStatus.btc.fees,
    };
  }

  // eslint-disable-next-line class-methods-use-this
  getTime(totalMinutes: number): string {
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    return `${hours}:${minutes}`;
  }

  @Emit()
  // eslint-disable-next-line class-methods-use-this
  openExplorer() {
    window.open('https://explorer.testnet.rsk.co/', '_blank');
  }

  created() {
    if (this.txIdProp) {
      this.txId = this.txIdProp ?? '';
      this.getPegStatus();
    }
  }
}
</script>
