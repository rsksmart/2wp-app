<template>
  <div class="transactions container">
    <v-row class="mx-0 my-10 d-flex justify-center">
      <h1 class="text-center">Transaction Status</h1>
    </v-row>
    <v-row class="mx-0 d-flex justify-center">
      <v-col cols="7">
        <v-text-field rounded dense outlined hide-details
                      append-icon="mdi-magnify"
                      v-model="txId"
                      @keyup.enter="getPegStatus"
                      color="#C4C4C4" label="Transaction ID"/>
      </v-col>
    </v-row>
    <v-row v-if="showStatus" class="mx-0 d-flex justify-center">
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
            <div class="d-flex justify-end">
              <div style="{ z-index: 5; position: absolute;
                  margin-right: -75px; margin-top: -50px; }">
                <v-row>
                  <v-img class="d-flex justify-center"
                         src="@/assets/status/btc-green.png" height="78" contain/>
                </v-row>
                <v-row class="mt-4">
                  <h1>Receipt RSK address</h1>
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
                    :txId="txId" :showTxId="true"/>
        <v-row v-if="!isRejected" class="d-flex justify-center mt-6">
          <v-btn class="px-5" width="117" outlined color="#B5CAB8" rounded
                 @click="openExplorer">
            <p>RSK Explorer</p>
          </v-btn>
        </v-row>
      </v-col>
    </v-row>
  </div>
</template>

<script lang="ts">
import { Vue, Component, Emit } from 'vue-property-decorator';
import TxSummary from '@/components/exchange/TxSummary.vue';
import { PegStatus } from '@/store/constants';
import ApiService from '@/services/ApiService';
import { PeginStatus } from '@/store/types';

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

  rskConfirmationsPercentage = 0;

  isRejected = false;

  get showStatus() {
    return !this.loading && !this.error && !!this.statusMessage;
  }

  @Emit()
  refreshPercentage() {
    let btcConfirmations = 0;
    let rskConfirmations = 0;
    if (this.pegInStatus) {
      btcConfirmations = this.pegInStatus.btc.confirmations ?? 0;
      rskConfirmations = this.pegInStatus.rsk.confirmations ?? 0;
    }
    this.btcConfirmationsPercentage = btcConfirmations <= 100 ? btcConfirmations : 100;
    this.rskConfirmationsPercentage = rskConfirmations <= 100 ? rskConfirmations : 100;
  }

  @Emit()
  getPegStatus() {
    this.loading = true;
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
        this.statusMessage = 'Your transaction in BTC is not in RSK yet, please wait.';
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
      feeBTC: 0,
    };
  }

  @Emit()
  // eslint-disable-next-line class-methods-use-this
  openExplorer() {
    window.open('https://explorer.testnet.rsk.co/', '_blank');
  }
}
</script>
