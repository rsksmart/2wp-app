<template>
  <v-container fluid class="exchange normalized-height container
  max-width mx-6">
    <v-col class="exchange-form px-0">
      <v-row class="mx-0">
        <v-col cols="1" class="pa-0 d-flex align-center">
          <v-img position="center left"
                 src="@/assets/exchange/arrow.png" height="40" contain/>
        </v-col>
        <v-col class="px-0">
          <h1 class="text-left">Send {{environmentContext.getBtcTicker()}}.
            Get {{environmentContext.getRbtcTicker()}}.</h1>
        </v-col>
      </v-row>
      <v-row class="mx-0 mt-2">
        <v-col id="options-col" cols="8" lg="7" class="pa-0">
          <peg-in-account-select/>
          <v-divider color="#C4C4C4"/>
          <btc-input-amount/>
          <v-divider color="#C4C4C4"/>
          <rsk-address-input @state="setRskAddressState"/>
          <v-divider color="#C4C4C4"/>
          <btc-fee-select/>
        </v-col>
        <v-col id="summary-col" cols="4" lg="5">
          <btc-tx-summary-side/>
        </v-col>
      </v-row>
      <v-row class="mx-0">
        <v-col cols="2" class="d-flex justify-start ma-0 pa-0">
          <v-btn rounded outlined color="#00B520" width="110" @click="backHome"
                 :disabled="pegInFormState.matches(['loading', 'goingHome'])">
            <span>Go home</span>
          </v-btn>
        </v-col>
        <v-col cols="10" class="d-flex justify-end ma-0 py-0 pl-0">
          <v-btn v-if="!pegInFormState.matches(['loading'])" rounded color="#00B43C"
                 @click="sendTx"
                 :disabled="!isReadyToCreate || pegInFormState.matches(['goingHome'])">
            <span class="whiteish">Continue</span>
            <v-icon class="ml-2" color="#fff">mdi-send-outline</v-icon>
          </v-btn>
          <v-progress-circular v-if="pegInFormState.matches(['loading'])"
                               indeterminate color="#00B520" class="mr-10"/>
        </v-col>
      </v-row>
      <v-row>
        <address-warning-dialog :address="pegInTxState.rskAddressSelected"
                                :show-dialog="showWarningMessage"
                                @continue="createTx"
                                @cancel="showWarningMessage = false"
        />
      </v-row>
    </v-col>
  </v-container>
</template>

<script lang="ts">
import {
  Component, Emit, Prop, Vue,
} from 'vue-property-decorator';
import { Getter, State } from 'vuex-class';
import PegInAccountSelect from '@/components/create/PegInAccountSelect.vue';
import BtcInputAmount from '@/components/create/BtcInputAmount.vue';
import RskAddressInput from '@/components/create/RskAddressInput.vue';
import BtcFeeSelect from '@/components/create/BtcFeeSelect.vue';
import BtcTxSummarySide from '@/components/create/BtcTxSummarySide.vue';
import { PegInTxState } from '@/types/pegInTx';
import * as constants from '@/store/constants';
import { Machine } from '@/services/utils';
import SatoshiBig from '@/types/SatoshiBig';
import AddressWarningDialog from '@/components/exchange/AddressWarningDialog.vue';
import EnvironmentContextProviderService from '@/providers/EnvironmentContextProvider';

@Component({
  components: {
    PegInAccountSelect,
    BtcInputAmount,
    RskAddressInput,
    BtcFeeSelect,
    BtcTxSummarySide,
    AddressWarningDialog,
  },
})
export default class PegInForm extends Vue {
  pegInFormState: Machine<'loading' | 'goingHome' | 'fill'> = new Machine('fill');

  showWarningMessage = false;

  rskAddressState = 'invalid';

  environmentContext = EnvironmentContextProviderService.getEnvironmentContext();

  @Prop() isBackFromConfirm!: boolean;

  @State('pegInTx') pegInTxState!: PegInTxState;

  @Getter(constants.PEGIN_TX_GET_REFUND_ADDRESS, { namespace: 'pegInTx' }) refundAddress!: string;

  backHome() {
    this.pegInFormState.send('goingHome');
    this.$router.go(0);
  }

  get safeTxFee(): SatoshiBig {
    let fee = new SatoshiBig('0', 'satoshi');
    switch (this.pegInTxState.selectedFee) {
      case constants.BITCOIN_AVERAGE_FEE_LEVEL:
        fee = this.pegInTxState.calculatedFees.average;
        break;
      case constants.BITCOIN_FAST_FEE_LEVEL:
        fee = this.pegInTxState.calculatedFees.fast;
        break;
      case constants.BITCOIN_SLOW_FEE_LEVEL:
        fee = this.pegInTxState.calculatedFees.slow;
        break;
      default:
        break;
    }
    return fee;
  }

  get isReadyToCreate(): boolean {
    return this.pegInTxState.isValidAmountToTransfer
      && !this.pegInTxState.loadingFee
      && this.pegInTxState.rskAddressSelected !== '';
  }

  @Emit()
  sendTx() {
    if (this.rskAddressState === 'warning') this.showWarningMessage = true;
    else this.createTx();
  }

  @Emit()
  setRskAddressState(state: string) {
    this.rskAddressState = state;
  }

  @Emit('createTx')
  createTx() {
    this.showWarningMessage = false;
    this.pegInFormState.send('loading');
    return {
      amountToTransferInSatoshi: this.pegInTxState.amountToTransfer,
      refundAddress: this.refundAddress,
      recipient: this.pegInTxState.rskAddressSelected,
      feeLevel: this.pegInTxState.selectedFee,
      accountType: this.pegInTxState.selectedAccount,
    };
  }
}
</script>
