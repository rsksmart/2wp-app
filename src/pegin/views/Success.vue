<template>
<v-container fluid class="exchange normalized-height container max-width mx-6 pt-6">
    <div class="transactions">
      <v-row class="mx-0 py-3 d-flex justify-center">
        <h1 class="text-center ma-0">
          Your {{environmentContext.getRbtcTicker()}} is on its way!
        </h1>
      </v-row>
      <v-row class="mx-0 my-8 d-flex justify-center">
        <p class="text-center">
          You can follow the conversion from the status page.
        </p>
      </v-row>
      <v-row id="tx-id-box" justify="center" class="mx-0">
        <v-col>
          <v-row>
            <tx-summary-fixed
              :summary="successPeginSummary"
              :type="typeSummary"
              :orientation="orientationSummary"/>
          </v-row>
          <v-row class="mx-0 my-8 d-flex justify-end">
            <v-btn rounded class="big_button" color="#000000" @click="toTxStatus">
              <span class="whiteish">Go to status page</span>
            </v-btn>
          </v-row>
        </v-col>
      </v-row>
    </div>
</v-container>
</template>

<script lang="ts">
import {
  Component, Emit,
  Vue,
} from 'vue-property-decorator';
import { getBtcTxExplorerUrl } from '@/common/utils';
import {
  NormalizedSummary, PegInTxState, SatoshiBig, TxStatusType, TxSummaryOrientation,
} from '@/common/types';
import { Getter, State } from 'vuex-class';
import TxSummaryFixed from '@/common/components/exchange/TxSummaryFixed.vue';
import * as constants from '@/common/store/constants';
import EnvironmentContextProviderService from '@/common/providers/EnvironmentContextProvider';

@Component({
  components: {
    TxSummaryFixed,
  },
})

export default class Success extends Vue {
  txId = '';

  typeSummary = TxStatusType.PEGIN;

  orientationSummary = TxSummaryOrientation.HORIZONTAL;

  environmentContext = EnvironmentContextProviderService.getEnvironmentContext();

  @State('pegInTx') peginTxState!: PegInTxState;

  @Getter(constants.PEGIN_TX_GET_SAFE_TX_FEE, { namespace: 'pegInTx' }) safeFee!: SatoshiBig;

  get successPeginSummary(): NormalizedSummary {
    return {
      amountFromString: this.peginTxState.amountToTransfer.toBTCTrimmedString(),
      amountReceivedString: this.peginTxState.amountToTransfer.toBTCTrimmedString(),
      fee: Number(this.safeFee.toBTCTrimmedString()),
      recipientAddress: this.peginTxState.rskAddressSelected,
      txId: this.txId,
      federationAddress: this.peginTxState.peginConfiguration.federationAddress,
    };
  }

  get btcExplorerUrl() {
    return getBtcTxExplorerUrl(this.txId);
  }

  get chunkedBtcExplorerUrl() {
    return `${this.btcExplorerUrl.substr(0, 30)}...${this.btcExplorerUrl.substr(104, 108)}`;
  }

  get chunkedTxId() {
    return `${this.txId.substr(0, 30)}...${this.txId.substr(60, 64)}`;
  }

  @Emit()
  toTxStatus() {
    this.$router.push({ name: 'Status', params: { txId: this.txId } });
  }

  @Emit()
  copyUrl() {
    navigator.clipboard.writeText(this.btcExplorerUrl);
  }

  @Emit()
  copyTxId() {
    navigator.clipboard.writeText(this.txId);
  }

  created() {
    this.txId = this.$route.params.txId;
  }
}
</script>
