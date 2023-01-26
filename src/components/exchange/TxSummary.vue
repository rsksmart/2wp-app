<template>
  <v-container v-if="type && orientation">
    <v-row justify="center" class="mx-0 pb-4">
      <h2 v-if="type === transactionTypes.PEGIN" class="text-center tx-text">
        Transaction summary:
      </h2>
      <h2 v-if="type === transactionTypes.PEGOUT" class="text-center tx-text">
        Operation summary:
      </h2>
    </v-row>

    <v-row v-if="orientation == orientationTypes.HORIZONTAL"
      class="mx-0 d-flex justify-center">
      <v-col sm="10"
              md="9"
            lg="8"
            xl="7">
        <v-row class="d-flex justify-center mb-n3">
          <v-btn class="btn-focus-out" fab x-small outlined color="green" @click="switchExpand"
                v-bind:class="[this.over ? 'expand-btn-active' : 'expand-btn-inactive']"
                @mouseover="over = true" @mouseleave="over = false">
            <span class="content">
              {{ expanded ? '-' : '+'}}
            </span>
          </v-btn>
        </v-row>

        <div class="box-pegin box" v-show="expanded">
          <v-row>
          <!-- >>>>>>>>>>>>>> BITCOIN >>>>>>>>>>>>> -->
            <v-col class="box-col bitcoin-col" cols="6">
              <v-row class="status-title">
                <span>{{ fromTitle }}</span>
              </v-row>

              <!-- sender -->
              <v-row v-if="!!computedRefundAddress" class="box-field mx-1">
                <v-col>
                  <v-row>
                      <span class="status-subtitle">Sender</span>
                      <v-tooltip right>
                          <template v-slot:activator="{ on, attrs }">
                              <v-icon small color="teal darken-2"
                              v-bind="attrs" v-on="on">
                              mdi-information
                              </v-icon>
                          </template>
                          <p class="tooltip-form mb-0">
                              Rejected transactions will be refunded to this
                                {{environmentContext.getBtcText()}} address.
                          </p>
                      </v-tooltip>
                  </v-row>
                  <v-row>
                    <v-col class="form-field-summary">
                      <v-row>
                        <v-col cols="12"
                          class="col-address-button d-flex flex-column justify-end">
                          <span class="breakable-address status-text-ellipsis">
                            {{ computedRefundAddress }}
                          </span>
                        </v-col>
                      </v-row>
                    </v-col>
                  </v-row>
                </v-col>
              </v-row>

              <!-- sent -->
              <v-row class="box-field mx-1">
                <v-col>
                  <v-row>
                    <span class="status-subtitle">Sent</span>
                  </v-row>
                  <v-row>
                    <v-col class="form-field-summary">
                      <v-row class="mx-0 mb-2">
                        <span id="amount">
                          {{ amount }} {{ currencyFromTicker }}
                        </span>
                      </v-row>
                      <v-row class="mx-0">
                        <span class="grayish" id="amount-usd">
                          USD $ {{ amountUSD }}
                        </span>
                      </v-row>
                    </v-col>
                  </v-row>
                </v-col>
              </v-row>

              <!-- PowPeg Address -->
              <v-row v-if="rskFederationAddress" class="box-field mx-1">
                <v-col>
                  <v-row>
                      <span class="status-subtitle">PowPeg Address</span>
                      <v-tooltip right>
                          <template v-slot:activator="{ on, attrs }">
                            <v-icon small color="teal darken-2"
                            v-bind="attrs" v-on="on">
                                mdi-information
                            </v-icon>
                          </template>
                          <p class="tooltip-form mb-0">
                          This is the {{environmentContext.getBtcText()}}
                          address where your {{environmentContext.getBtcTicker()}}s
                          are sent for conversion.
                          </p>
                          <p class="tooltip-form mb-0">
                          Validate this in your device before
                          confirming the transaction.
                          </p>
                      </v-tooltip>
                  </v-row>
                  <v-row>
                    <v-col class="form-field-summary">
                      <span class="status-text-ellipsis">
                        {{ computedFederationAddress }}
                      </span>
                    </v-col>
                  </v-row>
                </v-col>
              </v-row>

              <!-- transaction hash -->
              <v-row v-if="showTxId" class="box-field mx-1">
                <v-col>
                  <v-row>
                    <span class="status-subtitle">Transaction hash</span>
                      <v-tooltip right>
                        <template v-slot:activator="{ on, attrs }">
                            <v-icon small color="teal darken-2"
                            v-bind="attrs" v-on="on">
                            mdi-information
                            </v-icon>
                        </template>
                        <p class="tooltip-form mb-0">
                            Verify the transaction on
                            {{displayExplorerText}} block explorer.
                        </p>
                      </v-tooltip>
                  </v-row>
                  <v-row>
                    <v-col class="form-field-summary">
                      <v-row class="justify-end">
                        <v-col cols="11"
                          class="col-address-button d-flex flex-column">
                          <span class="breakable-address status-text-ellipsis">
                            {{ txId }}
                          </span>
                        </v-col>
                        <v-col cols="1" class="col-address-button">
                          <v-btn @click="openExplorer" icon color="#C4C4C4" x-small>
                              <v-icon>mdi-open-in-new</v-icon>
                          </v-btn>
                        </v-col>
                      </v-row>
                    </v-col>
                  </v-row>
                </v-col>
              </v-row>

              <!-- Fee to pay -->
              <v-row class="box-field mx-1">
                <v-col>
                  <v-row>
                    <span class="status-subtitle">Fee to pay</span>
                  </v-row>
                  <v-row>
                    <v-col class="form-field-summary">
                      <v-row class="mx-0 mb-2">
                        <span>
                          {{ feePlusAmount }} {{ currencyFromTicker }}
                        </span>
                      </v-row>
                    <v-row class="mx-0">
                        <span class="grayish" id="total-usd">
                          USD $ {{ feePlusAmountUSD }}
                        </span>
                      </v-row>
                    </v-col>
                  </v-row>
                </v-col>
              </v-row>

            </v-col>

            <v-divider inset vertical/>

            <!-- >>>>>>>>>>>>>> RSK >>>>>>>>>>>>> -->
            <v-col class="box-col rsk-col" cols="6">
              <v-row class="status-title justify-end">
                <span>{{ toTitle }}</span>
              </v-row>

              <!-- Recipient -->
              <v-row v-if="peginTxState.rskAddressSelected" class="box-field mx-1">
                <v-col>
                  <v-row class="justify-end">
                      <span class="status-subtitle">Recipient</span>
                      <v-tooltip right>
                        <template v-slot:activator="{ on, attrs }">
                            <v-icon small color="teal darken-2"
                            v-bind="attrs" v-on="on">
                            mdi-information
                            </v-icon>
                        </template>
                        <p class="tooltip-form mb-0">
                            This is the {{environmentContext.getRskText()}}
                              address where the
                            {{environmentContext.getRbtcTicker()}} will be delivered.
                        </p>
                      </v-tooltip>
                  </v-row>
                  <v-row>
                    <v-col class="form-field-summary">
                      <v-row class="justify-end">
                        <v-col cols="11"
                          class="col-address-button d-flex flex-column">
                            <span class="breakable-address status-text-ellipsis">
                              {{
                              peginTxState.rskAddressSelected !== '0x'
                              ?
                              peginTxState.rskAddressSelected
                              :
                              VALUE_INCOMPLETE_MESSAGE
                              }}
                            </span>
                          </v-col>
                          <v-col cols="1" class="col-address-button">
                            <v-btn @click="toRskExplorer" icon color="#C4C4C4" x-small>
                                <v-icon>mdi-open-in-new</v-icon>
                            </v-btn>
                          </v-col>
                      </v-row>
                    </v-col>
                  </v-row>
                </v-col>
              </v-row>

              <!-- will receibe -->
              <v-row class="box-field mx-1">
                <v-col>
                  <v-row class="justify-end">
                    <span class="status-subtitle">Will receive</span>
                  </v-row>
                  <v-row>
                    <v-col class="form-field-summary">
                      <v-row class="justify-end mx-0 mb-2">
                        <span>{{ amount }} {{ currencyToTicker }}</span>
                      </v-row>
                      <v-row class="justify-end mx-0">
                        <span class="grayish" id="fee-usd">USD $ {{ feeUSD }}</span>
                      </v-row>
                    </v-col>
                  </v-row>
                </v-col>
              </v-row>

            </v-col>
          </v-row>
        </div>
      </v-col>
    </v-row>

    <v-row v-if="orientation == orientationTypes.VERITICAL"
      class="mx-0 px-5 pb-5 summary-box">
        <!-- title -->
        <v-container class="pb-0 pl-0">
          <v-row class="mx-0">
            <h2 v-if="type === transactionTypes.PEGIN">Bitcoin</h2>
            <h2 v-if="type === transactionTypes.PEGOUT">RSK</h2>
          </v-row>
        </v-container>

        <!-- Address pegout -->
        <v-container v-if="type === transactionTypes.PEGOUT"
          class="pb-0 pl-0">
          <v-row class="mx-0">
            <h1 class="boldie">Sender address:</h1>
          </v-row>
        </v-container>

        <v-container v-if="type === transactionTypes.PEGOUT"
          class="form-field pt-2 pl-0">
          <v-container class="mark">
            <p v-bind:class="{'grayish': pegoutAddress === VALUE_INCOMPLETE_MESSAGE}">
              {{ pegoutAddress }}
            </p>
          </v-container>
        </v-container>
        <!-- ---------------------------- -->

        <!-- Amount -->
        <v-container v-if="type === transactionTypes.PEGOUT" id="summary-2" class="pb-0 pl-0">
          <v-row class="mx-0">
            <h1 class="boldie">Amount:</h1>
          </v-row>
        </v-container>
        <v-container v-if="type === transactionTypes.PEGOUT" class="form-field pt-2 pb-2 pl-0">
          <v-container class="mark">
            <p v-bind:class="{'grayish': computedBTCAmount === '0'}">
              {{ amount }} {{ currencyFromTicker }}
            </p>
          </v-container>
        </v-container>
        <!-- ---------------------------- -->

        <!-- gas -->
        <v-container v-if="type === transactionTypes.PEGOUT" id="summary-5" class="pb-0 pl-0">
          <v-row class="mx-0">
            <h1 class="boldie">Gas:</h1>
          </v-row>
        </v-container>
        <v-container v-if="type === transactionTypes.PEGOUT" class="form-field pt-2 pb-3 pl-0">
          <v-container class="mark">
            <p v-bind:class="{'grayish': fee === VALUE_INCOMPLETE_MESSAGE}">
              {{ fee }} {{ currencyFromTicker }}
            </p>
          </v-container>
        </v-container>
        <!-- ---------------------------- -->

        <!-- Device account -->
        <v-container v-if="type === transactionTypes.PEGIN" id="summary-1" class="pb-0 pl-0">
          <v-row class="mx-0">
            <h1 class="boldie">Device account:</h1>
            <v-icon  v-if="txState.selectedAccount" class="ml-2" small color="#00B520">
              mdi-check-circle-outline
            </v-icon>
          </v-row>
        </v-container>
        <v-container v-if="type === transactionTypes.PEGIN" class="form-field pl-0">
          <p v-bind:class="{'grayish': computedBTCAddress === VALUE_INCOMPLETE_MESSAGE} + ' mark'">
            {{ computedBTCAddress }}
          </p>
        </v-container>
        <!-- TBTC -->
        <v-container v-if="type === transactionTypes.PEGIN" id="summary-2" class="pb-0 pl-0">
          <v-row class="mx-0">
            <h1 class="boldie">{{environmentContext.getBtcTicker()}}s:</h1>
            <v-icon v-if="peginTxState.isValidAmountToTransfer" class="ml-2" small color="#00B520">
              mdi-check-circle-outline
            </v-icon>
          </v-row>
        </v-container>
        <v-container v-if="type === transactionTypes.PEGIN" class="form-field pt-2 pb-2 pl-0">
          <v-container class="mark">
            <p v-bind:class="{'grayish': computedBTCAmount === VALUE_INCOMPLETE_MESSAGE}">
              {{ computedBTCAmount }}
            </p>
            <span>USD $ {{ computedBTCAmountUSD }}</span>
          </v-container>
        </v-container>
        <v-divider/>
        <!-- title -->
        <v-container class="pb-0 pl-0">
          <v-row v-bind:class="{'justify-end': type === transactionTypes.PEGOUT}" class="mx-0">
            <h2 v-if="type === transactionTypes.PEGIN">RSK</h2>
            <h2 v-if="type === transactionTypes.PEGOUT">Bitcoin</h2>
          </v-row>
        </v-container>
        <!-- Destination address -->
        <v-container v-if="type === transactionTypes.PEGIN" id="summary-3" class="pb-0 pl-0">
          <v-row class="mx-0">
            <h1 class="boldie">Destination address:</h1>
            <v-icon v-if="peginTxState.rskAddressSelected !== ''"
              class="ml-2" small color="#00B520">
              mdi-check-circle-outline
            </v-icon>
          </v-row>
        </v-container>
        <v-container v-if="type === transactionTypes.PEGIN" class="form-field pt-2 pl-0">
          <v-row class="mx-0 d-none d-lg-block p-0 m-0">
            <p v-bind:class="{
                'grayish':
                computedRskAddress === VALUE_INCOMPLETE_MESSAGE
              } + ' mark short-address destination-address-p'">
              {{ computedRskAddress }}
            </p>
          </v-row>
          <v-row class="mx-0 d-lg-none">
            <p v-bind:class="{'grayish': computedRskAddress === VALUE_INCOMPLETE_MESSAGE}">
              {{ croppedComputedRskAddress }}
            </p>
          </v-row>
        </v-container>
         <!-- Refaund Address -->
        <v-container
          v-if="!isLiquality && type === transactionTypes.PEGIN" id="summary-4" class="pb-0 pl-0">
          <v-row class="mx-0">
            <h1 class="boldie">Refund {{environmentContext.getBtcText()}} address:</h1>
            <v-icon v-if="peginTxState.selectedAccount" class="ml-2" small color="#00B520">
              mdi-check-circle-outline
            </v-icon>
          </v-row>
        </v-container>
        <v-container
        v-if="!isLiquality && type === transactionTypes.PEGIN" class="form-field pt-2 pl-0">
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
        <!-- Fee BITCOIN-->
        <v-container v-if="type === transactionTypes.PEGIN" class="pb-0 pl-0">
          <v-row class="mx-0">
            <h1 class="boldie">Fees:</h1>
            <v-icon v-if="peginTxState.rskAddressSelected" class="ml-2" small color="#00B520">
              mdi-check-circle-outline
            </v-icon>
          </v-row>
        </v-container>
        <v-container v-if="type === transactionTypes.PEGIN" class="form-field pt-2 pb-3 pl-0">
          <v-container class="mark">
            <p v-bind:class="{'grayish': computedTxFee === VALUE_INCOMPLETE_MESSAGE}">
              {{ computedTxFee }}
            </p>
            <span>USD $ {{ computedTxFeeUSD }}</span>
          </v-container>
        </v-container>
         <v-divider/>
        <!-- Transaction total -->
        <v-container v-if="type === transactionTypes.PEGIN" id="summary-6" class="pb-0 pl-0">
          <v-row class="mx-0">
            <h1 class="boldie">Transaction total:</h1>
            <v-icon v-if="txState.isValidAmountToTransfer" class="ml-2" small color="#00B520">
              mdi-check-circle-outline
            </v-icon>
          </v-row>
        </v-container>
        <v-container v-if="type === transactionTypes.PEGIN" class="form-field pt-2 pb-0 pl-0">
          <v-container class="mark">
            <p v-bind:class="{'grayish': computedBTCAmount === VALUE_INCOMPLETE_MESSAGE}">
              {{ computedFeePlusAmount }}
            </p>
            <span style="text-overflow: ellipsis;"> USD $ {{ computedFeePlusAmountUSD }}</span>
          </v-container>
        </v-container>
        <!-- Recipient address -->
        <v-container v-if="type === transactionTypes.PEGOUT" id="summary-3" class="pb-0 pl-0">
          <v-row class="justify-end mx-0">
            <h1 class="boldie">Recipient address:</h1>
          </v-row>
        </v-container>
        <v-container v-if="type === transactionTypes.PEGOUT" class="form-field pt-2 pl-0">
          <v-row class="mx-0 d-none d-lg-block p-0 m-0">
            <p v-bind:class="{
                'grayish':
                txState.pegoutConfiguration.bridgeContractAddress === VALUE_INCOMPLETE_MESSAGE
              } + ' mark short-address destination-address-p'">
              0xtesttesttesttesttest
            </p>
          </v-row>
        </v-container>
        <!-- Revieve -->
        <v-container v-if="type === transactionTypes.PEGOUT" class="pb-0 pl-0">
          <v-row class="justify-end mx-0">
            <h1 class="boldie">Estimated BTC to recieve</h1>
          </v-row>
        </v-container>
        <v-container v-if="type === transactionTypes.PEGOUT" class="form-field pt-2 pb-0 pl-0">
          <v-container class="mark">
            <p
              v-bind:class="{
                'grayish': pegoutTxState.estimatedBTCToRecieve === VALUE_INCOMPLETE_MESSAGE
                }">
              {{ pegoutTxState.estimatedBTCToRecieve.toBTCTrimmedString() }} {{ currencyToTicker }}
            </p>
          </v-container>
        </v-container>
         <!-- Fee to pay -->
        <v-container v-if="type === transactionTypes.PEGOUT" class="pb-0 pl-0">
          <v-row class="justify-end mx-0">
            <h1 class="boldie">Estimated fee to pay</h1>
          </v-row>
        </v-container>
        <v-container v-if="type === transactionTypes.PEGOUT" class="form-field pt-2 pb-3 pl-0">
          <v-container class="mark">
            <p v-bind:class="{'grayish': computedTxFee === VALUE_INCOMPLETE_MESSAGE}">
              {{ computedTxFee }}
            </p>
          </v-container>
        </v-container>
    </v-row>
  </v-container>
</template>

<script lang="ts">
import {
  Component, Emit, Vue, Prop,
} from 'vue-property-decorator';
import Big from 'big.js';
import { State, Getter } from 'vuex-class';
import * as constants from '@/store/constants';
import SatoshiBig from '@/types/SatoshiBig';
import { EnvironmentAccessorService } from '@/services/enviroment-accessor.service';
import EnvironmentContextProviderService from '@/providers/EnvironmentContextProvider';
import {
  PegInTxState,
  SessionState,
  PegOutTxState,
  WeiBig,
} from '@/types';
import { formatTxId, getBtcExplorerUrl } from '@/services/utils';
import { TxStatusType } from '@/types/store';
import { TxSummaryOrientation } from '@/types/Status';
import { getChunkedValue } from '@/utils/common';

@Component
export default class TxSummary extends Vue {
  @Prop() initialExpand!: boolean;

  @Prop() showTxId!: boolean;

  @Prop() txId!: string;

  @Prop() type!: TxStatusType;

  @Prop() orientation !: TxSummaryOrientation;

  @Prop() statusRefundAddress!: string;

  expanded = true;

  over = false;

  fixedUSDDecimals = 2;

  VALUE_INCOMPLETE_MESSAGE = 'Not Found';

  transactionTypes = TxStatusType;

  orientationTypes = TxSummaryOrientation;

  isLiquality = true;

  maxLengthForChunked = 15;

  environmentContext = EnvironmentContextProviderService.getEnvironmentContext();

  @State('pegInTx') peginTxState!: PegInTxState;

  @State('pegOutTx') pegoutTxState!: PegOutTxState;

  @State('web3Session') web3SessionState!: SessionState;

  @Getter(constants.PEGIN_TX_GET_REFUND_ADDRESS, { namespace: 'pegInTx' }) refundAddress!: string;

  @Getter(constants.PEGIN_TX_GET_STATUS_TX_ID, { namespace: 'pegInTx' }) txIdValue!: string;

  @Getter(constants.PEGIN_TX_GET_SAFE_TX_FEE, { namespace: 'pegInTx' }) feePegIn!: SatoshiBig;

  @Getter(constants.PEGOUT_TX_GET_SAFE_TX_FEE, { namespace: 'pegOutTx' }) feePegOut !: WeiBig;

  @Emit()
  switchExpand() {
    this.expanded = !this.expanded;
  }

  get amount(): string {
    let amount;
    if (this.type === this.transactionTypes.PEGIN) {
      if (!this.peginTxState.amountToTransfer) return this.VALUE_INCOMPLETE_MESSAGE;
      amount = this.peginTxState.amountToTransfer.toBTCString();
    } else {
      if (!this.pegoutTxState.amountToTransfer) return this.VALUE_INCOMPLETE_MESSAGE;
      amount = this.pegoutTxState.amountToTransfer.toRBTCTrimmedString();
    }
    return amount;
  }

  openExplorer() {
    if (this.type === this.transactionTypes.PEGIN) {
      this.openBtcExplorer();
    } else {
      this.openRskExplorer();
    }
  }

  get displayExplorerText(): string {
    if (this.type === this.transactionTypes.PEGIN) {
      return this.environmentContext.getBtcText();
    }
    return this.environmentContext.getRskText();
  }

  openBtcExplorer() {
    const txWithout0x = this.txId.substring(2, (this.txId.length));
    console.log(txWithout0x);
    window.open(getBtcExplorerUrl(txWithout0x), '_blank');
  }

  openRskExplorer() {
    const url = this.getRskExplorerUrl();
    const urlWithTx = `${url}/tx/${this.txId}`;
    console.log(urlWithTx);
    window.open(urlWithTx, '_blank');
  }

  get amountUSD(): string {
    const { amountToTransfer, bitcoinPrice } = this.peginTxState;
    if (!amountToTransfer || !bitcoinPrice) return this.VALUE_INCOMPLETE_MESSAGE;
    return amountToTransfer.toUSDFromBTCString(bitcoinPrice, this.fixedUSDDecimals);
  }

  get fee(): string {
    let fee;
    if (this.type === this.transactionTypes.PEGIN) {
      fee = this.feePegIn.toBTCString();
    } else {
      fee = this.feePegOut.toRBTCTrimmedString();
    }
    return fee;
  }

  get feeUSD(): string {
    if (!this.feePegIn || !this.peginTxState.bitcoinPrice) return this.VALUE_INCOMPLETE_MESSAGE;
    return this.feePegIn.toUSDFromBTCString(this.peginTxState.bitcoinPrice, this.fixedUSDDecimals);
  }

  get feePlusAmount(): string {
    if (!this.peginTxState.amountToTransfer || !this.feePegIn) return this.VALUE_INCOMPLETE_MESSAGE;
    return this.peginTxState.amountToTransfer.plus(this.feePegIn).toBTCString();
  }

  get feePlusAmountUSD(): string {
    if (!this.amount || !this.feePegIn || !this.peginTxState.bitcoinPrice) {
      return this.VALUE_INCOMPLETE_MESSAGE;
    }
    return Big(this.amountUSD).plus(Big(this.feeUSD)).toFixed(this.fixedUSDDecimals);
  }

  get computedRefundBTCAddress() {
    return this.refundAddress !== '' ? formatTxId(this.refundAddress) : this.VALUE_INCOMPLETE_MESSAGE;
  }

  get croppedComputedRefundBTCAddress() {
    return formatTxId(getChunkedValue(this.computedRefundBTCAddress, this.maxLengthForChunked));
  }

  get computedTxFee(): string {
    let txFee;
    if (this.type === this.transactionTypes.PEGIN) {
      txFee = `${this.feePegIn.toBTCTrimmedString()} ${this.environmentContext.getBtcTicker()}`;
    } else {
      txFee = `${this.feePegOut.toRBTCTrimmedString()} ${this.currencyToTicker}`;
    }
    return txFee;
  }

  get computedTxFeeUSD(): string {
    return this.feePegIn.toUSDFromBTCString(this.peginTxState.bitcoinPrice, this.fixedUSDDecimals);
  }

  get chunkedRecipientAddress(): string {
    const recipient = this.peginTxState.rskAddressSelected;
    return recipient ? `${recipient.substr(0, 25)}...${recipient.substr(38, 42)}` : this.VALUE_INCOMPLETE_MESSAGE;
  }

  get computedTxId(): string {
    let result;
    if (this.txIdValue) {
      result = formatTxId(this.txIdValue);
    } else if (this.txId) {
      result = formatTxId(this.txId);
    } else {
      result = this.VALUE_INCOMPLETE_MESSAGE;
    }
    return result;
  }

  get computedFederationAddress(): string {
    let result;
    if (this.rskFederationAddress) {
      result = formatTxId(this.rskFederationAddress);
    } else {
      result = this.VALUE_INCOMPLETE_MESSAGE;
    }
    return result;
  }

  get computedRefundAddress(): string {
    let result;
    const refundAddr = this.statusRefundAddress ? this.statusRefundAddress : this.refundAddress;
    if (refundAddr !== '0x') {
      result = refundAddr;
    } else {
      result = this.VALUE_INCOMPLETE_MESSAGE;
    }
    return result;
  }

  get computedBTCAddress() {
    return this.peginTxState.selectedAccount
      ? this.getAccountBalanceText(this.peginTxState.selectedAccount)
      : this.VALUE_INCOMPLETE_MESSAGE;
  }

  get croppedComputedRskAddress() {
    return getChunkedValue(this.computedRskAddress, this.maxLengthForChunked);
  }

  get computedBTCAmount() {
    if (!this.peginTxState.isValidAmountToTransfer) {
      return this.VALUE_INCOMPLETE_MESSAGE;
    }
    return `${this.peginTxState.amountToTransfer.toBTCString()} ${this.environmentContext.getBtcTicker()}`;
  }

  get computedBTCAmountUSD(): string {
    return this.peginTxState.isValidAmountToTransfer
      ? this.peginTxState.amountToTransfer
        .toUSDFromBTCString(this.peginTxState.bitcoinPrice, this.fixedUSDDecimals) : '0.00';
  }

  get computedFeePlusAmount(): string {
    const feePlusAmount: SatoshiBig = this.peginTxState.amountToTransfer.plus(this.feePegIn);
    return this.peginTxState.isValidAmountToTransfer
      ? `${feePlusAmount.toBTCString()} ${this.environmentContext.getBtcTicker()}` : this.VALUE_INCOMPLETE_MESSAGE;
  }

  get computedFeePlusAmountUSD(): string {
    const amountUSD: Big = Big(this.computedBTCAmountUSD);
    const txFeeUSD: Big = Big(this.computedTxFeeUSD);
    const feePlusAmountUSD: Big = amountUSD.plus(txFeeUSD);
    return this.peginTxState.isValidAmountToTransfer
      ? feePlusAmountUSD.toFixed(this.fixedUSDDecimals) : '0.00';
  }

  get rskFederationAddress() {
    return this.peginTxState.peginConfiguration.federationAddress;
  }

  get currencyFromTicker() {
    return this.type === 'PEGIN' ? this.environmentContext.getBtcTicker()
      : this.environmentContext.getRbtcTicker();
  }

  get currencyToTicker() {
    return this.type === 'PEGIN' ? this.environmentContext.getRbtcTicker()
      : this.environmentContext.getBtcTicker();
  }

  get fromTitle() {
    return this.type === 'PEGIN' ? 'Bitcoin' : 'RSK';
  }

  get toTitle() {
    return this.type === 'PEGIN' ? 'RSK' : 'Bitcoin';
  }

  get computedRskAddress() {
    let address;
    if (this.peginTxState.rskAddressSelected === '') {
      address = this.VALUE_INCOMPLETE_MESSAGE;
    } else {
      address = this.peginTxState.rskAddressSelected;
    }

    return address;
  }

  get pegoutAddress() {
    let address;
    if (this.web3SessionState.account) {
      address = formatTxId(this.web3SessionState.account);
    } else {
      address = this.VALUE_INCOMPLETE_MESSAGE;
    }
    return address;
  }

  get txState() {
    let txState;
    if (this.type === this.transactionTypes.PEGIN) {
      txState = this.peginTxState;
    } else {
      txState = this.pegoutTxState;
    }

    return txState;
  }

  get accountSelected() {
    let accountSelected = '';
    if (this.peginTxState?.selectedAccount) {
      accountSelected = this.peginTxState?.selectedAccount;
    }
    return accountSelected;
  }

  @Emit()
  getAccountBalanceText(accountType: string): string {
    let text = '';
    switch (accountType) {
      case constants.BITCOIN_LEGACY_ADDRESS:
        text = `Legacy - ${this.peginTxState.balances.legacy.toBTCStringNotZeroPadded()} ${this.environmentContext.getBtcTicker()}`;
        break;
      case constants.BITCOIN_SEGWIT_ADDRESS:
        text = `Segwit - ${this.peginTxState.balances.segwit.toBTCStringNotZeroPadded()} ${this.environmentContext.getBtcTicker()}`;
        break;
      case constants.BITCOIN_NATIVE_SEGWIT_ADDRESS:
        text = `Native segwit - ${this.peginTxState.balances.nativeSegwit.toBTCStringNotZeroPadded()} ${this.environmentContext.getBtcTicker()}`;
        break;
      default:
        break;
    }
    return text;
  }

  @Emit()
  toRskExplorer() {
    const rskUrl = this.getRskExplorerUrl();
    window.open(`${rskUrl}/address/${this.peginTxState.rskAddressSelected}`, '_blank');
  }

  // eslint-disable-next-line class-methods-use-this
  getRskExplorerUrl(): string {
    const network = EnvironmentAccessorService.getEnvironmentVariables().vueAppCoin === constants.BTC_NETWORK_MAINNET ? '' : '.testnet';
    return `https://explorer${network}.rsk.co`;
  }

  created() {
    this.expanded = this.initialExpand;
    this.isLiquality = this.peginTxState?.bitcoinWallet === constants.WALLET_LIQUALITY;
  }
}
</script>
