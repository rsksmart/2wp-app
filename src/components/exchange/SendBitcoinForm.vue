<template>
  <div class="exchange-form">
    <v-row class="mx-0">
      <v-col cols="1" class="pa-0 d-flex align-center justify-start">
        <v-img class="d-flex justify-start"
               src="@/assets/exchange/arrow.png" height="40" contain/>
      </v-col>
      <v-col>
        <h1 class="text-left">Send Bitcoins. Get RBTC.</h1>
      </v-col>
    </v-row>
    <v-row class="mx-0 mt-2">
      <v-col cols="8">
        <div>
          <v-row class="mx-0 d-flex align-center">
            <span v-bind:class="[first ? 'number-filled' : 'number']">1</span>
            <p v-bind:class="{'boldie': first}">Select Bitcoin account to send from:</p>
          </v-row>
          <v-row class="mx-0 my-4">
            <v-col cols="6">
              <v-select v-model="btcAccountTypeSelected" :items="accountBalances" color="#fff"
                        label="Select the account" solo dense
                        @change="checkStep(btcAccountTypeSelected, 1)"/>
            </v-col>
            <v-col cols="2">
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
                <span>Listed amounts represent the the first 2 address balances from Legacy,
                  Segwit and Native segwit accounts including change</span>
              </v-tooltip>
            </v-col>
            <v-col cols="4" class="d-flex justify-center">
              <v-btn outlined rounded color="#00B520" width="220" disabled>
                <span class="grayish">Extensive search</span>
              </v-btn>
            </v-col>
          </v-row>
        </div>
        <v-divider color="#C4C4C4"/>
        <div class="container">
          <v-row class="mx-0 d-flex align-center">
            <span v-bind:class="[second ? 'number-filled' : 'number']">2</span>
            <p v-bind:class="{'boldie': second}">Type the amount you want to convert:</p>
          </v-row>
          <v-row class="mx-0 pb-0 d-flex align-center container">
            <v-col cols="4" v-bind:class="[insufficientAmount ?
             'yellow-box' : amountStyle]" class="input-box-outline">
              <v-col cols="8" class="pa-0 pl-1">
                <v-text-field solo hide-details full-width single-line flat
                              v-model="bitcoinAmount" type="number"
                              @change="checkStep(peginTxState.bitcoinWallet, 2)"/>
              </v-col>
              <v-col cols="4" class="pa-0">
                <v-row>
                  <v-col cols="5" class="pa-0">
                    <v-img src="@/assets/exchange/btc.png" height="20" contain/>
                  </v-col>
                  <v-col cols="7" class="pa-0">
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
                <v-text-field solo hide-details full-width single-line flat
                              v-model="rbtcAmount" type="number"/>
              </v-col>
              <v-col cols="4" class="pa-0">
                <v-row>
                  <v-col cols="5" class="pa-0">
                    <v-img src="@/assets/exchange/rbtc.png" height="20" contain/>
                  </v-col>
                  <v-col cols="7" class="pa-0">
                    <span>RBTC</span>
                  </v-col>
                </v-row>
              </v-col>
            </v-col>
            <v-col/>
          </v-row>
          <v-row class="mx-0 ml-3" v-if="insufficientAmount">
            <span class="yellowish">
              You can not send this amount of BTC. You can only send a minimum of 0.01 BTC
            </span>
          </v-row>
        </div>
        <v-divider class="ml-6 mx-3" color="#C4C4C4"/>
        <div class="container">
          <v-row class="mx-0 d-flex align-center">
            <span v-bind:class="[third ? 'number-filled' : 'number']">3</span>
            <p v-bind:class="{'boldie': third}">
              Select the RSK address you want to receive your RBTC:
            </p>
            <v-icon color="#C4C4C4">mdi-info-outlined</v-icon>
          </v-row>
          <template v-if="useWeb3Wallet && web3Address">
            <div class="container">
              <v-row class="mx-0">
                <span>Wallet Connected</span>
              </v-row>
              <v-row class="mx-0 d-flex align-center">
                <p class="mb-0 account">{{ web3Address }}</p>
              </v-row>
              <v-row class="mx-0">
                <v-btn class="pa-0" text @click="disconnectWallet">
                  <span class="blueish">Disconnect Wallet</span>
                </v-btn>
              </v-row>
            </div>
          </template>
          <template v-else>
            <v-row class="mx-0">
              <v-col cols="7">
                <v-text-field v-model="rskAddressSelected" solo dense
                              label="Select or paste the RSK address"
                              @change="checkStep(rskAddressSelected, 3)"/>
              </v-col>
              <v-col class="d-flex justify-start">
                <div class="divider"/>
              </v-col>
              <v-col cols="4">
                <v-row class="mx-0 d-flex justify-center">
                  <span class="text-center">Use your Software Wallet addresses </span>
                </v-row>
                <v-row class="mx-0 d-flex justify-center">
                  <v-btn outlined rounded color="#00B520" width="220" @click="toWeb3Wallet">
                    <span class="greenish">Connect Wallet</span>
                  </v-btn>
                </v-row>
              </v-col>
            </v-row>
          </template>
        </div>
        <v-divider class="mx-3" color="#C4C4C4"/>
        <div class="container">
          <v-row class="mx-0 d-flex align-center">
            <span v-bind:class="[fourth ? 'number-filled' : 'number']">4</span>
            <p v-bind:class="{'boldie' : fourth}">Select the Transaction Fee:</p>
          </v-row>
          <v-row class="mx-0 d-flex justify-center">
            <v-col cols="11">
              <v-row class="mx-0">
                <v-slider v-model="txFeeIndex" :tick-labels="transactionFees" :max="2"
                          :color="txFeeColor" :track-color="txFeeColor" step="1"
                          @change="checkStep('fee', 4)"/>
              </v-row>
              <v-row class="mx-0">
                <v-col cols="4" class="d-flex justify-start pa-0">
                  <span class="text-left">{{slowFee}} BTC</span>
                </v-col>
                <v-col cols="4" class="d-flex justify-center pa-0">
                  <span class="text-center">{{averageFee}} BTC</span>
                </v-col>
                <v-col cols="4" class="d-flex justify-end pa-0">
                  <span class="text-right">{{fastFee}} BTC</span>
                </v-col>
              </v-row>
              <v-row class="mx-0">
                <v-col cols="4" class="d-flex justify-start pa-0">
                  <span class="boldie text-left">$ {{btcToUSD(+slowFee)}}</span>
                </v-col>
                <v-col cols="4" class="d-flex justify-center pa-0">
                  <span class="boldie text-center">$ {{btcToUSD(+averageFee)}}</span>
                </v-col>
                <v-col cols="4" class="d-flex justify-end pa-0">
                  <span class="boldie text-right">$ {{btcToUSD(+fastFee)}}</span>
                </v-col>
              </v-row>
            </v-col>
          </v-row>
        </div>
      </v-col>
      <v-col cols="4" class="px-3 px-lg-0">
        <v-row class="mx-0 mt-8">
          <h2>Transaction Summary:</h2>
        </v-row>
        <v-row class="mx-0 summary-box">
          <div class="container">
            <div class="container">
              <v-row class="mx-0">
                <h1>Device account:</h1>
                <v-icon v-if="firstDone" class="ml-2" small color="#008CFF">
                  mdi-check-circle-outline
                </v-icon>
              </v-row>
              <v-row class="mx-0">
                <p v-bind:class="{'grayish': computedBTCAddress === 'Not completed'}">
                  {{ computedBTCAddress }}
                </p>
              </v-row>
            </div>
            <v-divider color="#C4C4C4"/>
            <div class="container">
              <v-row class="mx-0">
                <h1>Bitcoins:</h1>
                <v-icon v-if="secondDone" class="ml-2" small color="#008CFF">
                  mdi-check-circle-outline
                </v-icon>
              </v-row>
              <v-row class="mx-0">
                <p v-bind:class="{'grayish': computedBTCAmount === 'Not completed'}">
                  {{ computedBTCAmount }}
                </p>
              </v-row>
              <v-row class="mx-0">
                <span>USD $ {{ computedBitcoinUSD }}</span>
              </v-row>
            </div>
            <v-divider color="#C4C4C4"/>
            <div class="container">
              <v-row class="mx-0">
                <h1>Destination RSK Address:</h1>
                <v-icon v-if="thirdDone" class="ml-2" small color="#008CFF">
                  mdi-check-circle-outline
                </v-icon>
              </v-row>
              <v-row class="mx-0 d-none d-lg-block">
                <p v-bind:class="{'grayish': computedRskAddress === 'Not completed'}">
                  {{ computedRskAddress }}
                </p>
              </v-row>
              <v-row class="mx-0 d-lg-none">
                <p v-bind:class="{'grayish': computedRskAddress === 'Not completed'}">
                  {{croppedComputedRskAddress}}
                </p>
              </v-row>
            </div>
            <v-divider color="#C4C4C4"/>
            <div class="container">
              <v-row class="mx-0">
                <h1>Refund BTC Address:</h1>
                <v-icon v-if="fourthDone" class="ml-2" small color="#008CFF">
                  mdi-check-circle-outline
                </v-icon>
              </v-row>
              <v-row class="mx-0 d-none d-lg-block">
                <p v-bind:class="{'grayish': computedRefundBTCAddress === 'Not completed'}">
                  {{ computedRefundBTCAddress }}
                </p>
              </v-row>
              <v-row class="mx-0 d-lg-none">
                <p v-bind:class="{'grayish': computedRefundBTCAddress === 'Not completed'}">
                  {{ croppedComputedRefundBTCAddress }}
                </p>
              </v-row>
            </div>
            <v-divider color="#C4C4C4"/>
            <div class="container">
              <v-row class="mx-0">
                <h1>Transaction Fee:</h1>
                <v-icon v-if="fourthDone" class="ml-2" small color="#008CFF">
                  mdi-check-circle-outline
                </v-icon>
              </v-row>
              <v-row class="mx-0">
                <p v-bind:class="{'grayish': computedTxFee === 'Not completed'}">
                  {{ computedTxFee }}
                </p>
              </v-row>
              <v-row class="mx-0">
                <span>{{computedTxFeeUSD}}</span>
              </v-row>
            </div>
            <v-divider color="#C4C4C4"/>
            <div class="container">
              <v-row class="mx-0">
                <h1>Transaction Total:</h1>
                <v-icon v-if="fourthDone" class="ml-2" small color="#008CFF">
                  mdi-check-circle-outline
                </v-icon>
              </v-row>
              <v-row class="mx-0">
                <p v-bind:class="{'grayish': computedBTCAmount === 'Not completed'}">
                  {{ computedFullTxFee }}
                </p>
              </v-row>
              <v-row class="mx-0">
                <span>{{ computedFullTxFeeUSD }}</span>
              </v-row>
            </div>
          </div>
        </v-row>
        <v-row class="mx-0 mt-5 d-flex justify-end">
          <v-btn large rounded color="#00B43C" @click="createTx" :disabled="!formFilled">
            <span class="whiteish">Send</span>
            <v-icon class="ml-2" color="#fff">mdi-send-outline</v-icon>
          </v-btn>
        </v-row>
      </v-col>
    </v-row>
    <template>
      <v-dialog v-model="web3Wallet" width="470">
        <v-card class="dialog container">
          <v-row class="mx-0 d-flex justify-center">
            <v-col class="my-8 d-flex justify-center">
              <h2 class="text-center">HAVE YOU CONFIGURED THE RSK NETWORK BEFORE?</h2>
            </v-col>
          </v-row>
          <v-row class="mx-0">
            <v-col class="d-flex justify-center">
              <v-btn rounded outlined color="#00B520" @click="connectWallet(true)">
                No, configure wallet
              </v-btn>
            </v-col>
            <v-col class="d-flex justify-center">
              <v-btn rounded outlined color="#00B520" @click="connectWallet(false)">
                Yes, connect wallet
              </v-btn>
            </v-col>
          </v-row>
        </v-card>
      </v-dialog>
      <template v-if="selectWallet">
        <wallet :configure="configureWeb3Wallet"/>
      </template>
    </template>
  </div>
</template>

<script lang="ts">
import {
  Vue,
  Component, Prop, Emit,
} from 'vue-property-decorator';
import * as constants from '@/store/constants';
import { AccountBalance, FeeAmountData } from '@/services/types';
import Wallet from '@/components/web3/Wallet.vue';
import { Action, Getter, State } from 'vuex-class';
import { Web3SessionState } from '@/store/session/types';
import { PegInTxState } from '@/store/peginTx/types';

@Component({
  components: {
    Wallet,
  },
})
export default class SendBitcoinForm extends Vue {
  bitcoinAmount = 0.0;

  txFeeIndex = 1.0;

  btcAccountTypeSelected = '';

  first = true;

  second = false;

  third = false;

  fourth = false;

  firstDone = false;

  secondDone = false;

  thirdDone = false;

  fourthDone = true;

  refundAddressFromWallet = false;

  web3Wallet = false;

  selectWallet = false;

  configureWeb3Wallet = false;

  useWeb3Wallet = false;

  rskAddressSelected = '';

  amountStyle = '';

  transactionFees = ['Slow', 'Average', 'Fast']

  accountBalances: string[] = [];

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

  get rbtcAmount() {
    return this.bitcoinAmount;
  }

  get computedBTCAmount() {
    return this.bitcoinAmount > 0 ? Number(this.bitcoinAmount) : 'Not completed';
  }

  get computedBTCAddress() {
    return this.btcAccountTypeSelected !== '' ? this.btcAccountTypeSelected : 'Not completed';
  }

  get computedRefundBTCAddress() {
    return this.refundAddress !== '' ? this.refundAddress : 'Not completed';
  }

  get croppedComputedRefundBTCAddress() {
    return this.getChunkedValue(this.computedRefundBTCAddress);
  }

  get computedRskAddress() {
    if (this.useWeb3Wallet) return this.web3Address;
    if (this.rskAddressSelected) return this.rskAddressSelected;
    return 'Not completed';
  }

  get croppedComputedRskAddress() {
    return this.getChunkedValue(this.computedRskAddress);
  }

  get computedTxFee() {
    return !this.fourthDone ? 'Not completed' : `${this.txFee.toFixed(5)} BTC`;
  }

  get computedFullTxFee() {
    const feePlusAmount = Number(this.txFee) + Number(this.bitcoinAmount);
    return this.fourthDone && this.secondDone ? `${feePlusAmount.toFixed(6)} BTC` : 'Not completed';
  }

  get computedBitcoinUSD() {
    return +this.bitcoinAmount ? this.btcToUSD(this.bitcoinAmount) : 0;
  }

  get computedTxFeeUSD() {
    return !this.fourthDone ? 'USD $ 0' : `USD $ ${this.btcToUSD(+this.txFee)}`;
  }

  get computedFullTxFeeUSD() {
    const feePlusAmount = Number(this.txFee) + Number(this.bitcoinAmount);
    return this.fourthDone && this.secondDone ? `USD $ ${this.btcToUSD(feePlusAmount)}` : 'USD $ 0';
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
    if (this.txFeeIndex === 0) txFee = `Slow - ${this.fees.slow} BTC`;
    if (this.txFeeIndex === 1) txFee = `Average - ${this.fees.average} BTC`;
    if (this.txFeeIndex === 2) txFee = `Fast - ${this.fees.fast} BTC`;
    return txFee;
  }

  get txFee(): number {
    let txFee = 0;
    if (this.txFeeIndex === 0) txFee = this.satoshiToBtc(this.fees.slow);
    if (this.txFeeIndex === 1) txFee = this.satoshiToBtc(this.fees.average);
    if (this.txFeeIndex === 2) txFee = this.satoshiToBtc(this.fees.fast);
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
    return constants.BITCOIN_NATIVE_SEGWIT_ADDRESS;
  }

  get web3Address() {
    return this.web3SessionState.account ?? '';
  }

  get slowFee() {
    return this.satoshiToBtc(this.fees.slow).toFixed(8);
  }

  get averageFee() {
    return this.satoshiToBtc(this.fees.average).toFixed(8);
  }

  get fastFee() {
    return this.satoshiToBtc(this.fees.fast).toFixed(8);
  }

  get insufficientAmount() {
    if ((this.bitcoinAmount < 0.01 && this.bitcoinAmount !== 0)
      || this.bitcoinAmount > this.selectedAccountBalance) return true;
    if (this.bitcoinAmount !== 0 && this.bitcoinAmount < this.selectedAccountBalance) this.amountStyle = 'green-box';
    return false;
  }

  get selectedAccountBalance() {
    let balance = 0;
    switch (this.accountType) {
      case 'BITCOIN_LEGACY_ADDRESS':
        balance = this.satoshiToBtc(this.balances.legacy);
        break;
      case 'BITCOIN_NATIVE_SEGWIT_ADDRESS':
        balance = this.satoshiToBtc(this.balances.nativeSegwit);
        break;
      case 'BITCOIN_SEGWIT_ADDRESS':
        balance = this.satoshiToBtc(this.balances.segwit);
        break;
      case 'BITCOIN_MULTISIGNATURE_ADDRESS':
        balance = 0;
        break;
      default:
        balance = 0;
    }
    return balance;
  }

  // eslint-disable-next-line class-methods-use-this
  getChunkedValue(value: string) {
    return `${value.substr(0, 6)}...${value.substr(value.length - 6, value.length)}`;
  }

  @Emit()
  disconnectWallet() {
    this.clearAccount();
    this.useWeb3Wallet = false;
  }

  @Emit('unused')
  getAddressesFromWallet() {
    this.refundAddressFromWallet = !this.refundAddressFromWallet;
    let accType = this.accountType;
    if (this.accountType === constants.BITCOIN_NATIVE_SEGWIT_ADDRESS) {
      accType = constants.BITCOIN_SEGWIT_ADDRESS;
    }
    return { flag: this.refundAddressFromWallet, accountType: accType };
  }

  @Emit()
  checkStep(value: string, step: number) {
    if (value) {
      switch (step) {
        case 1: {
          this.first = false;
          this.second = true;
          this.third = false;
          this.fourth = false;
          this.firstDone = true;
          break;
        }
        case 2: {
          this.first = false;
          this.second = false;
          this.third = true;
          this.fourth = false;
          this.secondDone = !this.insufficientAmount;
          this.calculateTxFee();
          break;
        }
        case 3: {
          this.first = false;
          this.second = false;
          this.third = false;
          this.fourth = true;
          this.thirdDone = true;
          break;
        }
        case 4: {
          this.first = false;
          this.second = false;
          this.third = false;
          this.fourth = false;
          this.fourthDone = true;
          break;
        }
        case 5: {
          this.first = false;
          this.second = false;
          this.third = false;
          this.fourth = false;
          this.fourthDone = true;
          break;
        }
        default: {
          this.first = false;
          this.second = false;
          this.third = false;
          this.fourth = false;
          break;
        }
      }
    }
  }

  @Emit('createTx')
  createTx() {
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
      amountToTransferInSatoshi: this.btcToSatoshi(this.bitcoinAmount),
      refundAddress: this.refundAddress,
      recipient: this.computedRskAddress,
      feeLevel: selectedFee,
      feeBTC: this.txFee,
    };
  }

  @Emit('txFee')
  calculateTxFee() {
    return { amount: this.btcToSatoshi(this.bitcoinAmount), accountType: this.accountType };
  }

  @Emit()
  toWeb3Wallet() {
    this.useWeb3Wallet = true;
    this.web3Wallet = true;
    this.selectWallet = false;
  }

  @Emit()
  connectWallet(flag: boolean) {
    this.selectWallet = true;
    this.web3Wallet = false;
    this.configureWeb3Wallet = flag;
    this.thirdDone = true;
  }

  @Emit()
  // eslint-disable-next-line class-methods-use-this
  satoshiToBtc(satoshis: number): number {
    return satoshis * 0.00000001;
  }

  @Emit()
  // eslint-disable-next-line class-methods-use-this
  btcToSatoshi(btcs: number): number {
    return btcs * 100000000;
  }

  @Emit()
  // eslint-disable-next-line class-methods-use-this
  btcToUSD(btcs: number) {
    return (btcs * this.price).toFixed(5);
  }

  created() {
    this.accountBalances = [
      `Segwit account - ${this.satoshiToBtc(this.balances.segwit)} BTC`,
      `Legacy account - ${this.satoshiToBtc(this.balances.legacy)} BTC`,
      `Native segwit account - ${this.satoshiToBtc(this.balances.nativeSegwit)} BTC`,
    ];
  }
}
</script>
