<template>
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
        <div id="option-1" class="py-4">
          <v-row align="start" class="mx-0">
            <v-col cols="auto" class="pl-0">
              <div v-bind:class="[pegInFormState.matches(['first']) ?
              'number-filled' : 'number']">1</div>
            </v-col>
            <v-col class="pl-0">
              <p v-bind:class="{'boldie': pegInFormState.matches(['first'])}">
                Select {{environmentContext.getBtcText()}} account to send from:
              </p>
              <v-row class="mx-0 mt-4">
                <v-col cols="6" class="pl-0 pb-0">
                  <v-select v-model="btcAccountTypeSelected" :items="accountBalances" color="#fff"
                            label="Select the account" solo dense
                            @focus="pegInFormState.send('first')"
                            @change="checkStep(btcAccountTypeSelected, 1)"/>
                </v-col>
                <v-col cols="1" class="pb-0 pt-5">
                  <v-tooltip right>
                    <template v-slot:activator="{ on, attrs }">
                      <v-icon
                        small
                        color="teal darken-2"
                        v-bind="attrs"
                        v-on="on"
                      >
                        mdi-information
                      </v-icon>
                    </template>
                    <p v-if="isLedgerWallet" class="tooltip-form mb-0">
                      Native segwit is coming soon for Ledger devices!
                    </p>
                    <p v-if="isLedgerWallet" class="tooltip-form mb-0">
                      Listed amounts represent the balance up to the first {{maxAddressesLedger}}
                      addresses from Legacy and Segwit accounts including change.
                    </p>
                    <span v-if="!isLedgerWallet">
                      Listed amounts represent the balance up to the first {{maxAddressesTrezor}}
                      addresses from Legacy, Segwit and Native segwit accounts including change.
                    </span>
                  </v-tooltip>
                </v-col>
                <v-col v-if="loadingBalances" cols="5" class="d-flex align-start pa-0">
                  <v-row class="d-flex justify-start pt-6 ma-0">
                    <span class="d-flex align-center">Loading balances   </span>
                    <v-progress-circular
                      size="17"
                      width="2"
                      indeterminate
                      color="#C4C4C4"
                      class="mx-5"
                    ></v-progress-circular>
                  </v-row>
                </v-col>
              </v-row>
            </v-col>
          </v-row>
        </div>
        <v-divider color="#C4C4C4"/>
        <div id="option-2" class="py-4">
          <v-row align="start" class="mx-0">
            <v-col cols="auto" class="pl-0">
              <div v-bind:class="[pegInFormState.matches(['second']) ?
              'number-filled' : 'number']">2</div>
            </v-col>
            <v-col class="pl-0 mb-4">
              <p v-bind:class="{'boldie': pegInFormState.matches(['second'])}">
                Enter the amount you want to send:
              </p>
              <v-row class="mx-0 mt-4 pb-0 d-flex align-center">
                <v-col cols="4" v-bind:class="[amountStyle]" class="input-box-outline">
                  <v-col cols="8" class="pa-0 pl-1">
                    <v-text-field solo hide-details full-width single-line flat
                                  v-model="bitcoinAmount" type="number"
                                  step="0.00000001"
                                  @keydown="blockLetterKeyDown"
                                  @focus="pegInFormState.send('second')"
                                  @change="checkStep(peginTxState.bitcoinWallet, 2)"/>
                  </v-col>
                  <v-col cols="4" class="pa-0">
                    <v-row>
                      <v-col cols="5" class="pa-0">
                        <v-img src="@/assets/exchange/btc.png" height="20" contain/>
                      </v-col>
                      <v-col cols="7" class="pa-0 d-flex align-center">
                        <span>{{environmentContext.getBtcTicker()}}</span>
                      </v-col>
                    </v-row>
                  </v-col>
                </v-col>
                <v-col cols="1" class="d-flex justify-center">
                  <v-icon color="#000">mdi-arrow-right</v-icon>
                </v-col>
                <v-col cols="4" class="pa-0 input-box-flat">
                  <v-col cols="8" class="pa-0 pl-1">
                    <v-text-field solo hide-details full-width single-line flat readonly
                                  v-model="rbtcAmount" type="number"/>
                  </v-col>
                  <v-col cols="4" class="pa-0">
                    <v-row>
                      <v-col cols="5" class="pa-0">
                        <v-img src="@/assets/exchange/rbtc.png" height="20" contain/>
                      </v-col>
                      <v-col cols="7" class="pa-0 d-flex align-center">
                        <span>{{environmentContext.getRbtcTicker()}}</span>
                      </v-col>
                    </v-row>
                  </v-col>
                </v-col>
                <v-col/>
              </v-row>
              <v-row class="mx-0" v-if="!secondDone && amountStyle !== ''">
                <span class="yellowish">
                  {{amountErrorMessage}}
                </span>
              </v-row>
            </v-col>
          </v-row>
        </div>
        <v-divider class="ml-6 mx-3" color="#C4C4C4"/>
        <div id="option-3" class="py-4">
          <v-row align="start" class="mx-0">
            <v-col cols="auto" class="pl-0">
              <div v-bind:class="[pegInFormState.matches(['third']) ?
              'number-filled' : 'number']">3</div>
            </v-col>
            <v-col class="pl-0">
              <p v-bind:class="{'boldie': pegInFormState.matches(['third'])}">
                Enter or select the {{environmentContext.getRskText()}} address where
                {{environmentContext.getRbtcTicker()}} will be deposited:
              </p>
              <v-row class="mx-0 mt-4">
                <template v-if="useWeb3Wallet && web3Address">
                  <div class="container">
                    <v-row class="mx-0">
                      <span>Wallet connected</span>
                    </v-row>
                    <v-row class="mx-0 d-flex align-center">
                      <p class="mb-0 account">{{ web3Address }}</p>
                    </v-row>
                    <v-row class="mx-0"
                      v-show="(!isValidRskAddress || !isValidPegInAddress)
                      && (rskAddressSelected || web3Address)">
                      <span class="yellowish">
                        {{validAddressMessage}}
                      </span>
                    </v-row>
                    <v-row class="mx-0">
                      <v-btn class="pa-0" text @click="disconnectWallet">
                        <span class="blueish">Disconnect wallet</span>
                      </v-btn>
                    </v-row>
                  </div>
                </template>
                <template v-else>
                  <v-col cols="6" class="pl-0 pb-0">
                    <v-row class="mx-0 mb-4 d-flex justify-start">
                      <span class="text-center">
                        Use your {{environmentContext.getRskText()}} addresses
                      </span>
                    </v-row>
                    <v-row :class="[isValidRskAddress || !rskAddressSelected ?
                     'blue-box' : 'yellow-box' ]"
                           class="input-box-outline mx-0 pa-0 pl-1" >
                      <v-text-field v-model="rskAddressSelected" solo dense
                                    flat
                                    hide-details
                                    :label="`Select or paste
                                    the ${environmentContext.getRskText()} address`"
                                    @focus="pegInFormState.send('third')"
                                    @change="checkStep(rskAddressSelected, 3)"/>
                    </v-row>
                    <v-row v-show="!isValidRskAddress && rskAddressSelected" class="mx-0">
                      <span class="yellowish">
                        {{validAddressMessage}}
                      </span>
                    </v-row>
                  </v-col>
                  <v-col cols="1" class="d-flex justify-center pb-0">
                    <div class="divider"/>
                  </v-col>
                  <v-col cols="5" class="pb-0 px-0">
                    <v-row class="mx-0 mb-4 d-flex justify-start">
                      <span class="text-center">Choose address from web wallet</span>
                    </v-row>
                    <v-row class="mx-0 d-flex justify-center">
                      <v-btn outlined rounded color="#00B520" width="100%" height="38"
                             @click="selectRLoginWallet" >
                        <span class="greenish">Connect wallet</span>
                      </v-btn>
                    </v-row>
                  </v-col>
                </template>
              </v-row>
            </v-col>
            <v-icon color="#C4C4C4">mdi-info-outlined</v-icon>
          </v-row>
        </div>
        <v-divider class="mx-3" color="#C4C4C4"/>
        <div id="option-4" class="py-4">
          <v-row align="start" class="mx-0">
            <v-col cols="auto" class="pl-0">
              <div v-bind:class="[pegInFormState.matches(['fourth']) ?
              'number-filled' : 'number']">4</div>
            </v-col>
            <v-col class="pl-0">
              <p v-bind:class="{'boldie' : pegInFormState.matches(['fourth'])}">
                Select transaction fee:
              </p>
              <v-row class="mx-0 mt-4 d-flex justify-start">
                <v-col cols="11 pl-0">
                  <v-row class="mx-0">
                    <v-slider v-model="txFeeIndex" :tick-labels="transactionFees" :max="2"
                              :color="txFeeColor" :track-color="txFeeColor" step="1"
                              @focus="pegInFormState.send('fourth')"
                              @change="checkStep('fee', 4)"/>
                  </v-row>
                  <v-row class="mx-0">
                    <v-col cols="4" class="d-flex justify-start pa-0">
                      <span class="text-left">{{ slowFee }}
                      {{environmentContext.getBtcTicker()}}</span>
                    </v-col>
                    <v-col cols="4" class="d-flex justify-center pa-0">
                      <span class="text-center">{{ averageFee }}
                      {{environmentContext.getBtcTicker()}}</span>
                    </v-col>
                    <v-col cols="4" class="d-flex justify-end pa-0">
                      <span class="text-right">{{ fastFee }}
                      {{environmentContext.getBtcTicker()}}</span>
                    </v-col>
                  </v-row>
                  <v-row class="mx-0">
                    <v-col cols="4" class="d-flex justify-start pa-0">
                      <span class="boldie text-left">$ {{ slowFeeUSD }}</span>
                    </v-col>
                    <v-col cols="4" class="d-flex justify-center pa-0">
                      <span class="boldie text-center">$ {{ averageFeeUSD }}</span>
                    </v-col>
                    <v-col cols="4" class="d-flex justify-end pa-0">
                      <span class="boldie text-right">$ {{ fastFeeUSD }}</span>
                    </v-col>
                  </v-row>
                </v-col>
              </v-row>
            </v-col>
          </v-row>
        </div>
      </v-col>
      <v-col id="summary-col" cols="4" lg="5">
        <v-col cols="12" offset-xl="1" xl="11" class="pa-0">
          <v-row class="mx-0 my-4">
            <h2>Transaction summary:</h2>
          </v-row>
          <v-row class="mx-0 summary-box">
            <v-container id="summary-box-container">
              <v-container id="summary-1" class="pb-0 pl-0">
                <v-row class="mx-0">
                  <h1>Device account:</h1>
                  <v-icon v-if="firstDone" class="ml-2" small color="#008CFF">
                    mdi-check-circle-outline
                  </v-icon>
                </v-row>
              </v-container>
              <v-container class="pt-4 pl-0">
                <p v-bind:class="{'grayish': computedBTCAddress === VALUE_INCOMPLETE_MESSAGE}">
                  {{ computedBTCAddress }}
                </p>
              </v-container>
              <v-divider color="#C4C4C4"/>
              <v-container id="summary-2" class="pb-0 pl-0">
                <v-row class="mx-0">
                  <h1>{{environmentContext.getBtcText()}}s:</h1>
                  <v-icon v-if="secondDone" class="ml-2" small color="#008CFF">
                    mdi-check-circle-outline
                  </v-icon>
                </v-row>
              </v-container>
              <v-container class="pt-4 pb-0 pl-0">
                <p v-bind:class="{'grayish': computedBTCAmount === VALUE_INCOMPLETE_MESSAGE}">
                  {{ computedBTCAmount }}
                </p>
              </v-container>
              <v-container class="pt-0 pl-0">
                <span>USD $ {{ computedBTCAmountUSD }}</span>
              </v-container>
              <v-divider color="#C4C4C4"/>
              <v-container id="summary-3" class="pb-0 pl-0">
                <v-row class="mx-0">
                  <h1>Destination {{environmentContext.getRskText()}} address:</h1>
                  <v-icon v-if="thirdDone" class="ml-2" small color="#008CFF">
                    mdi-check-circle-outline
                  </v-icon>
                </v-row>
              </v-container>
              <v-container class="pt-4 pl-0">
                <v-row class="mx-0 d-none d-lg-block">
                  <p v-bind:class="{'grayish': computedRskAddress === VALUE_INCOMPLETE_MESSAGE}">
                    {{ computedRskAddress }}
                  </p>
                </v-row>
                <v-row class="mx-0 d-lg-none">
                  <p v-bind:class="{'grayish': computedRskAddress === VALUE_INCOMPLETE_MESSAGE}">
                    {{ croppedComputedRskAddress }}
                  </p>
                </v-row>
              </v-container>
              <v-divider color="#C4C4C4"/>
              <v-container id="summary-4" class="pb-0 pl-0">
                <v-row class="mx-0">
                  <h1>Refund {{environmentContext.getBtcTicker()}} address:</h1>
                  <v-icon v-if="fourthDone" class="ml-2" small color="#008CFF">
                    mdi-check-circle-outline
                  </v-icon>
                </v-row>
              </v-container>
              <v-container class="pt-4 pl-0">
                <v-row class="mx-0 d-none d-lg-block">
                  <p v-bind:class="{
                    'grayish': computedRefundBTCAddress === VALUE_INCOMPLETE_MESSAGE
                  }">
                    {{ computedRefundBTCAddress }}
                  </p>
                </v-row>
                <v-row class="mx-0 d-lg-none">
                  <p v-bind:class="{
                    'grayish': computedRefundBTCAddress === VALUE_INCOMPLETE_MESSAGE
                  }">
                    {{ croppedComputedRefundBTCAddress }}
                  </p>
                </v-row>
              </v-container>
              <v-divider color="#C4C4C4"/>
              <v-container id="summary-5" class="pb-0 pl-0">
                <v-row class="mx-0">
                  <h1>Transaction fee:</h1>
                  <v-icon v-if="fourthDone" class="ml-2" small color="#008CFF">
                    mdi-check-circle-outline
                  </v-icon>
                </v-row>
              </v-container>
              <v-container class="pt-4 pb-0 pl-0">
                <p v-bind:class="{'grayish': computedTxFee === VALUE_INCOMPLETE_MESSAGE}">
                  {{ computedTxFee }}
                </p>
              </v-container>
              <v-container class="pt-0 pl-0">
                <span>USD $ {{ computedTxFeeUSD }}</span>
              </v-container>
              <v-divider color="#C4C4C4"/>
              <v-container id="summary-6" class="pb-0 pl-0">
                <v-row class="mx-0">
                  <h1>Transaction total:</h1>
                  <v-icon v-if="fourthDone" class="ml-2" small color="#008CFF">
                    mdi-check-circle-outline
                  </v-icon>
                </v-row>
              </v-container>
              <v-container class="pt-4 pb-0 pl-0">
                <p v-bind:class="{'grayish': computedBTCAmount === VALUE_INCOMPLETE_MESSAGE}">
                  {{ computedFeePlusAmount }}
                </p>
              </v-container>
              <v-container class="pt-0 pl-0">
                <span>USD $ {{ computedFeePlusAmountUSD }}</span>
              </v-container>
            </v-container>
          </v-row>
        </v-col>
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
               @click="sendTx" :disabled="!formFilled || pegInFormState.matches(['goingHome'])">
          <span class="whiteish">Continue</span>
          <v-icon class="ml-2" color="#fff">mdi-send-outline</v-icon>
        </v-btn>
        <v-progress-circular v-if="pegInFormState.matches(['loading'])"
                             indeterminate color="#00B520" class="mr-10"/>
      </v-col>
    </v-row>
    <v-row>
      <address-warning-dialog :address="computedRskAddress"
                              :show-dialog="showWarningMessage"
                              @continue="createTx"
                              @cancel="showWarningMessage = false"
      />
    </v-row>
    <template v-if="showTxErrorDialog">
      <tx-error-dialog :showTxErrorDialog="showTxErrorDialog"
                       :errorMessage="txError" @closeErrorDialog="closeTxErrorDialog"/>
   </template>
  </v-col>
</template>
<script lang="ts">

import {
  Vue,
  Component, Prop, Emit, Watch,
} from 'vue-property-decorator';
import { Action, Getter, State } from 'vuex-class';
import * as rskUtils from '@rsksmart/rsk-utils';
import Big from 'big.js';
import * as constants from '@/store/constants';
import { AccountBalance, FeeAmountData, PegInFormValues } from '@/types';
import Wallet from '@/components/web3/Wallet.vue';
import AddressWarningDialog from '@/components/exchange/AddressWarningDialog.vue';
import { SessionState } from '@/store/session/types';
import { PegInTxState } from '@/store/peginTx/types';
import { Machine } from '@/services/utils';
import SatoshiBig from '@/types/SatoshiBig';
import { EnvironmentAccessorService } from '@/services/enviroment-accessor.service';
import ApiService from '@/services/ApiService';
import EnvironmentContextProviderService from '@/providers/EnvironmentContextProvider';

@Component({
  components: {
    Wallet,
    AddressWarningDialog,
  },
})
export default class SendBitcoinForm extends Vue {
  btcAccountTypeSelected = '';

  bitcoinAmount = 0.0; // SatoshiBN

  rskAddressSelected = '';

  txFeeIndex = 1.0;

  pegInFormState: Machine<
    'loading'
    | 'first'
    | 'second'
    | 'third'
    | 'fourth'
    | 'goingHome'
    > = new Machine('first');

  firstDone = false;

  secondDone = false;

  thirdDone = false;

  fourthDone = true;

  refundAddressFromWallet = false;

  web3Wallet = false;

  configureWeb3Wallet = false;

  useWeb3Wallet = false;

  showWarningMessage = false;

  amountStyle = '';

  transactionFees = ['Slow', 'Average', 'Fast'];

  accountBalances: {
    text: string;
    value: string;
    disabled: boolean;
  }[] = [];

  CHAIN_ID =
    EnvironmentAccessorService.getEnvironmentVariables().vueAppCoin
    === constants.BTC_NETWORK_MAINNET ? 30 : 31;

  fixedUSDDecimals = 2;

  VALUE_INCOMPLETE_MESSAGE = 'Not completed';

  awaitFeeLoad!: Promise<void>;

  fees: FeeAmountData = {
    slow: new SatoshiBig(0, 'satoshi'),
    average: new SatoshiBig(0, 'satoshi'),
    fast: new SatoshiBig(0, 'satoshi'),
  };

  txError = '';

  showTxErrorDialog = false;

  environmentContext = EnvironmentContextProviderService.getEnvironmentContext();

  @Prop() loadingBalances!: boolean;

  @Prop() pegInFormData!: PegInFormValues;

  @Prop() price!: number;

  @Prop() balances!: AccountBalance;

  @Prop() addresses!: [];

  @Prop() unusedAddresses?: [];

  @State('pegInTx') peginTxState!: PegInTxState;

  @State('web3Session') web3SessionState!: SessionState;

  @Getter(constants.WALLET_NAME, { namespace: 'pegInTx' }) walletName!: string;

  @Getter(constants.PEGIN_TX_GET_REFUND_ADDRESS, { namespace: 'pegInTx' }) refundAddress!: string;

  @Action(constants.WEB3_SESSION_CLEAR_ACCOUNT, { namespace: 'web3Session' }) clearAccount !: any;

  @Action(constants.SESSION_CONNECT_WEB3, { namespace: 'web3Session' }) connectWeb3 !: any;

  // eslint-disable-next-line class-methods-use-this
  get maxAddressesLedger(): number {
    return EnvironmentAccessorService.getEnvironmentVariables().vueAppWalletAddressesPerCallLedger
      * EnvironmentAccessorService.getEnvironmentVariables().vueAppWalletMaxCallLedger;
  }

  // eslint-disable-next-line class-methods-use-this
  get maxAddressesTrezor(): number {
    return EnvironmentAccessorService.getEnvironmentVariables().vueAppWalletAddressesPerCallTrezor
      * EnvironmentAccessorService.getEnvironmentVariables().vueAppWalletMaxCallTrezor;
  }

  get safeAmount(): SatoshiBig {
    return new SatoshiBig(this.bitcoinAmount, 'btc');
  }

  get safeTxFee(): SatoshiBig {
    if (this.txFeeIndex === 0) return this.fees.slow;
    if (this.txFeeIndex === 1) return this.fees.average;
    if (this.txFeeIndex === 2) return this.fees.fast;
    return new SatoshiBig('0', 'satoshi');
  }

  get amountErrorMessage() { // mayor rework
    const feePlusAmount: SatoshiBig = this.safeAmount.plus(this.safeTxFee);
    const minValue: SatoshiBig = new SatoshiBig(this.peginTxState.peginConfiguration.minValue, 'satoshi');
    const maxValue: SatoshiBig = new SatoshiBig(this.peginTxState.peginConfiguration.maxValue, 'satoshi');
    if (this.bitcoinAmount.toString() === '') {
      return 'Please, enter an amount';
    }
    if (!this.isBTCAmountValidNumberRegex) {
      return 'Invalid format, neither letters, big amounts nor more than 8 decimals are allowed';
    }
    if (this.safeAmount.lt(minValue)) {
      return `You can not send this amount of ${this.environmentContext.getBtcTicker()}. You can only send a minimum of ${minValue.toBTCTrimmedString()} ${this.environmentContext.getBtcTicker()}`;
    }
    if (feePlusAmount.gte(this.selectedAccountBalance)) {
      return 'The typed amount, along with the transaction fee, is higher than your current balance';
    }
    if (this.safeAmount.gt(maxValue)) {
      return `The maximum amount currently allowed by this tool is ${maxValue.toBTCTrimmedString()} ${this.environmentContext.getBtcTicker()}`;
    }
    return 'Invalid format';
  }

  get rbtcAmount() {
    return this.bitcoinAmount;
  }

  get computedBTCAddress() {
    return this.btcAccountTypeSelected !== '' ? this.getAccountBalanceText(this.btcAccountTypeSelected) : this.VALUE_INCOMPLETE_MESSAGE;
  }

  get computedRefundBTCAddress() {
    return this.refundAddress !== '' ? this.refundAddress : this.VALUE_INCOMPLETE_MESSAGE;
  }

  get croppedComputedRefundBTCAddress() {
    return this.getChunkedValue(this.computedRefundBTCAddress);
  }

  get computedRskAddress() {
    if (this.rskAddressSelected !== ''
      && rskUtils.isAddress(this.rskAddressSelected)
      && this.rskAddressSelected.startsWith('0x')) {
      return this.rskAddressSelected;
    }
    if (this.useWeb3Wallet && this.web3Address !== '') {
      return this.web3Address;
    }
    return this.VALUE_INCOMPLETE_MESSAGE;
  }

  get croppedComputedRskAddress() {
    return this.getChunkedValue(this.computedRskAddress);
  }

  get computedBTCAmount(): string {
    if (!this.isBTCAmountValidNumberRegex || this.safeAmount.lte('0')) {
      return this.VALUE_INCOMPLETE_MESSAGE;
    }
    return `${this.safeAmount.toBTCString()} ${this.environmentContext.getBtcTicker()}`;
  }

  get computedBTCAmountUSD(): string {
    if (!this.isBTCAmountValidNumberRegex || this.safeAmount.lte('0')) return '0.00';
    return this.safeAmount.toUSDFromBTCString(this.price, this.fixedUSDDecimals);
  }

  get computedTxFee(): string {
    return this.fourthDone ? `${this.safeTxFee.toBTCString()} ${this.environmentContext.getBtcTicker()}` : this.VALUE_INCOMPLETE_MESSAGE;
  }

  get computedTxFeeUSD(): string {
    return this.fourthDone ? this.safeTxFee.toUSDFromBTCString(this.price, this.fixedUSDDecimals) : '0.00';
  }

  get computedFeePlusAmount(): string {
    const feePlusAmount: SatoshiBig = this.safeAmount.plus(this.safeTxFee);
    return this.fourthDone && this.secondDone
      ? `${feePlusAmount.toBTCString()} ${this.environmentContext.getBtcTicker()}` : this.VALUE_INCOMPLETE_MESSAGE;
  }

  get computedFeePlusAmountUSD(): string {
    const amountUSD: Big = Big(this.computedBTCAmountUSD);
    const txFeeUSD: Big = Big(this.computedTxFeeUSD);
    const feePlusAmountUSD: Big = amountUSD.plus(txFeeUSD);
    return this.fourthDone && this.secondDone
      ? feePlusAmountUSD.toFixed(this.fixedUSDDecimals) : '0.00';
  }

  get txFeeColor() {
    let color;
    if (this.txFeeIndex === 0) color = '#F6C61B';
    if (this.txFeeIndex === 1) color = '#737778';
    if (this.txFeeIndex === 2) color = '#00B43C';
    return color;
  }

  get fullTxFee(): string {
    let txFee = '';
    const btcTicker = this.environmentContext.getBtcTicker();
    if (this.txFeeIndex === 0) txFee = `Slow - ${this.fees.slow.toBTCString()} ${btcTicker}`;
    if (this.txFeeIndex === 1) txFee = `Average - ${this.fees.average.toBTCString()} ${btcTicker}`;
    if (this.txFeeIndex === 2) txFee = `Fast - ${this.fees.fast.toBTCString()} ${btcTicker}`;
    return txFee;
  }

  get formFilled() {
    return this.firstDone && this.secondDone && this.thirdDone
      && this.fourthDone;
  }

  get web3Address() {
    return this.web3SessionState.account ?? '';
  }

  get slowFee() {
    return this.fees.slow.toBTCString();
  }

  get slowFeeUSD() {
    return this.fees.slow.toUSDFromBTCString(this.price, this.fixedUSDDecimals);
  }

  get averageFee() {
    return this.fees.average.toBTCString();
  }

  get averageFeeUSD() {
    return this.fees.average.toUSDFromBTCString(this.price, this.fixedUSDDecimals);
  }

  get fastFee() {
    return this.fees.fast.toBTCString();
  }

  get fastFeeUSD() {
    return this.fees.fast.toUSDFromBTCString(this.price, this.fixedUSDDecimals);
  }

  get insufficientAmount() {
    const feePlusAmount: SatoshiBig = this.safeAmount.plus(this.safeTxFee);
    const minValue: SatoshiBig = new SatoshiBig(this.peginTxState.peginConfiguration.minValue, 'satoshi');
    const maxValue: SatoshiBig = new SatoshiBig(this.peginTxState.peginConfiguration.maxValue, 'satoshi');
    if (this.safeAmount.lte('0')
      || feePlusAmount.gt(this.selectedAccountBalance)
      || this.safeAmount.lt(minValue)
      || this.safeAmount.gt(maxValue)) {
      return true;
    }
    if (this.safeAmount.gt('0') && feePlusAmount.lte(this.selectedAccountBalance)) {
      return false;
    }
    return false;
  }

  get isBTCAmountValidNumberRegex() {
    return /^[0-9]{1,8}(\.[0-9]{0,8})?$/.test(this.bitcoinAmount.toString());
  }

  get selectedAccountBalance(): SatoshiBig {
    switch (this.btcAccountTypeSelected) {
      case constants.BITCOIN_LEGACY_ADDRESS:
        return this.balances.legacy;
      case constants.BITCOIN_NATIVE_SEGWIT_ADDRESS:
        return this.balances.nativeSegwit;
      case constants.BITCOIN_SEGWIT_ADDRESS:
        return this.balances.segwit;
      default:
        break;
    }
    return new SatoshiBig('0', 'satoshi');
  }

  get isValidRskAddress() {
    return !this.useWeb3Wallet
      ? rskUtils.isValidChecksumAddress(this.computedRskAddress, this.CHAIN_ID) : true;
  }

  get isValidPegInAddress() {
    return rskUtils.isAddress(this.computedRskAddress, this.CHAIN_ID) && this.computedRskAddress.startsWith('0x');
  }

  get validAddressMessage() {
    let message = '';
    if (!this.isValidPegInAddress) message = 'This is an invalid address';
    else if (!this.isValidRskAddress) message = `This may not be a valid address on the ${this.environmentContext.getRskText()} network. Please check.`;
    return message;
  }

  // eslint-disable-next-line class-methods-use-this
  getChunkedValue(value: string) {
    return `${value.substr(0, 6)}...${value.substr(value.length - 6, value.length)}`;
  }

  // eslint-disable-next-line class-methods-use-this
  safeToBig(s: number | string | Big): Big {
    return (s.toString() === '' ? Big('0') : Big(s));
  }

  @Watch('btcAccountTypeSelected')
  watchBTCAccountTypeSelected() {
    this.secondDone = this.isBTCAmountValidNumberRegex && !this.insufficientAmount;
    this.amountStyle = this.secondDone ? 'green-box' : 'yellow-box';
  }

  @Watch('bitcoinAmount')
  watchBitcoinAmount() {
    this.secondDone = this.isBTCAmountValidNumberRegex && !this.insufficientAmount;
    this.amountStyle = this.secondDone ? 'green-box' : 'yellow-box';
  }

  @Watch('rskAddressSelected')
  watchRSKAddressSelected() {
    this.thirdDone = (rskUtils.isAddress(this.computedRskAddress) && this.computedRskAddress.startsWith('0x'))
      || (this.useWeb3Wallet && this.web3Address !== '');
  }

  @Watch('web3SessionState.account')
  watchWeb3Address() {
    this.thirdDone = (rskUtils.isAddress(this.computedRskAddress) && this.computedRskAddress.startsWith('0x'))
      || (this.useWeb3Wallet && this.web3Address !== '');
  }

  @Emit()
  selectRLoginWallet() {
    this.pegInFormState.send('third');
    this.useWeb3Wallet = true;
    this.rskAddressSelected = '';
    this.connectWeb3();
    this.web3Wallet = true;
  }

  @Emit()
  disconnectWallet() {
    this.clearAccount();
    this.useWeb3Wallet = false;
    this.rskAddressSelected = '';
    this.web3Wallet = false;
    this.thirdDone = false;
  }

  backHome() {
    this.pegInFormState.send('goingHome');
    this.$router.go(0);
  }

  @Emit('unused')
  getAddressesFromWallet() {
    this.refundAddressFromWallet = !this.refundAddressFromWallet;
    let accType = this.btcAccountTypeSelected;
    if (this.btcAccountTypeSelected === constants.BITCOIN_NATIVE_SEGWIT_ADDRESS) {
      accType = constants.BITCOIN_SEGWIT_ADDRESS;
    }
    return {
      flag: this.refundAddressFromWallet,
      accountType: accType,
    };
  }

  blockLetterKeyDown(e: KeyboardEvent) {
    if (this.bitcoinAmount.toString().length > 15
      && !(e.key === 'Backspace'
        || e.key === 'Delete'
        || e.key === 'Home'
        || e.key === 'End'
        || e.key === 'ArrowRight'
        || e.key === 'ArrowLeft')) e.preventDefault();
    if (e.key === 'e') e.preventDefault();
    if (e.key === '+') e.preventDefault();
    if (e.key === '-') e.preventDefault();
  }

  @Emit()
  checkStep(value: string, step: number) {
    if (value) {
      switch (step) {
        case 1: {
          this.firstDone = true;
          this.secondDone = this.isBTCAmountValidNumberRegex && !this.insufficientAmount;
          if (this.firstDone && this.secondDone) {
            this.calculateTxFee();
          }
          break;
        }
        case 2: {
          this.secondDone = this.isBTCAmountValidNumberRegex && !this.insufficientAmount;
          if (this.firstDone && this.secondDone && value !== 'feeGot') {
            this.calculateTxFee();
          }
          break;
        }
        case 3: {
          this.thirdDone = this.isValidPegInAddress && !this.insufficientAmount;
          break;
        }
        case 4: {
          this.fourthDone = !this.insufficientAmount;
          break;
        }
        default: {
          break;
        }
      }
    }
  }

  @Emit()
  sendTx() {
    if (this.isValidPegInAddress && !this.isValidRskAddress) this.showWarningMessage = true;
    else this.createTx();
  }

  @Emit()
  closeTxErrorDialog() {
    this.showTxErrorDialog = false;
  }

  @Emit('createTx')
  async createTx() {
    this.showWarningMessage = false;
    this.pegInFormState.send('loading');
    await this.awaitFeeLoad;
    let selectedFee;
    switch (this.txFeeIndex) {
      case 0:
        selectedFee = constants.BITCOIN_SLOW_FEE_LEVEL;
        break;
      case 1:
        selectedFee = constants.BITCOIN_AVERAGE_FEE_LEVEL;
        break;
      case 2:
        selectedFee = constants.BITCOIN_FAST_FEE_LEVEL;
        break;
      default:
        selectedFee = constants.BITCOIN_AVERAGE_FEE_LEVEL;
        break;
    }
    return {
      amountToTransferInSatoshi: this.safeAmount,
      refundAddress: this.refundAddress,
      recipient: this.computedRskAddress,
      feeLevel: selectedFee,
      feeBTC: this.safeTxFee,
      accountType: this.btcAccountTypeSelected,
      pegInFormData: {
        amount: this.safeAmount,
        accountType: this.btcAccountTypeSelected,
        rskAddress: this.computedRskAddress,
        txFeeIndex: this.txFeeIndex,
      },
    };
  }

  @Emit()
  calculateTxFee() {
    this.awaitFeeLoad = new Promise<void>((resolve, reject) => {
      ApiService.getTxFee(
        this.peginTxState.sessionId,
        Number(this.safeAmount.toSatoshiString()),
        this.btcAccountTypeSelected,
      )
        .then((txFee) => {
          this.fees = {
            slow: new SatoshiBig(txFee.slow, 'satoshi'),
            average: new SatoshiBig(txFee.average, 'satoshi'),
            fast: new SatoshiBig(txFee.fast, 'satoshi'),
          };
          this.checkStep('feeGot', 2);
          resolve();
        })
        .catch(reject);
    });
  }

  @Emit()
  toWeb3Wallet() {
    this.pegInFormState.send('third');
    this.useWeb3Wallet = true;
    this.web3Wallet = true;
  }

  @Emit()
  connectWallet(flag: boolean) {
    this.web3Wallet = false;
    this.configureWeb3Wallet = flag;
    this.thirdDone = true;
  }

  get isLedgerWallet() {
    return this.peginTxState.bitcoinWallet === constants.WALLET_LEDGER;
  }

  fillStoredPegInFormData() {
    this.btcAccountTypeSelected = this.pegInFormData.accountType;
    this.firstDone = this.pegInFormData.accountType !== '';
    this.bitcoinAmount = Number(this.pegInFormData.amount.toBTCString());
    this.secondDone = this.isBTCAmountValidNumberRegex && !this.insufficientAmount;
    this.useWeb3Wallet = this.pegInFormData.rskAddress !== '';
    this.rskAddressSelected = this.pegInFormData.rskAddress;
    this.thirdDone = this.pegInFormData.rskAddress !== '';
    this.txFeeIndex = this.pegInFormData.txFeeIndex;
  }

  getAccountBalanceText(accountType: string): string {
    let text = '';
    const btcTicker = this.environmentContext.getBtcTicker();
    switch (accountType) {
      case constants.BITCOIN_LEGACY_ADDRESS:
        text = `Legacy account - ${this.balances.legacy.toBTCTrimmedString()} ${btcTicker}`;
        break;
      case constants.BITCOIN_SEGWIT_ADDRESS:
        text = `Segwit account - ${this.balances.segwit.toBTCTrimmedString()} ${btcTicker}`;
        break;
      case constants.BITCOIN_NATIVE_SEGWIT_ADDRESS:
        text = `Native segwit account - ${this.balances.nativeSegwit.toBTCTrimmedString()} ${btcTicker}`;
        break;
      default:
        break;
    }
    return text;
  }

  @Watch('balances')
  fillAccountBalances() {
    this.accountBalances.forEach((accountItem, idx) => {
      this.accountBalances[idx].text = this.getAccountBalanceText(accountItem.value);
    });
    this.checkStep('addingBalances', 2);
  }

  created() {
    this.accountBalances = [
      {
        text: this.getAccountBalanceText(constants.BITCOIN_SEGWIT_ADDRESS),
        value: constants.BITCOIN_SEGWIT_ADDRESS,
        disabled: false,
      },
      {
        text: this.getAccountBalanceText(constants.BITCOIN_LEGACY_ADDRESS),
        value: constants.BITCOIN_LEGACY_ADDRESS,
        disabled: false,
      },
      {
        text: this.getAccountBalanceText(constants.BITCOIN_NATIVE_SEGWIT_ADDRESS),
        value: constants.BITCOIN_NATIVE_SEGWIT_ADDRESS,
        disabled: this.peginTxState.bitcoinWallet === constants.WALLET_LEDGER,
      },
    ];
    this.fillStoredPegInFormData();
  }
}
</script>
