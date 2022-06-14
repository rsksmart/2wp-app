<template>
  <v-col cols="12" offset-xl="1" xl="11" class="pa-0">
    <v-row class="mx-0 my-4">
      <h2>Transaction summary:</h2>
    </v-row>
    <v-row class="mx-0 summary-box">
      <v-container id="summary-box-container">
        <v-container id="summary-1" class="pb-0 pl-0">
          <v-row class="mx-0">
            <h1>Device account:</h1>
            <v-icon v-if="pegInTxState.selectedAccount" class="ml-2" small color="#008CFF">
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
            <h1>{{environmentContext.getBtcTicker()}}s:</h1>
            <v-icon v-if="this.pegInTxState.isValidAmountToTransfer"
                    class="ml-2" small color="#008CFF">
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
            <v-icon v-if="pegInTxState.rskAddressSelected !== ''"
                    class="ml-2" small color="#008CFF">
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
            <h1>Refund {{environmentContext.getBtcText()}} address:</h1>
            <v-icon v-if="pegInTxState.selectedAccount" class="ml-2" small color="#008CFF">
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
            <v-icon v-if="pegInTxState.rskAddressSelected !== ''"
                    class="ml-2" small color="#008CFF">
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
            <v-icon v-if="pegInTxState.isValidAmountToTransfer" class="ml-2" small color="#008CFF">
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
</template>

<script lang="ts">
import {
  Component, Emit, Vue,
} from 'vue-property-decorator';
import { Getter, State } from 'vuex-class';
import Big from 'big.js';
import { PegInTxState } from '@/types/pegInTx';
import { getChunkedValue } from '@/utils/common';
import SatoshiBig from '@/types/SatoshiBig';
import * as constants from '@/store/constants';
import EnvironmentContextProviderService from '@/providers/EnvironmentContextProvider';

@Component({
  components: {
  },
})
export default class BtcTxSummarySide extends Vue {
  environmentContext = EnvironmentContextProviderService.getEnvironmentContext();

  VALUE_INCOMPLETE_MESSAGE = 'Not completed';

  fixedUSDDecimals = 2;

  maxLengthForChunked = 15;

  @State('pegInTx') pegInTxState!: PegInTxState;

  @Getter(constants.PEGIN_TX_GET_REFUND_ADDRESS, { namespace: 'pegInTx' }) refundAddress!: string;

  @Getter(constants.PEGIN_TX_GET_SAFE_TX_FEE, { namespace: 'pegInTx' }) safeFee!: SatoshiBig;

  get computedBTCAddress() {
    return this.pegInTxState.selectedAccount
      ? this.getAccountBalanceText(this.pegInTxState.selectedAccount)
      : this.VALUE_INCOMPLETE_MESSAGE;
  }

  get computedBTCAmount(): string {
    if (!this.pegInTxState.isValidAmountToTransfer) {
      return this.VALUE_INCOMPLETE_MESSAGE;
    }
    return `${this.pegInTxState.amountToTransfer.toBTCString()} ${this.environmentContext.getBtcTicker()}`;
  }

  get computedBTCAmountUSD(): string {
    return this.pegInTxState.isValidAmountToTransfer
      ? this.pegInTxState.amountToTransfer
        .toUSDFromBTCString(this.pegInTxState.bitcoinPrice, this.fixedUSDDecimals) : '0.00';
  }

  get computedRskAddress() {
    if (this.pegInTxState.rskAddressSelected === '') {
      return this.VALUE_INCOMPLETE_MESSAGE;
    }
    return this.pegInTxState.rskAddressSelected;
  }

  get croppedComputedRskAddress() {
    return getChunkedValue(this.computedRskAddress, this.maxLengthForChunked);
  }

  get computedRefundBTCAddress() {
    return this.refundAddress !== '' ? this.refundAddress : this.VALUE_INCOMPLETE_MESSAGE;
  }

  get croppedComputedRefundBTCAddress() {
    return getChunkedValue(this.computedRefundBTCAddress, this.maxLengthForChunked);
  }

  get computedTxFee(): string {
    return `${this.safeFee.toBTCString()} ${this.environmentContext.getBtcTicker()}`;
  }

  get computedTxFeeUSD(): string {
    return this.safeFee.toUSDFromBTCString(this.pegInTxState.bitcoinPrice, this.fixedUSDDecimals);
  }

  get computedFeePlusAmount(): string {
    const feePlusAmount: SatoshiBig = this.pegInTxState.amountToTransfer.plus(this.safeFee);
    return this.pegInTxState.isValidAmountToTransfer
      ? `${feePlusAmount.toBTCString()} ${this.environmentContext.getBtcTicker()}` : this.VALUE_INCOMPLETE_MESSAGE;
  }

  get computedFeePlusAmountUSD(): string {
    const amountUSD: Big = Big(this.computedBTCAmountUSD);
    const txFeeUSD: Big = Big(this.computedTxFeeUSD);
    const feePlusAmountUSD: Big = amountUSD.plus(txFeeUSD);
    return this.pegInTxState.isValidAmountToTransfer
      ? feePlusAmountUSD.toFixed(this.fixedUSDDecimals) : '0.00';
  }

  @Emit()
  getAccountBalanceText(accountType: string): string {
    let text = '';
    switch (accountType) {
      case constants.BITCOIN_LEGACY_ADDRESS:
        text = `Legacy - ${this.pegInTxState.balances.legacy.toBTCStringNotZeroPadded()} ${this.environmentContext.getBtcTicker()}`;
        break;
      case constants.BITCOIN_SEGWIT_ADDRESS:
        text = `Segwit - ${this.pegInTxState.balances.segwit.toBTCStringNotZeroPadded()} ${this.environmentContext.getBtcTicker()}`;
        break;
      case constants.BITCOIN_NATIVE_SEGWIT_ADDRESS:
        text = `Native segwit - ${this.pegInTxState.balances.nativeSegwit.toBTCStringNotZeroPadded()} ${this.environmentContext.getBtcTicker()}`;
        break;
      default:
        break;
    }
    return text;
  }
}
</script>
