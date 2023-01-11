<template>
  <div id="option-4" class="py-4">
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
                        :rules="[enoughBalance]"
                        @change="updateStore"/>
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
</template>

<script lang="ts">
import { Component, Emit, Vue } from 'vue-property-decorator';
import { Action, Getter, State } from 'vuex-class';
import * as constants from '@/store/constants';
import { MiningSpeedFee, PegInTxState } from '@/types/pegInTx';
import EnvironmentContextProviderService from '@/providers/EnvironmentContextProvider';

@Component({
})
export default class BtcFeeSelect extends Vue {
  environmentContext = EnvironmentContextProviderService.getEnvironmentContext();

  focus = false;

  txFeeIndex = 1.0;

  fixedUSDDecimals = 2;

  transactionFees = ['Slow', 'Average', 'Fast'];

  @State('pegInTx') pegInTxState!: PegInTxState;

  @Action(constants.PEGIN_TX_SELECT_FEE_LEVEL, { namespace: 'pegInTx' }) setSelectedFee !: (feeLevel: MiningSpeedFee) => void;

  @Getter(constants.PEGIN_TX_IS_ENOUGH_BALANCE, { namespace: 'pegInTx' }) isEnoughBalance !: boolean;

  get txFeeColor() {
    let color;
    if (this.txFeeIndex === 0) color = '#F6C61B';
    if (this.txFeeIndex === 1) color = '#737778';
    if (this.txFeeIndex === 2) color = '#00B43C';
    return color;
  }

  get slowFee() {
    return this.pegInTxState.calculatedFees.slow.amount.toBTCString();
  }

  get slowFeeUSD() {
    return this.pegInTxState.calculatedFees.slow
      .amount.toUSDFromBTCString(this.pegInTxState.bitcoinPrice, this.fixedUSDDecimals);
  }

  get averageFee() {
    return this.pegInTxState.calculatedFees.average.amount.toBTCString();
  }

  get averageFeeUSD() {
    return this.pegInTxState.calculatedFees.average
      .amount.toUSDFromBTCString(this.pegInTxState.bitcoinPrice, this.fixedUSDDecimals);
  }

  get fastFee() {
    return this.pegInTxState.calculatedFees.fast.amount.toBTCString();
  }

  get fastFeeUSD() {
    return this.pegInTxState.calculatedFees.fast
      .amount.toUSDFromBTCString(this.pegInTxState.bitcoinPrice, this.fixedUSDDecimals);
  }

  get enoughBalance(): boolean | string {
    return this.isEnoughBalance ? this.isEnoughBalance : 'You don\'t have the balance for this fee + amount';
  }

  @Emit()
  updateStore() {
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
