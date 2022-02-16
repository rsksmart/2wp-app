<template>
  <v-container fluid class="px-0 mx-0 max-width">
    <v-col>
      <v-container class="transactions">
        <v-row class="mx-0 mb-5 d-flex justify-center">
          <h1 class="text-center">Transaction status</h1>
        </v-row>
        <v-row class="mx-0 mt-10 mb-8" justify="center">
          <p class="subtitle">Enter your {{environmentContext.getBtcText()}}
            transaction hash in the textbox below
            to check the status of your operation</p>
        </v-row>
        <v-row justify="center" class="mx-0">
          <v-col cols="7" md="8" xl="7" lg="7">
            <v-text-field dense outlined hide-details
                          append-icon="mdi-magnify"
                          @click:append="getPegStatus"
                          v-model="txId"
                          @keyup.enter="getPegStatus"
                          v-bind:color="error ? '#F6C61B': '#C4C4C4'"
                          :label="`${environmentContext.getBtcText()} transaction id`"
                          v-bind:class="error ? 'status-text-field-error' : ''"/>
            <v-row class="mx-0 pl-1 pt-1" v-if="error">
                <span class="yellowish">
                  {{errorMessage}}
                </span>
            </v-row>
          </v-col>
        </v-row>
        <v-row justify="center"  v-if="showStatus" class="mx-0 my-5">
          <div class="my-4 status" :class="activeMessageStyle">
            {{ statusMessage }}
          </div>
        </v-row>
        <v-row justify="center" v-if="showStatus" class="mt-6">
          <v-col cols="7">
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
                      <h1>{{environmentContext.getRskText()}} Network</h1>
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
                  <div style="{ z-index: 5; position: absolute;
                    margin-left: -75px; margin-top: -30px; }">
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
              <v-col class="pa-0" style="{z-index: 0;}">
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
                  <div style="{ z-index: 5; position: absolute;
                    margin-right: -75px; margin-top: -75px; }">
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
      </v-container>
      <v-container fluid class="transactions px-0">
        <tx-summary :showTxId="false" :initial-expand="true"/>
        <v-row justify="center" class="mx-0 mt-5">
          <v-col cols="2" class="d-flex justify-start ma-0 pa-0">
            <v-btn rounded outlined color="#00B520" width="110" @click="back">
              <span>Go home</span>
            </v-btn>
          </v-col>
          <v-col cols="10" class="d-flex justify-end ma-0 py-0 pl-0">
            <v-btn v-if="!isRejected && showStatus" class="px-5" width="117" color="#00B520" rounded
                   @click="getPegStatus">
              <span class="whiteish">Refresh</span>
            </v-btn>
          </v-col>
        </v-row>
      </v-container>
    </v-col>
  </v-container>
</template>

<script lang="ts">
import {
  Component, Emit, Prop, Vue, Watch,
} from 'vue-property-decorator';
import { State } from 'vuex-class';
import TxSummary from '@/components/exchange/TxSummary.vue';
import { PegStatus } from '@/store/constants';
import ApiService from '@/services/ApiService';
import { PeginStatus } from '@/store/types';
import { PegInTxState } from '@/store/peginTx/types';
import { TxData } from '@/types';
import SatoshiBig from '@/types/SatoshiBig';
import EnvironmentContextProviderService from '@/providers/EnvironmentContextProvider';

@Component({
  components: {
    TxSummary,
  },
})
export default class Status extends Vue {
  txData?: TxData;

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

  environmentContext = EnvironmentContextProviderService.getEnvironmentContext();

  @Prop({ default: '' }) txIdProp!: string;

  @State('pegInTx') peginTxState!: PegInTxState;

  get showStatus() {
    return !this.loading && !this.error && !!this.statusMessage;
  }

  get btcConfirmationsAreDone() {
    return this.btcConfirmations >= this.btcConfirmationsRequired;
  }

  get rskConfirmationsAreDone() {
    return this.pegInStatus.status === PegStatus.CONFIRMED;
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
    if (this.txId !== '') {
      this.loading = true;
      this.error = false;
      if (this.$route.path !== `/status/txId/${this.txId}`) this.$router.push({ name: 'Status', params: { txId: this.txId } });
      ApiService.getPegInStatus(this.txId)
        .then((pegInStatus: PeginStatus) => {
          this.pegInStatus = pegInStatus;
          this.setMessage();
          this.setSummary();
          this.refreshPercentage();
          this.loading = false;
        })
        .catch((e: Error) => {
          this.errorMessage = e.message;
          this.error = true;
          this.loading = false;
        });
    }
  }

  @Emit()
  setMessage() {
    switch (this.pegInStatus.status) {
      case PegStatus.CONFIRMED:
        this.statusMessage = 'Your transaction was successfully processed!';
        this.activeMessageStyle = 'statusSuccess';
        this.isRejected = false;
        break;
      case PegStatus.WAITING_CONFIRMATIONS:
        this.statusMessage = `More ${this.environmentContext.getBtcText()} confirmations are yet needed, please wait`;
        this.activeMessageStyle = 'statusProgress';
        this.isRejected = false;
        break;
      case PegStatus.REJECTED_REFUND:
        this.statusMessage = `Your transaction was declined. \n Your ${this.environmentContext.getBtcTicker()} will be sent to the refund address`;
        this.activeMessageStyle = 'statusRejected';
        this.isRejected = true;
        break;
      case PegStatus.REJECTED_NO_REFUND:
        this.statusMessage = 'Your transaction was declined.';
        this.activeMessageStyle = 'statusRejected';
        this.isRejected = true;
        break;
      case PegStatus.NOT_IN_BTC_YET:
        this.statusMessage = `Your transaction is not in ${this.environmentContext.getBtcText()} yet.`;
        this.activeMessageStyle = 'statusRejected';
        this.isRejected = true;
        break;
      case PegStatus.NOT_IN_RSK_YET:
        this.statusMessage = `Waiting to be processed by the ${this.environmentContext.getRskText()} network`;
        this.activeMessageStyle = 'statusProgress';
        this.isRejected = false;
        break;
      case PegStatus.ERROR_BELOW_MIN:
        this.error = true;
        this.errorMessage = 'The transaction is below the minimum amount required';
        break;
      case PegStatus.ERROR_NOT_A_PEGIN:
        this.error = true;
        this.errorMessage = 'Unfortunately this is not recognized as a Peg in transaction, please check it and try again';
        break;
      case PegStatus.ERROR_UNEXPECTED:
        this.error = true;
        this.errorMessage = 'The input transaction is not valid, please check it and try again';
        break;
      default:
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
  }

  // eslint-disable-next-line class-methods-use-this
  getTime(totalMinutes: number): string {
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    const paddedMinutes = minutes < 10 ? `0${minutes}` : minutes;
    return `${hours}:${paddedMinutes}`;
  }

  @Emit()
  // eslint-disable-next-line class-methods-use-this
  openExplorer() {
    window.open('https://explorer.testnet.rsk.co/', '_blank');
  }

  @Emit()
  clean() {
    this.txId = '';
    this.loading = false;
    this.error = false;
    this.statusMessage = '';
  }

  @Watch('$route', { immediate: true, deep: true })
  onUrlChange() {
    if (this.txIdProp) {
      this.txId = this.txIdProp ?? '';
      this.getPegStatus();
    } else {
      this.clean();
    }
  }

  @Emit()
  back() {
    this.$router.replace({ name: 'Home' });
  }
}
</script>
