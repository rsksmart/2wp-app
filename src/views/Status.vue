<template>
  <div class="transactions">
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
      <div class="my-4 status" :class="statusMessageStyle">
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
    <div v-show="showStatus">
      <v-row class="mx-0 mb-8">
        <v-img src="@/assets/transactions/timeline.png" height="130" contain/>
      </v-row>
      <tx-summary :txData="txData" :price="price" :txId="txId" :showTxId="true"/>
    </div>
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

  status!: PegStatus;

  statusMessage = '';

  loading = false;

  error = false;

  errorMessage = '';

  get showStatus(): boolean {
    return !this.loading && !this.error && !!this.statusMessage;
  }

  get statusMessageStyle() {
    const style = {
      statusProgress: false,
      statusSuccess: false,
      statusRejected: false,
    };
    switch (this.status) {
      case PegStatus.CONFIRMED:
        style.statusSuccess = true;
        break;
      case PegStatus.WAITING_CONFIRMATIONS:
        style.statusProgress = true;
        break;
      case PegStatus.REJECTED_REFUND:
        style.statusRejected = true;
        break;
      case PegStatus.REJECTED_NO_REFUND:
        style.statusRejected = true;
        break;
      default:
        style.statusRejected = true;
    }
    return style;
  }

  @Emit()
  getPegStatus() {
    this.loading = true;
    ApiService.getPegInStatus(this.txId)
      .then((pegInStatus: PeginStatus) => {
        this.status = pegInStatus.status;
        this.setMessage();
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
    switch (this.status) {
      case PegStatus.CONFIRMED:
        this.statusMessage = 'Your transaction was successful\n Check your transaction balance in the explorer';
        break;
      case PegStatus.WAITING_CONFIRMATIONS:
        this.statusMessage = 'Your transaction is in progress.';
        break;
      case PegStatus.REJECTED_REFUND:
        this.statusMessage = 'Your transaction was declined. \n Your BTC will be send to the refund address';
        break;
      case PegStatus.REJECTED_NO_REFUND:
        this.statusMessage = 'Your transaction was declined.';
        break;
      default:
    }
  }
}
</script>
