<template>
  <v-container class="form-step">
    <v-row align="start" class="mx-0">
      <v-col cols="auto" class="pl-0">
        <div v-bind:class="[focus ?
              'number-filled' : 'number']">4</div>
      </v-col>
      <v-col class="pl-0">
        <p v-bind:class="{'boldie' : focus}">
          Select transaction fee:
        </p>
        <v-row class="mx-0 mt-4 d-flex justify-start">
          <v-col cols="11 pl-0">
            <v-row class="mx-0">
              <v-slider v-model="txFeeIndex" :tick-labels="transactionFees" :max="2"
                        :color="txFeeColor" :track-color="txFeeColor" step="1"
                        @focus="focus = true"
                        @blur="focus = false"
                        @change="updateStore"/>
            </v-row>
            <v-row class="mx-0 fee-label">
              <v-col cols="4" class="d-flex justify-start pa-0">
                      <span class="text-left">{{ slowFee }}
                       gwei</span>
              </v-col>
              <v-col cols="4" class="d-flex justify-center pa-0">
                      <span class="text-center">{{ averageFee }}
                       gwei</span>
              </v-col>
              <v-col cols="4" class="d-flex justify-end pa-0">
                      <span class="text-right">{{ fastFee }}
                       gwei</span>
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
        <v-row v-if="showErrorMessage" class="mx-0 mt-0 d-flex justify-start">
          <span class="message-error-fee">
            You don't have the balance for this fee + amount
          </span>
        </v-row>
      </v-col>
    </v-row>
  </v-container>
</template>

<script lang="ts">
import { Component, Emit, Vue } from 'vue-property-decorator';
import { Action, Getter, State } from 'vuex-class';
import * as constants from '@/store/constants';
import { MiningSpeedFee } from '@/types/pegInTx';
import EnvironmentContextProviderService from '@/providers/EnvironmentContextProvider';
import { PegOutTxState, SessionState } from '@/types';

@Component({
})
export default class RskFeeSelect extends Vue {
  environmentContext = EnvironmentContextProviderService.getEnvironmentContext();

  focus = false;

  showEnoughBalanceError = false;

  txFeeIndex = 1.0;

  fixedUSDDecimals = 2;

  hasChange = false;

  transactionFees = ['Slow', 'Average', 'Fast'];

  @State('pegOutTx') pegOutTxState!: PegOutTxState;

  @State('web3Session') web3SessionState!: SessionState;

  @Action(constants.PEGOUT_TX_SELECT_FEE_LEVEL, { namespace: 'pegOutTx' }) setSelectedFee !: (feeLevel: MiningSpeedFee) => void;

  @Getter(constants.PEGOUT_TX_IS_ENOUGH_BALANCE, { namespace: 'pegOutTx' }) isEnoughBalance !: boolean;

  get txFeeColor() {
    let color;
    if (this.txFeeIndex === 0) color = '#F6C61B';
    if (this.txFeeIndex === 1) color = '#737778';
    if (this.txFeeIndex === 2) color = '#00B43C';
    return color;
  }

  get slowFee() {
    return this.pegOutTxState.calculatedFees.slow.toGweiTrimmedString();
  }

  get slowFeeUSD() {
    return this.pegOutTxState.calculatedFees.slow
      .toUSDFromRBTCString(
        this.pegOutTxState.bitcoinPrice, this.fixedUSDDecimals,
      );
  }

  get averageFee() {
    return this.pegOutTxState.calculatedFees.average.toGweiTrimmedString();
  }

  get averageFeeUSD() {
    return this.pegOutTxState.calculatedFees.average
      .toUSDFromRBTCString(
        this.pegOutTxState.bitcoinPrice, this.fixedUSDDecimals,
      );
  }

  get fastFee() {
    return this.pegOutTxState.calculatedFees.fast.toGweiTrimmedString();
  }

  get fastFeeUSD() {
    return this.pegOutTxState.calculatedFees.fast
      .toUSDFromRBTCString(
        this.pegOutTxState.bitcoinPrice, this.fixedUSDDecimals,
      );
  }

  get showErrorMessage() {
    return !this.isEnoughBalance
    && !this.web3SessionState.account
    && this.hasChange;
  }

  @Emit()
  updateStore() {
    this.hasChange = true;
    let selectedFee: MiningSpeedFee;
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
    this.setSelectedFee(selectedFee);
  }
}
</script>
