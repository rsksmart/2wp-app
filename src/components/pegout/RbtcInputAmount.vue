<template>
  <v-container class="form-step pb-0 pt-3">
    <v-row class="align-start mx-0">
      <v-col cols="auto" class="pl-0">
        <div v-bind:class="[focus ?
              'number-filled' : 'number']">2</div>
      </v-col>
      <v-col class="px-0 mb-4">
        <p v-bind:class="{'boldie': focus}">
          Enter the amount you want to send:
        </p>
        <v-row class="ma-0">
          <v-col cols="5" class="pa-0 d-flex align-center input-box" >
            <v-col cols="8" class="ma-0 pa-0 d-flex align-center">
              <v-text-field class="amount-input" v-model="rbtcAmount" color="#F8F5F5"
                            placeholder="add amount" type="number" step="0.00000001"
                            @focus="focus = true"
                            @blur="focus = false"
                            @change="updateStore()"
                            @keydown="blockLetterKeyDown"
                            solo hide-details full-width single-line flat/>
            </v-col>
            <v-col cols="4" class="ma-0 pa-0">
              <v-row>
                <v-img src="@/assets/exchange/rbtc.png" height="30" contain/>
              </v-row>
            </v-col>
          </v-col>
          <v-col cols="1" class="pa-0 d-flex align-center">
            <v-icon>mdi-arrow-right</v-icon>
          </v-col>
          <v-col cols="5" class="pa-0 d-flex align-center">
            <v-row class="ma-0 pa-0">
              <v-col class="ma-0 pa-0 d-flex align-center">
                <span>{{rbtcAmount}}</span>
              </v-col>
              <v-col class="ma-0 pa-0 d-flex align-center">
                <v-img src="@/assets/exchange/rbtc.png" height="30" contain/>
              </v-col>
            </v-row>
          </v-col>
        </v-row>
        <v-row v-if="stepState === 'error'" class="mx-0">
                <span class="yellowish" id="rbtc-error-msg">
                  {{amountErrorMessage}}
                </span>
        </v-row>
      </v-col>
    </v-row>
  </v-container>
</template>

<script lang="ts">
import { Component, Vue, Watch } from 'vue-property-decorator';
import EnvironmentContextProviderService from '@/providers/EnvironmentContextProvider';
import { Action, Getter, State } from 'vuex-class';
import * as constants from '@/store/constants';
import Big from 'big.js';
import { isRBTCAmountValidRegex } from '@/services/utils';
import { PegOutTxState } from '@/types';

@Component({})
export default class RbtcInputAmount extends Vue {
  environmentContext = EnvironmentContextProviderService.getEnvironmentContext();

  focus = false;

  rbtcAmount = '';

  stepState: 'unset' | 'valid' |'error' = 'unset';

  @State('pegOutTx') pegOutTxState!: PegOutTxState;

  @Action(constants.PEGOUT_TX_ADD_AMOUNT, { namespace: 'pegOutTx' }) setRbtcAmount !: (amount: Big) => void;

  @Action(constants.PEGOUT_TX_CALCULATE_FEE, { namespace: 'pegOutTx' }) calculateTxFee !: () => void;

  @Action(constants.PEGOUT_TX_ADD_VALID_AMOUNT, { namespace: 'pegOutTx' }) setValidAmount !: (valid: boolean) => void;

  @Getter(constants.PEGOUT_TX_GET_SAFE_TX_FEE, { namespace: 'pegOutTx' }) safeTxFee !: Big;

  blockLetterKeyDown(e: KeyboardEvent) {
    if (this.rbtcAmount.toString().length > 18
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

  updateStore() {
    this.setRbtcAmount(new Big(this.rbtcAmount));
    this.calculateTxFee();
  }

  get amountErrorMessage() {
    const feePlusAmount: Big = this.safeAmount.plus(this.safeTxFee);
    const { minAmountToTransfer, maxAmountToTransfer, balance } = this.pegOutTxState;
    if (this.rbtcAmount.toString() === '') {
      return 'Please, enter an amount';
    }
    if (this.rbtcAmount.toString() === '0') {
      return 'Please, enter an amount';
    }
    if (!isRBTCAmountValidRegex(this.rbtcAmount)) {
      return 'The amount must be a valid Rbtc value';
    }
    if (this.safeAmount.lt(minAmountToTransfer)) {
      return `The minimum accepted value is ${minAmountToTransfer.toString()} ${this.environmentContext.getBtcTicker()}`;
    }
    if (feePlusAmount.gte(balance)) {
      return 'You don\'t have the balance for this amount';
    }
    if (this.safeAmount.gt(maxAmountToTransfer)) {
      return `The maximum accepted value is ${maxAmountToTransfer.toString()} ${this.environmentContext.getBtcTicker()}`;
    }
    return '';
  }

  get safeAmount(): Big {
    return new Big(this.rbtcAmount ?? '0');
  }

  get insufficientAmount() {
    const feePlusAmount: Big = this.safeAmount.plus(this.safeTxFee);
    const { minAmountToTransfer, maxAmountToTransfer, balance } = this.pegOutTxState;
    if (this.safeAmount.lte('0')
      || feePlusAmount.gt(balance)
      || this.safeAmount.lt(minAmountToTransfer)
      || this.safeAmount.gt(maxAmountToTransfer)) {
      return true;
    }
    if (this.safeAmount.gt('0') && feePlusAmount.lte(balance)) {
      return false;
    }
    return false;
  }

  @Watch('pegOutTxState.selectedFee')
  @Watch('rbtcAmount')
  checkAmount() {
    this.stepState = !this.insufficientAmount && isRBTCAmountValidRegex(this.rbtcAmount)
      ? 'valid' : 'error';
    this.setValidAmount(this.stepState === 'valid');
  }
}
</script>
