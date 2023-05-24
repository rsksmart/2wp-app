<template>
  <div id="option-2" class="py-4">
    <v-row class="align-start mx-0">
      <v-col cols="auto" class="pl-0">
        <div v-bind:class="[focus ?
              'number-filled' : 'number']">2</div>
      </v-col>
      <v-col class="pl-0 mb-4">
        <p v-bind:class="{'boldie': focus}">
          Enter the amount you want to send:
        </p>
        <v-row class="mx-0 mt-4 pb-0 d-flex align-center">
          <v-col cols="4" v-bind:class="[amountStyle]"
                class="input-box-outline" id="amount-field">
            <v-col cols="8" class="pa-0 pl-1">
              <v-text-field solo hide-details full-width single-line flat
                            class="amount-input"
                            placeholder="add amount"
                            v-model="bitcoinAmount" type="number"
                            step="0.00000001"
                            @keydown="blockLetterKeyDown"
                            @focus="focus = true"
                            @blur="focus = false"
                            @change="updateStore()"/>
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
              <v-text-field
              class="amount-input"
              solo hide-details full-width single-line flat readonly
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
        <v-row v-if="stepState === 'error'" class="mx-0">
                <span class="yellowish">
                  {{amountErrorMessage}}
                </span>
        </v-row>
      </v-col>
    </v-row>
  </div>
</template>

<script lang="ts">
import {
  Component, Emit, Vue, Watch,
} from 'vue-property-decorator';
import { Action, Getter, State } from 'vuex-class';
import SatoshiBig from '@/common/types/SatoshiBig';
import { BtcAccount, PegInTxState } from '@/common/types/pegInTx';
import * as constants from '@/common/store/constants';
import EnvironmentContextProviderService from '@/common/providers/EnvironmentContextProvider';
import { isBTCAmountValidRegex } from '@/common/utils';

@Component({
})
export default class BtcInputAmount extends Vue {
  environmentContext = EnvironmentContextProviderService.getEnvironmentContext();

  focus = false;

  amountStyle = '';

  bitcoinAmount = '';

  stepState: 'unused' | 'done' | 'error' = 'unused';

  @State('pegInTx') pegInTxState!: PegInTxState;

  @Action(constants.PEGIN_TX_ADD_AMOUNT_TO_TRANSFER, { namespace: 'pegInTx' }) setBtcAmount !: (amount: SatoshiBig) => void;

  @Action(constants.PEGIN_TX_CALCULATE_TX_FEE, { namespace: 'pegInTx' }) calculateTxFee !: () => Promise<void>;

  @Action(constants.PEGIN_TX_ADD_IS_VALID_AMOUNT, { namespace: 'pegInTx' }) setIsValidAmount !: (isValid: boolean) => void;

  @Getter(constants.PEGIN_TX_GET_SELECTED_BALANCE, { namespace: 'pegInTx' }) selectedAccountBalance!: SatoshiBig;

  @Getter(constants.PEGIN_TX_SELECT_ACCOUNT_TYPE, { namespace: 'pegInTx' }) selectAccount !: (accountType: BtcAccount) => void;

  @Getter(constants.PEGIN_TX_GET_ENOUGH_FEE_VALUE, { namespace: 'pegInTx' }) enoughBalanceSelectedFee !: boolean;

  get isBTCAmountValidNumberRegex() {
    return isBTCAmountValidRegex(this.bitcoinAmount);
  }

  get rbtcAmount() {
    return this.bitcoinAmount;
  }

  get safeAmount(): SatoshiBig {
    return new SatoshiBig(this.bitcoinAmount, 'btc');
  }

  get amountErrorMessage() { // mayor rework
    const feePlusAmount: SatoshiBig = this.safeAmount.plus(this.safeTxFee);
    const minValue: SatoshiBig = new SatoshiBig(this.pegInTxState.peginConfiguration.minValue, 'satoshi');
    const maxValue: SatoshiBig = new SatoshiBig(this.pegInTxState.peginConfiguration.maxValue, 'satoshi');
    if (!this.selectedAccountBalance) {
      return 'Please, select account first';
    }
    if (!this.pegInTxState.selectedAccount) {
      return 'Please, select an account first';
    }
    if (this.bitcoinAmount.toString() === '') {
      return 'Please, enter an amount';
    }
    if (this.bitcoinAmount.toString() === '0') {
      return 'Please, enter an amount';
    }
    if (!this.isBTCAmountValidNumberRegex) {
      return 'The amount must be a valid Bitcoin value';
    }
    if (this.safeAmount.lt(minValue)) {
      return `The minimum accepted value is ${minValue.toBTCTrimmedString()} ${this.environmentContext.getBtcTicker()}`;
    }
    if (feePlusAmount.gte(this.selectedAccountBalance)) {
      return 'You don\'t have the balance for this amount';
    }
    if (!this.enoughBalanceSelectedFee) {
      return 'The selected fee does not satisfy the minimum required by the network';
    }
    if (this.safeAmount.gt(maxValue)) {
      return `The maximum accepted value is ${maxValue.toBTCTrimmedString()} ${this.environmentContext.getBtcTicker()}`;
    }
    return 'Invalid format';
  }

  get safeTxFee(): SatoshiBig {
    let fee = new SatoshiBig('0', 'satoshi');
    switch (this.pegInTxState.selectedFee) {
      case constants.BITCOIN_AVERAGE_FEE_LEVEL:
        fee = this.pegInTxState.calculatedFees.average.amount;
        break;
      case constants.BITCOIN_FAST_FEE_LEVEL:
        fee = this.pegInTxState.calculatedFees.fast.amount;
        break;
      case constants.BITCOIN_SLOW_FEE_LEVEL:
        fee = this.pegInTxState.calculatedFees.slow.amount;
        break;
      default:
        break;
    }
    return fee;
  }

  get insufficientAmount() {
    const feePlusAmount: SatoshiBig = this.safeAmount.plus(this.safeTxFee);
    const minValue: SatoshiBig = new SatoshiBig(this.pegInTxState.peginConfiguration.minValue, 'satoshi');
    const maxValue: SatoshiBig = new SatoshiBig(this.pegInTxState.peginConfiguration.maxValue, 'satoshi');
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
  updateStore() {
    this.setBtcAmount(this.safeAmount);
    this.checkStep();
    this.calculateTxFee()
      .then(() => {
        this.checkStep();
      })
      .catch(console.error);
  }

  @Watch('pegInTxState.selectedFee')
  @Emit('stepState')
  checkStep() {
    this.stepState = this.isBTCAmountValidNumberRegex && !this.insufficientAmount
      ? 'done' : 'error';
    this.setIsValidAmount(this.stepState === 'done');
    return this.stepState;
  }

  @Watch('bitcoinAmount')
  watchBitcoinAmount() {
    this.checkStep();
    this.amountStyle = this.stepState === 'done' ? 'black-box' : 'yellow-box';
  }

  @Watch('selectedAccountBalance')
  watchBTCAccountTypeSelected() {
    if (this.stepState !== 'unused') {
      this.checkStep();
      this.amountStyle = this.stepState === 'done' ? 'black-box' : 'yellow-box';
    }
  }

  @Watch('pegInTxState.selectedAccount')
  accountChanged() {
    if (this.stepState !== 'unused') {
      this.checkStep();
      this.calculateTxFee();
      this.amountStyle = this.stepState === 'done' ? 'black-box' : 'yellow-box';
    }
  }

  created() {
    const isInitialValue = this.pegInTxState.amountToTransfer.toBTCString() === '0.00000000';
    if (!isInitialValue) {
      this.bitcoinAmount = this.pegInTxState.amountToTransfer.toBTCString();
    }
  }
}
</script>
