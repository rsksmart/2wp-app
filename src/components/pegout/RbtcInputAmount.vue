<template>
  <div class="form-step mt-5 mb-0 py-0">
    <v-row class="align-start mx-0">
      <v-col cols="auto" class="pl-0">
        <div v-bind:class="[focus ?
              'number-filled' : 'number']">2</div>
      </v-col>
      <v-col class="px-0 mb-4">
        <p v-bind:class="{'boldie': focus}">
          Enter the amount you want to send:
        </p>
        <v-row class="d-cols-wht mt-6 ml-1">
          <v-col cols="5" v-bind:class="[amountStyle]" class="input-box-outline" >
            <v-col cols="8" class="d-flex align-center">
              <v-text-field
                v-model="rbtcAmount" color="#F8F5F5"
                class="amount-input"
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
          <v-col cols="1" class="py-0 d-flex justify-center">
            <v-icon color="#000">mdi-arrow-right</v-icon>
          </v-col>
          <v-col cols="5" class="pa-0 d-flex align-center">
            <v-row class="ma-0 pa-0">
              <v-col class="ma-0 pa-0 d-flex align-center">
                <span>{{rbtcAmount}}</span>
              </v-col>
              <v-col class="ma-0 pa-0 d-flex align-center">
                <v-img src="@/assets/exchange/btc.png" height="30" contain/>
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
  </div>
</template>

<script lang="ts">
import { Component, Vue, Watch } from 'vue-property-decorator';
import EnvironmentContextProviderService from '@/providers/EnvironmentContextProvider';
import { Action, Getter, State } from 'vuex-class';
import * as constants from '@/store/constants';
import { isRBTCAmountValidRegex } from '@/services/utils';
import { PegOutTxState, SessionState, WeiBig } from '@/types';

@Component({})
export default class RbtcInputAmount extends Vue {
  environmentContext = EnvironmentContextProviderService.getEnvironmentContext();

  focus = false;

  rbtcAmount = '';

  amountStyle = '';

  stepState: 'unset' | 'valid' |'error' = 'unset';

  @State('pegOutTx') pegOutTxState!: PegOutTxState;

  @State('web3Session') web3SessionState!: SessionState;

  @Action(constants.PEGOUT_TX_ADD_AMOUNT, { namespace: 'pegOutTx' }) setRbtcAmount !: (amount: WeiBig) => void;

  @Action(constants.PEGOUT_TX_CALCULATE_FEE, { namespace: 'pegOutTx' }) calculateTxFee !: () => void;

  @Action(constants.PEGOUT_TX_ADD_VALID_AMOUNT, { namespace: 'pegOutTx' }) setValidAmount !: (valid: boolean) => void;

  @Getter(constants.PEGOUT_TX_GET_SAFE_TX_FEE, { namespace: 'pegOutTx' }) safeTxFee !: WeiBig;

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
    this.setRbtcAmount(new WeiBig(this.rbtcAmount, 'rbtc'));
    this.calculateTxFee();
  }

  get amountErrorMessage() {
    const feePlusAmount: WeiBig = this.safeAmount.plus(this.safeTxFee);
    const { minValue, maxValue } = this.pegOutTxState.pegoutConfiguration;
    const { balance } = this.web3SessionState;
    if (this.rbtcAmount.toString() === '') {
      return 'Please, enter an amount';
    }
    if (this.rbtcAmount.toString() === '0') {
      return 'Please, enter an amount';
    }
    if (this.safeAmount.lt(minValue)) { // remove it
      return `The minimum accepted value is ${minValue.toRBTCTrimmedString()} ${this.environmentContext.getRbtcTicker()}`;
    }
    if (!isRBTCAmountValidRegex(this.rbtcAmount)) {
      return `The amount must be a valid ${this.environmentContext.getRbtcTicker()} value`;
    }
    if (feePlusAmount.gte(balance)) {
      return 'You don\'t have the balance for this amount';
    }
    if (this.safeAmount.lt(minValue)) {
      return `The minimum accepted value is ${minValue.toRBTCTrimmedString()} ${this.environmentContext.getRbtcTicker()}`;
    }
    if (this.safeAmount.gt(maxValue)) {
      return `The maximum accepted value is ${maxValue.toRBTCTrimmedString()} ${this.environmentContext.getRbtcTicker()}`;
    }
    return '';
  }

  get safeAmount(): WeiBig {
    return new WeiBig(this.rbtcAmount ?? '0', 'rbtc');
  }

  get insufficientAmount() {
    const feePlusAmount: WeiBig = this.safeAmount.plus(this.safeTxFee);
    const { pegoutConfiguration } = this.pegOutTxState;
    const { balance } = this.web3SessionState;
    if (this.safeAmount.lte('0')
      || feePlusAmount.gt(balance)
      || this.safeAmount.lt(pegoutConfiguration.minValue)
      || this.safeAmount.gt(pegoutConfiguration.maxValue)) {
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
    this.amountStyle = this.stepState === 'valid' ? 'green-box' : 'yellow-box';
  }
}
</script>
