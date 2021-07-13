<template>
  <div class="transactions container">
    <v-row class="mx-0 my-10 d-flex justify-center">
      <h1 class="text-center">Transaction Status</h1>
    </v-row>
    <v-row class="mx-0 d-flex justify-center">
      <v-col cols="3">
        <v-text-field rounded dense outlined hide-details
                      append-icon="mdi-magnify"
                      v-model="txId"
                      @keyup.enter="getPegStatus"
                      color="#C4C4C4" label="Transaction ID"/>
      </v-col>
    </v-row>
    <v-row v-if="showStatus" class="mx-0 d-flex justify-center">
      <div class="my-4 status" :class="activeMessageStyle">
        {{statusMessage}}
      </div>
    </v-row>
    <v-row v-if="error" class="mx-0 d-flex justify-center">
      <v-col class="my-4">
        <v-row class="statusRejected d-flex justify-center">
          There was an error getting the transaction information,
          please check it is a valid transaction ID.
        </v-row>
        <v-row class="statusRejected d-flex justify-center">
          {{errorMessage}}
        </v-row>
      </v-col>
    </v-row>
<!--    <v-row v-if="showStatus" class="d-flex justify-center">-->
<!--      <v-col cols="9">-->
<!--        <v-row v-if="isRejected" class="mx-0 d-flex justify-center progress-bar">-->
<!--          <v-col cols="8" class="pa-0">-->
<!--            <v-row>-->
<!--              <v-col cols="3">-->
<!--                <v-row class="rounded-reject d-flex align-center ma-0">-->
<!--                  <v-img class="d-flex justify-center"-->
<!--                         src="@/assets/logo.png" height="50" contain/>-->
<!--                </v-row>-->
<!--                <v-row class="mt-4">-->
<!--                  <h1>RSK Network</h1>-->
<!--                </v-row>-->
<!--              </v-col>-->
<!--              <v-col cols="6" class="pa-0 d-flex align-center">-->
<!--                <v-progress-linear-->
<!--                  v-model="btcConfirmationsPercentage"-->
<!--                  color="#F6C61B"-->
<!--                  height="17"-->
<!--                ></v-progress-linear>-->
<!--              </v-col>-->
<!--              <v-col cols="3">-->
<!--                <v-row class="rounded-reject d-flex align-center ma-0">-->
<!--                  <v-img class="d-flex justify-center"-->
<!--                         src="@/assets/exchange/btc.png" height="50" contain/>-->
<!--                </v-row>-->
<!--                <v-row class="mt-4">-->
<!--                  <h1>Refund BTC address</h1>-->
<!--                </v-row>-->
<!--              </v-col>-->
<!--            </v-row>-->
<!--          </v-col>-->
<!--        </v-row>-->
<!--        <v-row  v-else class="mx-0 d-flex justify-center progress-bar">-->
<!--          <v-col cols="6" class="pa-0">-->
<!--            <v-row>-->
<!--              <v-col cols="3">-->
<!--                <v-row class="rounded d-flex align-center ma-0">-->
<!--                  <v-img class="d-flex justify-center"-->
<!--                         src="@/assets/exchange/btc.png" height="50" contain/>-->
<!--                </v-row>-->
<!--                <v-row class="mt-4">-->
<!--                  <h1>BTC Network</h1>-->
<!--                </v-row>-->
<!--              </v-col>-->
<!--              <v-col cols="9" class="pa-0 d-flex align-center">-->
<!--                <v-progress-linear-->
<!--                  v-model="btcConfirmationsPercentage"-->
<!--                  color="#00B43C"-->
<!--                  height="17"-->
<!--                ></v-progress-linear>-->
<!--              </v-col>-->
<!--            </v-row>-->
<!--          </v-col>-->
<!--          <v-col  cols="6" class="pa-0">-->
<!--            <v-row>-->
<!--              <v-col cols="3">-->
<!--                <v-row class="rounded d-flex align-center ma-0">-->
<!--                  <v-img class="d-flex justify-center"-->
<!--                         src="@/assets/logo.png" height="50" contain/>-->
<!--                </v-row>-->
<!--                <v-row class="mt-4">-->
<!--                  <h1>RSK Network</h1>-->
<!--                </v-row>-->
<!--              </v-col>-->
<!--              <v-col cols="6" class="pa-0 d-flex align-center">-->
<!--                <v-progress-linear-->
<!--                  v-model="rskConfirmationsPercentage"-->
<!--                  color="#00B43C"-->
<!--                  height="17"-->
<!--                ></v-progress-linear>-->
<!--              </v-col>-->
<!--              <v-col cols="3">-->
<!--                <v-row class="rounded d-flex align-center ma-0">-->
<!--                  <v-img class="d-flex justify-center"-->
<!--                         src="@/assets/exchange/btc.png" height="50" contain/>-->
<!--                </v-row>-->
<!--                <v-row class="mt-4">-->
<!--                  <h1>Receipt RSK address</h1>-->
<!--                </v-row>-->
<!--              </v-col>-->
<!--            </v-row>-->
<!--          </v-col>-->
<!--        </v-row>-->
<!--      </v-col>-->
<!--    </v-row>-->
    <v-row v-if="showStatus" class="mt-4">
      <v-col>
        <v-row v-if="isRejected" class="mx-0 mb-8 mt-12">
          <v-img src="@/assets/transactions/refund.png" height="130" contain/>
        </v-row>
        <v-row v-else class="mx-0 mb-8 mt-12">
          <v-img src="@/assets/transactions/success.png" height="130" contain/>
        </v-row>
        <tx-summary :txData="txData" :price="price" v-if="showStatus"
                    :txId="txId" :showTxId="true"/>
        <v-row v-if="!isRejected" class="d-flex justify-center mt-6">
          <v-btn class="px-5" width="117" outlined color="#B5CAB8" rounded
                 @click="openExplorer" >
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
    const btcConfirmations = this.pegInStatus ? this.pegInStatus.btc.confirmations : 0;
    const rskConfirmations = this.pegInStatus ? this.pegInStatus.rsk.confirmations : 0;
    this.btcConfirmationsPercentage = btcConfirmations <= 100 ? btcConfirmations : 100;
    this.rskConfirmationsPercentage = rskConfirmations <= 100 ? rskConfirmations : 100;
  }

  @Emit()
  getPegStatus() {
    this.loading = true;
    ApiService.getPegInStatus(this.txId)
      .then((pegInStatus: PeginStatus) => {
        console.log(pegInStatus);
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
