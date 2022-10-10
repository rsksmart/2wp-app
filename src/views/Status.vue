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
                          v-bind:color="activeMessage.error ? '#F6C61B': '#C4C4C4'"
                          :label="'Transaction id'"
                          v-bind:class="activeMessage.error ? 'status-text-field-error' : ''"/>
            <v-row class="mx-0 pl-1 pt-1" v-if="activeMessage.error">
                <span class="yellowish">
                  {{activeMessage.errorMessage}}
                </span>
            </v-row>
          </v-col>
        </v-row>
        <v-row justify="center"  v-if="showStatus" class="mx-0 mt-5 mb-0">
          <div class="mt-4 mb-0 status" :class="activeMessage.activeMessageStyle">
            {{ activeMessage.statusMessage }}
          </div>
        </v-row>
      </v-container>
      <v-container fluid class="transactions px-0">
        <!--  TODO: create a pegin-tx-summary component-->
        <tx-pegin
          v-if="!activeMessage.isRejected && isPegIn"
          :txId ="txId"
          />
         <!--  TODO: create a pegout-tx-summary component-->
        <tx-pegout
          v-if="!activeMessage.isRejected && showStatus && isPegOut"
          :txId ="txId"
        />
        <v-row justify="center" class="mx-0 mt-5">
          <v-col cols="2" class="d-flex justify-start ma-0 pa-0">
            <v-btn rounded outlined color="#00B520" width="110" @click="back">
              <span>Go home</span>
            </v-btn>
          </v-col>
          <v-col cols="10" class="d-flex justify-end ma-0 py-0 pl-0">
            <v-btn v-if="!activeMessage.isRejected && showStatus"
                   class="px-5" width="117" color="#00B520" rounded
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
import { State, Action, Getter } from 'vuex-class';
import TxPegout from '@/components/status/TxPegout.vue';
import TxPegin from '@/components/status/TxPegin.vue';
import {
  MiningSpeedFee, PeginStatus, TxData, PegInTxState,
  TxStatusType, PegoutStatusDataModel, TxStatus, TxStatusMessage,
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

  currentId = '';

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

  get showStatus() {
    return !this.loading && !this.activeMessage.error && !!this.activeMessage.statusMessage;
  }

  get isPegIn(): boolean {
    return this.status.type === TxStatusType.PEGIN;
  }

  get isPegOut(): boolean {
    return this.status.type === TxStatusType.PEGOUT;
  }

  @Emit()
  getPegStatus() {
    if (this.txId !== '' && this.currentId !== this.txId) {
      this.clean();
      this.loading = true;
      this.currentId = this.txId;
      if (this.$route.path !== `/status/txId/${this.txId}`) {
        this.$router.push({
          name: 'Status',
          params: { txId: this.txId },
        });
      }
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
