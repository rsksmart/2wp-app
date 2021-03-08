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
    <v-row class="mx-0">
      <v-col cols="8">
        <div class="container">
          <v-row class="mx-0 d-flex align-center">
            <span v-bind:class="[first ? 'number-filled' : 'number']">1</span>
            <p v-bind:class="[first ? 'boldie': '']">Select Bitcoin account to send from:</p>
          </v-row>
          <v-row class="mx-0">
            <v-col cols="7">
              <v-select v-model="btcAccountTypeSelected" :items="accountBalances" color="#FFF"
                        label="Select the account" solo dense
                        @change="checkStep(btcAccountTypeSelected, 1)"/>
            </v-col>
            <v-col/>
            <v-col cols="4" class="d-flex justify-center">
              <v-btn outlined rounded color="#00B520" width="235" disabled>
                <span class="grayish">Extensive search</span>
              </v-btn>
            </v-col>
          </v-row>
        </div>
        <v-divider class="ml-6 mx-3" color="#C4C4C4"/>
        <div class="container">
          <v-row class="mx-0 d-flex align-center">
            <span v-bind:class="[second ? 'number-filled' : 'number']">2</span>
            <p v-bind:class="[second ? 'boldie' : '']">Type the amount you want to convert:</p>
          </v-row>
          <v-row class="mx-0 pb-0 d-flex align-center container">
            <v-col cols="4" class="input-box-outline">
              <v-col cols="8" class="pa-0 pl-1">
                <v-text-field solo hide-details full-width single-line flat
                              v-model="bitcoinAmount" type="number"
                              @change="checkStep(bitcoinWallet, 2)"/>
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
              <v-icon color="#000000">mdi-arrow-right</v-icon>
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
          <v-row class="mx-0 ml-3">
            <span>
              You can not send this amount of BTC. You can only send a minimum of 0.01 BTC
            </span>
          </v-row>
        </div>
        <v-divider class="ml-6 mx-3" color="#C4C4C4"/>
        <div class="container">
          <v-row class="mx-0 d-flex align-center">
            <span v-bind:class="[third ? 'number-filled' : 'number']">3</span>
            <p v-bind:class="[third ? 'boldie' : '']">
              Select the RSK address you want to receive your RBTC:
            </p>
            <v-icon color="#C4C4C4">mdi-info-outlined</v-icon>
          </v-row>
          <v-row class="mx-0">
            <v-col cols="7">
              <v-text-field v-model="rskAddressSelected" solo dense
                            label="Select or paste the RSK address"
                            @change="checkStep(rskAddressSelected, 3)"/>
            </v-col>
            <v-col>
              <v-divider vertical color="#C4C4C4"/>
            </v-col>
            <v-col cols="4" class="d-flex justify-center">
              <div>
                <v-row class="mx-0 d-flex justify-center">
                  <span class="text-center">Use your Software Wallet addresses </span>
                </v-row>
                <v-row class="mx-0 d-flex justify-center">
                  <v-btn outlined rounded color="#00B520" width="235">
                    <span class="greenish">Connect Wallet</span>
                  </v-btn>
                </v-row>
              </div>
            </v-col>
          </v-row>
        </div>
        <v-divider class="mx-3" color="#C4C4C4"/>
        <div class="container">
          <v-row class="mx-0 d-flex align-center">
            <span v-bind:class="[fourth ? 'number-filled' : 'number']">4</span>
            <p v-bind:class="[fourth ? 'boldie' : '']">Select your BTC refund address:</p>
          </v-row>
          <v-row class="mx-0">
            <v-col cols="7">
              <v-text-field v-if="!refundAddressFromWallet" v-model="btcRefundAddressSelected"
                            solo dense label="Paste the BTC refund address"
                            @change="checkStep(btcRefundAddressSelected, 4)"/>
              <v-select v-else v-model="btcRefundAddressSelected" :items="unusedAddresses"
                        color="#FFF" label="Select the BTC refund address" solo dense
                        @change="checkStep(btcRefundAddressSelected, 4)"/>
            </v-col>
            <v-col/>
            <v-col cols="4" class="d-flex justify-center">
              <v-btn outlined rounded color="#00B520" @click="getAddressesFromWallet" width="235">
                <span class="greenish">From wallet</span>
              </v-btn>
            </v-col>
          </v-row>
        </div>
        <v-divider class="mx-3" color="#C4C4C4"/>
        <div class="container">
          <v-row class="mx-0 d-flex align-center">
            <span v-bind:class="[fifth ? 'number-filled' : 'number']">5</span>
            <p v-bind:class="[fifth ? 'boldie' : '']">Select the Transaction Fee:</p>
          </v-row>
          <v-row class="mx-0 d-flex justify-center">
            <v-col cols="11">
              <v-row class="mx-0">
                <v-slider v-model="txFeeIndex" :tick-labels="transactionFees" :max="2"
                          :color="txFeeColor" :track-color="txFeeColor" step="1"
                          @change="checkStep('fee', 5)"/>
              </v-row>
              <v-row class="mx-0">
                <v-col cols="4" class="d-flex justify-start pa-0">
                  <span class="text-left">0.00292 BTC</span>
                </v-col>
                <v-col cols="4" class="d-flex justify-center pa-0">
                  <span class="text-center">0.00317 BTC</span>
                </v-col>
                <v-col cols="4" class="d-flex justify-end pa-0">
                  <span class="text-right">0.00365 BTC</span>
                </v-col>
              </v-row>
              <v-row class="mx-0">
                <v-col cols="4" class="d-flex justify-start pa-0">
                  <span class="boldie text-left">$ 1.07</span>
                </v-col>
                <v-col cols="4" class="d-flex justify-center pa-0">
                  <span class="boldie text-center">$ 1.16</span>
                </v-col>
                <v-col cols="4" class="d-flex justify-end pa-0">
                  <span class="boldie text-right">$ 1.33</span>
                </v-col>
              </v-row>
            </v-col>
          </v-row>
        </div>
      </v-col>
      <v-col cols="4">
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
                <p v-bind:class="[computedBTCAddress === 'Not completed' ? 'grayish' : '']">
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
                <p v-bind:class="[computedBTCAmount === 'Not completed' ? 'grayish' : '']">
                  {{ computedBTCAmount }}
                </p>
              </v-row>
              <v-row class="mx-0">
                <span>USD $ {{ bitcoinAmount * bitcoinPrice }}</span>
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
              <v-row class="mx-0">
                <p v-bind:class="[computedRskAddress === 'Not completed' ? 'grayish' : '']">
                  {{ computedRskAddress }}
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
              <v-row class="mx-0">
                <p v-bind:class="[computedRefundBTCAddress === 'Not completed' ? 'grayish' : '']">
                  {{ computedRefundBTCAddress }}
                </p>
              </v-row>
            </div>
            <v-divider color="#C4C4C4"/>
            <div class="container">
              <v-row class="mx-0">
                <h1>Transaction Fee:</h1>
                <v-icon v-if="fifthDone" class="ml-2" small color="#008CFF">
                  mdi-check-circle-outline
                </v-icon>
              </v-row>
              <v-row class="mx-0">
                <p v-bind:class="[computedTxFee === 'Not completed' ? 'grayish' : '']">
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
                <v-icon v-if="fifthDone" class="ml-2" small color="#008CFF">
                  mdi-check-circle-outline
                </v-icon>
              </v-row>
              <v-row class="mx-0">
                <p v-bind:class="[computedFullTxFee === 'Not completed' ? 'grayish' : '']">
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
          <v-btn large rounded color="#00B43C" @click="toConfirmTx" :disabled="!formFilled">
            <span class="whiteish">Send</span>
            <v-icon class="ml-2" color="#FFFFFF">mdi-send-outline</v-icon>
          </v-btn>
        </v-row>
      </v-col>
    </v-row>
  </div>
</template>

<script lang="ts">
import {
  Vue,
  Component,
  Prop,
  Emit,
} from 'vue-property-decorator';
import * as constants from '@/store/constants';
import { AccountBalance, FeeAmountData } from '@/services/types';

@Component
export default class SendBitcoinForm extends Vue {
  bitcoinPrice = 52179.73; // https://www.coindesk.com/price/bitcoin

  bitcoinAmount = 0.0;

  txFeeIndex = 0.0;

  btcRefundAddressSelected = '';

  btcAccountTypeSelected = '';

  first = true;

  second = false;

  third = false;

  fourth = false;

  fifth = false;

  firstDone = false;

  secondDone = false;

  thirdDone = false;

  fourthDone = false;

  fifthDone = false;

  refundAddressFromWallet = false;

  rskAddressSelected = '';

  transactionFees = ['Slow', 'Average', 'Fast']

  btcRefundAddresses: string[] = [];

  accountBalances: string[] = [];

  @Prop(String) bitcoinWallet!: string;

  @Prop() balances!: AccountBalance;

  @Prop() addresses!: [];

  @Prop() unusedAddresses?: [];

  @Prop() fees!: FeeAmountData;

  get rbtcAmount() {
    return this.bitcoinAmount;
  }

  get computedBTCAmount() {
    return this.bitcoinAmount > 0 ? this.bitcoinAmount : 'Not completed';
  }

  get computedBTCAddress() {
    return this.btcAccountTypeSelected !== '' ? this.btcAccountTypeSelected : 'Not completed';
  }

  get computedRefundBTCAddress() {
    return this.btcRefundAddressSelected !== '' ? this.btcRefundAddressSelected : 'Not completed';
  }

  get computedRskAddress() {
    return this.rskAddressSelected !== '' ? this.rskAddressSelected : 'Not completed';
  }

  get computedTxFee() {
    return !this.fifthDone ? 'Not completed' : `${this.txFee} BTC`;
  }

  get computedFullTxFee() {
    return !this.fifthDone && !this.secondDone ? 'Not completed' : `${Number(this
      .txFee) + Number(this.computedBTCAmount)} BTC`;
  }

  get computedTxFeeUSD() {
    return !this.fifthDone ? 'USD $ 0' : `USD $ ${Number(this.txFee) * this.bitcoinPrice}`;
  }

  get computedFullTxFeeUSD() {
    return !this.fifthDone && !this.secondDone ? 'USD $ 0' : `USD $ ${(Number(this
      .txFee) + Number(this.computedBTCAmount)) * Number(this.bitcoinPrice)}`;
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
    if (this.txFeeIndex === 0) txFee = 'Slow - 0.00292 BTC';
    if (this.txFeeIndex === 1) txFee = 'Average - 0.00317 BTC';
    if (this.txFeeIndex === 2) txFee = 'Fast - 0.00365 BTC';
    return txFee;
  }

  get txFee(): number {
    let txFee = 0;
    if (this.txFeeIndex === 0) txFee = 0.00292;
    if (this.txFeeIndex === 1) txFee = 0.00317;
    if (this.txFeeIndex === 2) txFee = 0.00365;
    return txFee;
  }

  get walletName() {
    switch (this.bitcoinWallet) {
      case constants.WALLET_LEDGER: {
        return 'Ledger wallet';
      }
      case constants.WALLET_TREZOR: {
        return 'Trezor wallet';
      }
      case constants.WALLET_ELECTRUM: {
        return 'Electrum wallet';
      }
      case constants.WALLET_RWALLET: {
        return 'RWallet';
      }
      case constants.WALLET_DEFIANT: {
        return 'Defiant wallet';
      }
      default: {
        return 'wallet';
      }
    }
  }

  get formFilled() {
    return this.firstDone && this.secondDone && this.thirdDone
      && this.fourthDone && this.fifthDone;
  }

  get accountType() {
    if (this.btcAccountTypeSelected[0] === 'L') return constants.BITCOIN_LEGACY_ADDRESS;
    if (this.btcAccountTypeSelected[0] === 'S') return constants.BITCOIN_SEGWIT_ADDRESS;
    if (this.btcAccountTypeSelected[0] === 'M') return constants.BITCOIN_MULTISIGNATURE_ADDRESS;
    return constants.BITCOIN_NATIVE_SEGWIT_ADDRESS;
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
          this.fifth = false;
          this.firstDone = true;
          break;
        }
        case 2: {
          this.first = false;
          this.second = false;
          this.third = true;
          this.fourth = false;
          this.fifth = false;
          this.secondDone = true;
          this.calculateTxFee();
          break;
        }
        case 3: {
          this.first = false;
          this.second = false;
          this.third = false;
          this.fourth = true;
          this.fifth = false;
          this.thirdDone = true;
          break;
        }
        case 4: {
          this.first = false;
          this.second = false;
          this.third = false;
          this.fourth = false;
          this.fifth = true;
          this.fourthDone = true;
          break;
        }
        case 5: {
          this.first = false;
          this.second = false;
          this.third = false;
          this.fourth = false;
          this.fifth = false;
          this.fifthDone = true;
          this.selectedFee();
          break;
        }
        default: {
          this.first = false;
          this.second = false;
          this.third = false;
          this.fourth = false;
          this.fifth = false;
          break;
        }
      }
    }
  }

  @Emit('selectedFee')
  selectedFee(): string {
    switch (this.txFeeIndex) {
      case 0:
        return constants.BITCOIN_SLOW_FEE_LEVEL;
      case 1:
        return constants.BITCOIN_AVERAGE_FEE_LEVEL;
      case 2:
        return constants.BITCOIN_FAST_FEE_LEVEL;
      default:
        return constants.BITCOIN_AVERAGE_FEE_LEVEL;
    }
  }

  @Emit('sendBTC')
  sendBitcoin(): object {
    return {
      bitcoinAmount: this.bitcoinAmount,
      btcRefundAddressSelected: this.btcRefundAddressSelected,
      rskAddressSelected: this.rskAddressSelected,
      fullTxFee: this.txFee,
      txFee: this.fullTxFee,
    };
  }

  @Emit('confirmTx')
  toConfirmTx() {
    return this.bitcoinWallet;
  }

  @Emit('txFee')
  calculateTxFee() {
    const btcAmountInSatoshis = Number(this.bitcoinAmount) * 100000000;
    return { amount: btcAmountInSatoshis, accountType: this.accountType };
  }

  @Emit()
  // eslint-disable-next-line class-methods-use-this
  satoshiToBtc(satoshis: number): number {
    return satoshis * 0.00000001;
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
