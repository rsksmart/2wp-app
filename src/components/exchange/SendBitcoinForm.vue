<template>
  <v-col class="exchange-form px-0">
    <v-row class="mx-0">
      <v-col cols="1" class="pa-0 d-flex align-center">
        <v-img position="center left"
               src="@/assets/exchange/arrow.png" height="40" contain/>
      </v-col>
      <v-col class="px-0">
        <h1 class="text-left">Send Bitcoins. Get RBTC.</h1>
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
                Select Bitcoin account to send from:
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
                      Listed amounts represent the balance of the first 2 addresses
                      from Legacy and Segwit accounts including change.
                    </p>
                    <span v-if="!isLedgerWallet">
                      Listed amounts represent the balance of the first 2 addresses from Legacy,
                      Segwit and Native segwit accounts including change.
                    </span>
                  </v-tooltip>
                </v-col>
                <v-col v-if="false" cols="5" class="d-flex justify-center pb-0">
                  <v-btn outlined rounded color="#00B520" width="100%" height="38px" disabled>
                    <span class="grayish">Extensive search</span>
                  </v-btn>
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
                        <span>BTC</span>
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
                        <span>RBTC</span>
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
                Enter or select the RSK address where RBTC will be deposited:
              </p>
              <v-row class="mx-0 mt-4">
                <template v-if="useWeb3Wallet && web3Address">
                  <div class="container">
                    <v-row class="mx-0">
                      <span>Wallet Connected</span>
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
                        <span class="blueish">Disconnect Wallet</span>
                      </v-btn>
                    </v-row>
                  </div>
                </template>
                <template v-else>
                  <v-col cols="6" class="pl-0 pb-0">
                    <v-row class="mx-0 mb-4 d-flex justify-start">
                      <span class="text-center">Use your RSK addresses </span>
                    </v-row>
                    <v-row :class="[isValidRskAddress || !rskAddressSelected ?
                     'blue-box' : 'yellow-box' ]"
                           class="input-box-outline mx-0 pa-0 pl-1" >
                      <v-text-field v-model="rskAddressSelected" solo dense
                                    flat
                                    hide-details
                                    label="Select or paste the RSK address"
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
                        <span class="greenish">Connect Wallet</span>
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
                      <span class="text-left">{{ slowFee }} BTC</span>
                    </v-col>
                    <v-col cols="4" class="d-flex justify-center pa-0">
                      <span class="text-center">{{ averageFee }} BTC</span>
                    </v-col>
                    <v-col cols="4" class="d-flex justify-end pa-0">
                      <span class="text-right">{{ fastFee }} BTC</span>
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
                  <h1>Bitcoins:</h1>
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
                  <h1>Destination RSK address:</h1>
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
                  <h1>Refund BTC address:</h1>
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
          <v-row class="mx-0 mt-5" justify="end">
            <v-btn v-if="!pegInFormState.matches(['loading'])" large rounded color="#00B43C"
                   @click="sendTx" :disabled="!formFilled">
              <span class="whiteish">Continue</span>
              <v-icon class="ml-2" color="#fff">mdi-send-outline</v-icon>
            </v-btn>
            <v-progress-circular v-if="pegInFormState.matches(['loading'])"
                                 indeterminate color="#00B520" class="mr-10"/>
          </v-row>
        </v-col>
      </v-col>
    </v-row>
    <v-row>
      <address-warning-dialog :address="computedRskAddress"
                              :show-dialog="showWarningMessage"
                              @continue="createTx"
                              @cancel="showWarningMessage = false"
      />
    </v-row>
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
import { Web3SessionState } from '@/store/session/types';
import { PegInTxState } from '@/store/peginTx/types';
import { Machine } from '@/services/utils';
import SatoshiBig from '@/types/SatoshiBig';
import { EnvironmentAccessorService } from '@/services/enviroment-accessor.service';

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

  accountBalances: string[] = [];

  CHAIN_ID =
    EnvironmentAccessorService.getEnvironmentVariables().vueAppCoin
    === constants.BTC_NETWORK_MAINNET ? 30 : 31;

  fixedUSDDecimals = 2;

  VALUE_INCOMPLETE_MESSAGE = 'Not Completed'

  @Prop() pegInFormData!: PegInFormValues;

  @Prop() price!: number;

  @Prop() balances!: AccountBalance;

  @Prop() addresses!: [];

  @Prop() unusedAddresses?: [];

  @Prop() fees!: FeeAmountData;

  @State('pegInTx') peginTxState!: PegInTxState;

  @State('web3Session') web3SessionState!: Web3SessionState;

  @Getter(constants.WALLET_NAME, { namespace: 'pegInTx' }) walletName!: string;

  @Getter(constants.PEGIN_TX_GET_REFUND_ADDRESS, { namespace: 'pegInTx' }) refundAddress!: string;

  @Action(constants.WEB3_SESSION_CLEAR_ACCOUNT, { namespace: 'web3Session' }) clearAccount !: any;

  @Action(constants.SESSION_CONNECT_WEB3, { namespace: 'web3Session' }) connectWeb3 !: any;

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
      return `You can not send this amount of BTC. You can only send a minimum of ${minValue.toBTCTrimmedString()} BTC`;
    }
    if (feePlusAmount.gte(this.selectedAccountBalance)) {
      return 'The typed amount, along with the transaction fee, is higher than your current balance';
    }
    if (this.safeAmount.gt(maxValue)) {
      return `The maximum amount currently allowed by this tool is ${maxValue.toBTCTrimmedString()} BTC`;
    }
    return 'Invalid format';
  }

  get rbtcAmount() {
    return this.bitcoinAmount;
  }

  get computedBTCAddress() {
    return this.btcAccountTypeSelected !== '' ? this.btcAccountTypeSelected : this.VALUE_INCOMPLETE_MESSAGE;
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
    return `${this.safeAmount.toBTCString()} BTC`;
  }

  get computedBTCAmountUSD(): string {
    if (!this.isBTCAmountValidNumberRegex || this.safeAmount.lte('0')) return '0.00';
    return this.safeAmount.toUSDFromBTCString(this.price, this.fixedUSDDecimals);
  }

  get computedTxFee(): string {
    return this.fourthDone ? `${this.safeTxFee.toBTCString()} BTC` : this.VALUE_INCOMPLETE_MESSAGE;
  }

  get computedTxFeeUSD(): string {
    return this.fourthDone ? this.safeTxFee.toUSDFromBTCString(this.price, this.fixedUSDDecimals) : '0.00';
  }

  get computedFeePlusAmount(): string {
    const feePlusAmount: SatoshiBig = this.safeAmount.plus(this.safeTxFee);
    return this.fourthDone && this.secondDone
      ? `${feePlusAmount.toBTCString()} BTC` : this.VALUE_INCOMPLETE_MESSAGE;
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
    if (this.txFeeIndex === 0) txFee = `Slow - ${this.fees.slow.toBTCString()} BTC`;
    if (this.txFeeIndex === 1) txFee = `Average - ${this.fees.average.toBTCString()} BTC`;
    if (this.txFeeIndex === 2) txFee = `Fast - ${this.fees.fast.toBTCString()} BTC`;
    return txFee;
  }

  get formFilled() {
    return this.firstDone && this.secondDone && this.thirdDone
      && this.fourthDone;
  }

  get accountType() {
    if (this.btcAccountTypeSelected[0] === 'L') return constants.BITCOIN_LEGACY_ADDRESS;
    if (this.btcAccountTypeSelected[0] === 'S') return constants.BITCOIN_SEGWIT_ADDRESS;
    if (this.btcAccountTypeSelected[0] === 'M') return constants.BITCOIN_MULTISIGNATURE_ADDRESS;
    if (this.btcAccountTypeSelected[0] === 'N') return constants.BITCOIN_NATIVE_SEGWIT_ADDRESS;
    return '';
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
    switch (this.accountType) {
      case 'BITCOIN_LEGACY_ADDRESS':
        return this.balances.legacy;
      case 'BITCOIN_NATIVE_SEGWIT_ADDRESS':
        return this.balances.nativeSegwit;
      case 'BITCOIN_SEGWIT_ADDRESS':
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
    else if (!this.isValidRskAddress) message = 'This may not be a valid address on the RSK network. Please check.';
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

  @Emit('unused')
  getAddressesFromWallet() {
    this.refundAddressFromWallet = !this.refundAddressFromWallet;
    let accType = this.accountType;
    if (this.accountType === constants.BITCOIN_NATIVE_SEGWIT_ADDRESS) {
      accType = constants.BITCOIN_SEGWIT_ADDRESS;
    }
    return {
      flag: this.refundAddressFromWallet,
      accountType: accType,
    };
  }

  // eslint-disable-next-line class-methods-use-this
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
          if (this.firstDone && this.secondDone) {
            this.calculateTxFee();
          }
          break;
        }
        case 3: {
          this.thirdDone = this.isValidPegInAddress;
          break;
        }
        case 4: {
          this.fourthDone = true;
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

  @Emit('createTx')
  createTx() {
    this.showWarningMessage = false;
    this.pegInFormState.send('loading');
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
      accountType: this.accountType,
      pegInFormData: {
        amount: this.safeAmount,
        accountType: this.btcAccountTypeSelected,
        rskAddress: this.computedRskAddress,
        txFeeIndex: this.txFeeIndex,
      },
    };
  }

  @Emit('txFee')
  calculateTxFee() {
    return {
      amount: Number(this.safeAmount.toSatoshiString()),
      accountType: this.accountType,
    };
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

  created() {
    this.fillStoredPegInFormData();
    if (this.peginTxState.bitcoinWallet === constants.WALLET_LEDGER) {
      this.accountBalances = [
        `Segwit account - ${this.balances.segwit.toBTCTrimmedString()} BTC`, // warning too many
        `Legacy account - ${this.balances.legacy.toBTCTrimmedString()} BTC`,
      ];
    } else {
      this.accountBalances = [
        `Segwit account - ${this.balances.segwit.toBTCTrimmedString()} BTC`,
        `Legacy account - ${this.balances.legacy.toBTCTrimmedString()} BTC`,
        `Native segwit account - ${this.balances.nativeSegwit.toBTCTrimmedString()} BTC`,
      ];
    }
  }
}
</script>
