<template>
  <v-container fluid class="exchange normalized-height container
  max-width mx-6">
  <v-container>
      <div class="tourStyle">
        <v-tour name="pegInTour" :steps="tourSteps" :callbacks="tourCallBacks">
        </v-tour>
      </div>
    </v-container>
    <v-col class="exchange-form px-0">
      <v-row class="mx-0">
        <v-col cols="1" class="pa-0 d-flex align-center">
          <v-img position="center left"
                 src="@/assets/exchange/arrow.png" height="40" contain/>
        </v-col>
        <v-col class="px-0">
         <h1 class="justify-center text-left">Send {{environmentContext.getBtcTicker()}}.
            Get {{environmentContext.getRbtcTicker()}}.</h1>
        </v-col>
        <v-col style="margin-left: 15%;">
          <div>
            <v-btn class="tour-button" id="first-step" @click="startVueTour()">?</v-btn>
            <span>You don't know how to proceed?</span>
          </div>
          <div>
            <span>Click the button to start an introduction tour! </span>
          </div>
        </v-col>
      </v-row>
      <v-row class="mx-0 mt-2">
        <v-col id="options-col" cols="8" lg="7" class="pa-0">
          <peg-in-account-select/>
          <v-divider color="#C4C4C4"/>
          <btc-input-amount :isTourActive="isTourActive"/>
          <v-divider color="#C4C4C4"/>
          <rsk-address-input :isTourActive="isTourActive" @state="setRskAddressState"/>
          <v-divider color="#C4C4C4"/>
          <btc-fee-select :isTourActive="isTourActive"/>
        </v-col>
        <v-col id="summary-col" cols="4" lg="4">
          <tx-summary-fixed
            :summary="pegInFormSummary"
            :initialExpand="true"
            :type="typeSummary"
            :orientation="orientationSummary"/>
        </v-col>
      </v-row>
      <v-row class="mx-0">
        <v-col cols="2" class="d-flex justify-start ma-0 pa-0">
          <v-btn rounded outlined color="#000000" width="110" @click="back"
                 :disabled="pegInFormState.matches(['loading', 'goingHome'])">
            <span>Back</span>
          </v-btn>
        </v-col>
        <v-col cols="10" class="d-flex justify-end ma-0 py-0 pl-0">
          <v-btn v-if="!pegInFormState.matches(['loading'])" rounded color="#000000"
                 @click="sendTx"
                 :disabled="!isReadyToCreate || pegInFormState.matches(['goingHome'])"
                 id="send-btn">
            <span class="whiteish">Continue</span>
            <v-icon class="ml-2" color="#fff">mdi-send-outline</v-icon>
          </v-btn>
          <v-progress-circular v-if="pegInFormState.matches(['loading'])"
                               indeterminate color="#000000" class="mr-10"/>
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
  Component, Emit, Vue,
} from 'vue-property-decorator';
import { Getter, State, Action } from 'vuex-class';
import PegInAccountSelect from '@/pegin/components/create/PegInAccountSelect.vue';
import BtcInputAmount from '@/pegin/components/create/BtcInputAmount.vue';
import RskAddressInput from '@/pegin/components/create/RskAddressInput.vue';
import BtcFeeSelect from '@/pegin/components/create/BtcFeeSelect.vue';
import { PegInTxState } from '@/common/types/pegInTx';
import * as constants from '@/common/store/constants';
import { Machine } from '@/common/utils';
import SatoshiBig from '@/common/types/SatoshiBig';
import AddressWarningDialog from '@/common/components/exchange/AddressWarningDialog.vue';
import EnvironmentContextProviderService from '@/common/providers/EnvironmentContextProvider';
import { TxStatusType } from '@/common/types/store';
import { TxSummaryOrientation } from '@/common/types/Status';
import TxSummaryFixed from '@/common/components/exchange/TxSummaryFixed.vue';
import { NormalizedSummary } from '@/common/types';

@Component({
  components: {
    PegInAccountSelect,
    BtcInputAmount,
    RskAddressInput,
    BtcFeeSelect,
    TxSummaryFixed,
    AddressWarningDialog,
  },
})
export default class PegInForm extends Vue {
  pegInFormState: Machine<'loading' | 'goingHome' | 'fill'> = new Machine('fill');

  showWarningMessage = false;

  rskAddressState = 'invalid';

  environmentContext = EnvironmentContextProviderService.getEnvironmentContext();

  typeSummary = TxStatusType.PEGIN;

  orientationSummary = TxSummaryOrientation.VERTICAL;

  isTourActive = false;

  tourSteps = [
    {
      target: '#amount-field',
      content: `Input the amount you want to convert into ${this.environmentContext.getRbtcTicker()}`,
      params: {
        highlight: true,
        isFirst: true,
      },
    },
    {
      target: '#select-rsk-address-btn',
      content: 'If you want to directly connect your RSK wallet click here and confirm',
      params: {
        highlight: true,
        isLast: false,
      },
    },
    {
      target: '#select-tx-fee',
      content: 'Choose the tx speed. The faster the transaction, the higher the fee.',
      params: {
        highlight: true,
        isLast: true,
      },
    },
    {
      target: '#summary-sender-address',
      content: `This is the address in Bitcoin where the ${this.environmentContext.getBtcTicker()} will be transferred from`,
      params: {
        highlight: true,
        isLast: false,
      },
    },
    {
      target: '#summary-amount',
      content: `This is the amount you will send to convert into ${this.environmentContext.getRbtcTicker()}`,
      params: {
        highlight: true,
        isLast: false,
      },
    },
    {
      target: '#summary-tx-fee',
      content: `The estimated fee required by the network in ${this.environmentContext.getBtcTicker()}. Also called <strong>gas</strong>`,
      params: {
        highlight: true,
        isLast: false,
      },
    },
    {
      target: '#summary-tx-total',
      content: 'The estimated total amount to send, considering the selected amount and the gas',
      params: {
        highlight: true,
        isLast: false,
      },
    },
    {
      target: '#summary-rsk-destination',
      content: `This is the address where the ${this.environmentContext.getRbtcTicker()} will be sent`,
      params: {
        highlight: true,
        isLast: false,
      },
    },
    {
      target: '#summary-rsk-estimated-amount',
      content: 'Based on the estimated fee and the amount transferred, this is the estimated final amount that will be transferred to the destination address.',
      params: {
        highlight: true,
        isLast: false,
      },
    },
    {
      target: '#send-btn',
      content: 'When the form fields were fill, click to sign the transaction',
      params: {
        highlight: true,
        isLast: true,
      },
    },
  ];

  tourCallBacks = {
    onFinish: () => this.handleTourFinish(),
    onSkip: () => this.handleSkipTour(),
  };

  handleTourFinish() {
    this.isTourActive = false;
    localStorage.setItem('ONBOARDED_USER_PEGIN', 'true');
  }

  handleSkipTour() {
    this.isTourActive = false;
  }

  @State('pegInTx') pegInTxState!: PegInTxState;

  @Getter(constants.PEGIN_TX_GET_REFUND_ADDRESS, { namespace: 'pegInTx' }) refundAddress!: string;

  @Getter(constants.PEGIN_TX_GET_SAFE_TX_FEE, { namespace: 'pegInTx' }) safeFee!: SatoshiBig;

  @Getter(constants.PEGIN_TX_GET_ACCOUNT_BALANCE_TEXT, { namespace: 'pegInTx' }) accountBalanceText!: string;

  @Getter(constants.PEGIN_TX_GET_ENOUGH_FEE_VALUE, { namespace: 'pegInTx' }) enoughBalanceSelectedFee !: boolean;

  @Action(constants.WEB3_SESSION_CLEAR_ACCOUNT, { namespace: 'web3Session' }) clearAccount !: any;

  backHome() {
    this.pegInFormState.send('goingHome');
    this.$router.go(0);
  }

  get safeTxFee(): SatoshiBig {
    let fee = new SatoshiBig('0', 'satoshi');
    switch (this.pegInTxState.selectedFee) {
      case constants.BITCOIN_AVERAGE_FEE_LEVEL:
        fee = this.pegInTxState.calculatedFees.average.amount;
        break;
      case constants.BITCOIN_FAST_FEE_LEVEL:
        fee = this.pegInTxState.calculatedFees.fast.amount;
        break;
      case constants.BITCOIN_SLOW_FEE_LEVEL:
        fee = this.pegInTxState.calculatedFees.slow.amount;
        break;
      default:
        break;
    }
    return fee;
  }

  get isReadyToCreate(): boolean {
    return this.pegInTxState.isValidAmountToTransfer
      && !this.pegInTxState.loadingFee
      && this.rskAddressState !== 'invalid'
      && this.enoughBalanceSelectedFee
      && this.pegInTxState.rskAddressSelected !== '';
  }

  get pegInFormSummary(): NormalizedSummary {
    return {
      amountFromString: this.pegInTxState.amountToTransfer.toBTCTrimmedString(),
      amountReceivedString: this.pegInTxState.amountToTransfer.toBTCTrimmedString(),
      fee: Number(this.safeFee.toBTCString()),
      recipientAddress: this.pegInTxState.rskAddressSelected,
      refundAddress: this.refundAddress,
      selectedAccount: this.accountBalanceText,
      federationAddress: this.pegInTxState.peginConfiguration.federationAddress,
    };
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

  @Emit('back')
  async back() {
    this.pegInFormState.send('loading');
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

  @Emit()
  startVueTour() {
    this.$tours.pegInTour.start();
    this.isTourActive = true;
  }

  mounted() {
    const newUser = localStorage.getItem('ONBOARDED_USER_PEGIN') !== 'true';
    if (newUser) {
      this.$tours.pegInTour.start();
      this.isTourActive = true;
    } else {
      this.isTourActive = false;
    }
  }
}
</script>
