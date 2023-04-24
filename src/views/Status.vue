<template>
  <v-container fluid class="px-0 mx-0 max-width">
    <v-col>
      <v-container class="transactions ma-0 pa-0" >
        <v-row class="mx-0 mb-5 d-flex justify-center">
          <h1 class="text-center">Transaction status</h1>
        </v-row>
        <v-row class="mx-0 mt-10 mb-4" justify="center">
          <p class="subtitle">Enter the
            transaction id in the textbox below
            to check the status of the operation</p>
        </v-row>
        <v-row justify="center" class="mx-0">
          <v-col cols="7" md="8" xl="7" lg="7" class="pa-0">
          <v-row>
              <v-text-field dense outlined hide-details
                            v-model="txId"
                            v-bind:color="'#C4C4C4'"
                            :label="'Transaction id'"
                            v-bind:class="activeClass"/>
              <v-btn :disabled="!isValidTxId" icon class="mx-2"
                      @click="getPegStatus" @keyup.enter="getPegStatus">
                <v-icon>mdi-magnify</v-icon>
              </v-btn>
          </v-row>
              <v-row v-if="!isValidTxId && txId" class="mx-0 pl-1 pt-1">
                <span class="yellowish">
                  {{notValidTxIdMessage}}
                </span>
              </v-row>
              <v-row class="mx-0 pl-1 pt-1" v-if="activeMessage.error && isValidTxId">
                <span class="redish">
                  {{activeMessage.errorMessage}}
                </span>
              </v-row>
              </v-col>
        </v-row>
        <v-row justify="center" v-if="showStatus" class="mx-0 mt-5 mb-0">
          <div class="mt-4 mb-0 status text-center"
               :class="activeMessage.activeMessageStyle">
            {{ activeMessage.statusMessage }}
            <v-row v-if="showTimeLeft" class="mt-1 mb-0 text-center d-flex justify-center">
              <p class="subtitle blueish">Estimated time: {{releaseTimeText}}</p>
            </v-row>
          </div>
        </v-row>
      </v-container>
      <v-container fluid class="transactions pa-0">
        <tx-pegin
          v-if="!activeMessage.isRejected
            && isPegIn
            && !activeMessage.error"
          :txId ="txId"
          />
        <tx-pegout
          v-if="((!activeMessage.isRejected
            && !activeMessage.error)
            ||isRejected)
            && isPegOut"
          :txId ="txId"
        />
        <v-row justify="center" class="mx-0 mt-5">
          <v-col cols="2" class="d-flex justify-start ma-0 pa-0">
            <v-btn rounded outlined color="#000000" width="110" @click="back">
              <span>Go home</span>
            </v-btn>
          </v-col>
          <v-col cols="10" class="d-flex justify-end ma-0 py-0 pl-0">
            <v-btn v-if="!activeMessage.isRejected && showStatus"
                   class="px-5" width="117" color="#000000" rounded
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
import { Action, Getter, State } from 'vuex-class';
import TxPegout from '@/components/status/TxPegout.vue';
import TxPegin from '@/components/status/TxPegin.vue';
import {
  MiningSpeedFee,
  PeginStatus,
  PegInTxState,
  PegoutStatus,
  PegoutStatusDataModel,
  TxData,
  TxStatus,
  TxStatusMessage,
  TxStatusType,
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

  txType = TxStatusType.PEGIN;

  pegInStatus!: PeginStatus;

  pegOutStatus!: PegoutStatusDataModel;

  loading = false;

  rskConfirmationsPercentage = 0;

  leftBtcTime = '';

  btcConfirmationsRequired!: number;

  currentRefundAddress = '';

  environmentContext = EnvironmentContextProviderService.getEnvironmentContext();

  @Prop({ default: '' }) txIdProp!: string;

  @State('pegInTx') peginTxState!: PegInTxState;

  @State('status') status!: TxStatus;

  @Action(constants.STATUS_GET_TX_STATUS, { namespace: 'status' }) setTxStatus !: (txId: string) => Promise<void>;

  @Action(constants.STATUS_CLEAR, { namespace: 'status' }) clearStatus !: () => void;

  @Action(constants.PEGIN_TX_ADD_BITCOIN_PRICE, { namespace: 'pegInTx' }) getBtcPrice !: () => Promise<void>;

  @Action(constants.PEGIN_TX_SELECT_FEE_LEVEL, { namespace: 'pegInTx' }) setSelectedFee !: (feeLevel: MiningSpeedFee) => void;

  @Action(constants.PEGIN_TX_ADD_STATUS_SAFE_FEE, { namespace: 'pegInTx' }) setSafeFee !: (fee: string) => void;

  @Action(constants.PEGIN_TX_ADD_STATUS_REFUND_ADDRESS, { namespace: 'pegInTx' }) setRefundAddress !: (fee: string) => void;

  @Action(constants.PEGIN_TX_ADD_STATUS_TX_ID, { namespace: 'pegInTx' }) setTxId !: (txId: string) => void;

  @Getter(constants.STATUS_GET_ACTIVE_MESSAGE, { namespace: 'status' }) activeMessage !: TxStatusMessage;

  @Getter(constants.STATUS_GET_RELEASE_TIME_TEXT, { namespace: 'status' }) releaseTimeText !: string;

  get showStatus() {
    return !this.loading
      && !this.activeMessage.error
      && !!this.activeMessage.statusMessage;
  }

  get isValidTxId() {
    return this.regexValidationTxId();
  }

  get isRejected() {
    return this.status.txDetails?.status === 'REJECTED';
  }

  get isPegIn(): boolean {
    return this.status.type === TxStatusType.PEGIN;
  }

  get isPegOut(): boolean {
    return this.status.type === TxStatusType.PEGOUT;
  }

  get showTimeLeft(): boolean {
    const txDetails = this.status.txDetails as PegoutStatusDataModel;
    return this.status.type === TxStatusType.PEGOUT
      && (txDetails.status === PegoutStatus.WAITING_FOR_CONFIRMATION
        || txDetails.status === PegoutStatus.RECEIVED
        || txDetails.status === PegoutStatus.WAITING_FOR_SIGNATURE);
  }

  get notValidTxIdMessage(): string {
    let message = '';
    if (!this.regexValidationTxId()) {
      message = 'The transaction id must be a valid one.';
    }
    return message;
  }

  regexValidationTxId() {
    const regx = new RegExp(/^(0x[a-fA-F0-9]{64}|[a-fA-F0-9]{64})$/);
    return regx.test(this.txId);
  }

  get activeClass(): string {
    let activeClass = '';
    if (!this.isValidTxId && this.txId) {
      activeClass = 'status-text-field-warning';
    } else if (this.activeMessage.error && this.txId) {
      activeClass = 'status-text-field-error';
    }
    return activeClass;
  }

  @Emit()
  getPegStatus() {
    if (this.$route.path !== `/status/txId/${this.txId}`) {
      this.$router.push({
        name: 'Status',
        params: { txId: this.txId },
      });
    } else if (this.txId !== '') {
      this.clean();
      this.loading = true;
      this.setTxStatus(this.txId)
        .then(() => {
          this.loading = false;
        });
    }
  }

  @Emit()
  clean() {
    this.clearStatus();
    this.loading = false;
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
    this.clearStatus();
    await this.getBtcPrice();
  }
}
</script>
