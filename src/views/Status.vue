<template>
  <v-container fluid class="px-0 mx-0 max-width">
    <v-col>
      <v-container class="transactions">
        <v-row class="mx-0 mb-5 d-flex justify-center">
          <h1 class="text-center">Transaction status</h1>
        </v-row>
        <v-row class="mx-0 mt-10 mb-8" justify="center">
          <p class="subtitle">Enter your
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
                          :label="'Transaction id'"
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
      </v-container>
      <v-container fluid class="transactions px-0">
        <!--  TODO: create a pegin-tx-summary component-->
        <tx-pegin
          v-if="!isRejected && showStatus && isPegIn"
          :txId ="txId"
          @setMessage="setMessage"
          :pegInStatus="pegInStatus"
          :isRejected="isRejected"
          />
         <!--  TODO: create a pegout-tx-summary component-->
        <tx-pegout
          v-if="!isRejected && showStatus && isPegOut"
          :txId ="txId"
          @setMessage="setMessage"
          :pegStatus="pegOutStatus"
        />
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
import { State, Action } from 'vuex-class';
import TxPegout from '@/components/status/TxPegout.vue';
import TxPegin from '@/components/status/TxPegin.vue';
import { ApiService } from '@/services';
import {
  MiningSpeedFee, PeginStatus, TxData, PegInTxState,
  TxStatus, TxStatusType, PegoutStatusDataModel, TxStatusMessage,
} from '@/types';
import EnvironmentContextProviderService from '@/providers/EnvironmentContextProvider';
import * as constants from '@/store/constants';

@Component({
  components: {
    TxPegout,
    TxPegin,
  },
})
export default class Status extends Vue {
  txData?: TxData;

  txId = '';

  currentId = ''

  txType = TxStatusType.PEGIN;

  pegInStatus!: PeginStatus;

  pegOutStatus!: PegoutStatusDataModel;

  isPegIn = false;

  isPegOut = false;

  statusMessage = '';

  loading = false;

  error = false;

  errorMessage = '';

  activeMessageStyle = 'statusRejected';

  rskConfirmationsPercentage = 0;

  isRejected = false;

  leftBtcTime = '';

  btcConfirmationsRequired!: number;

  currentRefundAddress = '';

  environmentContext = EnvironmentContextProviderService.getEnvironmentContext();

  @Prop({ default: '' }) txIdProp!: string;

  @State('pegInTx') peginTxState!: PegInTxState;

  @Action(constants.PEGIN_TX_ADD_BITCOIN_PRICE, { namespace: 'pegInTx' }) getBtcPrice !: () => Promise<void>;

  @Action(constants.PEGIN_TX_SELECT_FEE_LEVEL, { namespace: 'pegInTx' }) setSelectedFee !: (feeLevel: MiningSpeedFee) => void;

  @Action(constants.PEGIN_TX_ADD_STATUS_SAFE_FEE, { namespace: 'pegInTx' }) setSafeFee !: (fee: string) => void;

  @Action(constants.PEGIN_TX_ADD_STATUS_REFUND_ADDRESS, { namespace: 'pegInTx' }) setRefundAddress !: (fee: string) => void;

  @Action(constants.PEGIN_TX_ADD_STATUS_TX_ID, { namespace: 'pegInTx' }) setTxId !: (txId: string) => void;

  get showStatus() {
    return !this.loading && !this.error;
  }

  @Emit()
  getPegStatus() {
    if (this.txId !== '' && this.currentId !== this.txId) {
      this.currentId = this.txId;
      this.loading = true;
      if (this.$route.path !== `/status/txId/${this.txId}`) {
        this.$router.push({
          name: 'Status',
          params: { txId: this.txId },
        });
      }
      ApiService.getTxStatus(this.txId)
        .then((txStatus: TxStatus) => {
          this.txType = txStatus.type;
          this.isPegIn = txStatus.type === TxStatusType.PEGIN;
          this.isPegOut = txStatus.type === TxStatusType.PEGOUT;
          if (this.isPegIn) {
            this.pegInStatus = txStatus.txDetails as PeginStatus;
          } else if (this.isPegOut) {
            // TODO: Setup pegout view
            this.pegOutStatus = txStatus.txDetails as PegoutStatusDataModel;
          }
          this.loading = false;
        })
        .catch((e: Error) => {
          if (!this.errorMessage) {
            this.errorMessage = e.message;
          }
          this.error = true;
          this.loading = false;
        });
    }
  }

  @Emit()
  setMessage(msg: TxStatusMessage) {
    const {
      statusMessage,
      activeMessageStyle,
      isRejected,
      error,
      errorMessage,
    } = msg;

    this.statusMessage = statusMessage;
    this.activeMessageStyle = activeMessageStyle;
    this.isRejected = isRejected;
    this.error = error;
    this.errorMessage = errorMessage;
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

  async created() {
    await this.getBtcPrice();
  }
}
</script>
