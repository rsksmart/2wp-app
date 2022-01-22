<template>
  <div id="option-2" class="py-4">
    <v-row align="start" class="mx-0">
      <v-col cols="auto" class="pl-0">
        <div v-bind:class="[focus ?
              'number-filled' : 'number']">2</div>
      </v-col>
      <v-col class="pl-0 mb-4">
        <p v-bind:class="{'boldie': focus}">
          Enter the amount you want to send:
        </p>
        <v-row class="mx-0 mt-4 pb-0 d-flex align-center">
          <v-col cols="4" v-bind:class="[amountStyle]" class="input-box-outline">
            <v-col cols="8" class="pa-0 pl-1">
              <v-text-field solo hide-details full-width single-line flat
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
import { Action, State } from 'vuex-class';
import SatoshiBig from '@/types/SatoshiBig';
import { BtcAccount, PegInTxState } from '@/store/peginTx/types';
import * as constants from '@/store/constants';

@Component({
})
export default class BtcInputAmount extends Vue {
  focus = false;

  amountStyle = '';

  bitcoinAmount = '';

  stepState: 'unused' | 'done' | 'error' = 'unused';

  @State('pegInTx') pegInTxState!: PegInTxState;

  @Action(constants.PEGIN_TX_ADD_AMOUNT_TO_TRANSFER, { namespace: 'pegInTx' }) setBtcAmount !: (amount: SatoshiBig) => void;

  @Action(constants.PEGIN_TX_CALCULATE_TX_FEE, { namespace: 'pegInTx' }) calculateTxFee !: () => Promise<void>;

  get isBTCAmountValidNumberRegex() {
    return /^[0-9]{1,8}(\.[0-9]{0,8})?$/.test(this.bitcoinAmount.toString());
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
    if (this.bitcoinAmount.toString() === '') {
      return '';
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

  get safeTxFee(): SatoshiBig {
    let fee = new SatoshiBig('0', 'satoshi');
    switch (this.pegInTxState.selectedFee) {
      case constants.BITCOIN_AVERAGE_FEE_LEVEL:
        fee = this.pegInTxState.calculatedFees.average;
        break;
      case constants.BITCOIN_FAST_FEE_LEVEL:
        fee = this.pegInTxState.calculatedFees.fast;
        break;
      case constants.BITCOIN_SLOW_FEE_LEVEL:
        fee = this.pegInTxState.calculatedFees.slow;
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

  get selectedAccountBalance(): SatoshiBig {
    switch (this.pegInTxState.selectedAccount) {
      case constants.BITCOIN_LEGACY_ADDRESS:
        return this.pegInTxState.balances.legacy;
      case constants.BITCOIN_NATIVE_SEGWIT_ADDRESS:
        return this.pegInTxState.balances.nativeSegwit;
      case constants.BITCOIN_SEGWIT_ADDRESS:
        return this.pegInTxState.balances.segwit;
      default:
        break;
    }
    return new SatoshiBig('0', 'satoshi');
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

  @Emit('')
  updateStore() {
    this.setBtcAmount(this.safeAmount);
    this.calculateTxFee()
      .then(() => {
        this.stepState = this.isBTCAmountValidNumberRegex && !this.insufficientAmount
          ? 'done' : 'error';
        this.emitState();
      })
      .catch(console.error);
  }

  @Emit('stepState')
  emitState() {
    return this.stepState;
  }

  @Watch('bitcoinAmount')
  watchBitcoinAmount() {
    this.stepState = this.isBTCAmountValidNumberRegex && !this.insufficientAmount
      ? 'done' : 'error';
    this.amountStyle = this.stepState === 'done' ? 'green-box' : 'yellow-box';
  }

  @Watch('btcAccountTypeSelected')
  watchBTCAccountTypeSelected() {
    if (this.stepState !== 'unused') {
      this.stepState = this.isBTCAmountValidNumberRegex && !this.insufficientAmount
        ? 'done' : 'error';
      this.amountStyle = this.stepState === 'done' ? 'green-box' : 'yellow-box';
    }
  }
}
</script>
