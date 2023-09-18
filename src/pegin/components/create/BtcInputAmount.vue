<template>
  <div id="option-2" class="py-4">
    <v-row class="align-start mx-0">
      <v-col cols="auto" class="pl-0">
        <div v-bind:class="[focus ?
              'number-filled' : 'number']">2</div>
      </v-col>
      <v-col class="pl-0">
        <p v-bind:class="{'boldie': focus}">
          Enter the amount you want to send:
        </p>
        <v-row class="ma-0 mt-4 pb-0 d-flex align-center">
          <v-col cols="4" v-bind:class="[amountStyle]" class="input-box-outline">
            <v-col cols="8" class="pa-0 pl-1">
              <v-text-field solo hide-details full-width single-line flat
                            variant="solo"
                            density="compact"
                            class="amount-input"
                            placeholder="Add amount"
                            v-model="bitcoinAmount" type="number"
                            step="0.00000001"
                            @keydown="blockLetterKeyDown"
                            @focus="focus = true"
                            @blur="focus = false"
                            @change="updateStore()"/>
            </v-col>
            <v-col cols="4" class="pa-0">
              <v-row class="ma-0">
                <v-col cols="5" class="pa-0">
                  <v-img :src="require('@/assets/exchange/btc.png')" height="20" contain/>
                </v-col>
                <v-col cols="7" class="pa-0 d-flex align-center">
                  <span>{{environmentContext.getBtcTicker()}}</span>
                </v-col>
              </v-row>
            </v-col>
          </v-col>
          <v-col cols="1" class="d-flex justify-center">
            <v-icon :icon="mdiArrowRight" color="#000"></v-icon>
          </v-col>
          <v-col cols="4" class="pa-0 input-box-flat">
            <v-col cols="8" class="pa-0 pl-1">
              <v-text-field
              class="amount-input"
              solo hide-details full-width single-line flat readonly
              variant="plain"
                            v-model="rbtcAmount" type="number"/>
            </v-col>
            <v-col cols="4" class="pa-0">
              <v-row class="ma-0">
                <v-col cols="5" class="pa-0">
                  <v-img :src="require('@/assets/exchange/rbtc.png')" height="20" contain/>
                </v-col>
                <v-col cols="7" class="pa-0 d-flex align-center">
                  <span>{{environmentContext.getRbtcTicker()}}</span>
                </v-col>
              </v-row>
            </v-col>
          </v-col>
          <v-col/>
        </v-row>
        <v-col cols="4" class="pa-0">
          <v-row class="derive-button ma-0 d-flex justify-center">
            <v-btn
              :disabled="!enableButton"
              outlined rounded
              width="100%" height="38"
              @click="setMax" id="max-btn">
              <span>
                Use max available balance
              </span>
            </v-btn>
          </v-row>
        </v-col>
        <v-row class="pt-1 ma-0" style="min-height: 17px;">
          <span v-if="stepState === 'error'" class="yellowish">
            {{amountErrorMessage}}
          </span>
        </v-row>
      </v-col>
    </v-row>
  </div>
</template>

<script lang="ts">
import {
  computed, ref, watch, defineComponent,
} from 'vue';
import { mdiArrowRight } from '@mdi/js';
import SatoshiBig from '@/common/types/SatoshiBig';
import {
  BtcAccount,
  MiningSpeedFee,
  PeginConfiguration,
} from '@/common/types/pegInTx';
import * as constants from '@/common/store/constants';
import EnvironmentContextProviderService from '@/common/providers/EnvironmentContextProvider';
import { isBTCAmountValidRegex } from '@/common/utils';
import { useAction, useGetter, useStateAttribute } from '@/common/store/helper';
import { FeeAmountData } from '@/common/types';
import { pegInTx } from '@/pegin/store';

export default defineComponent({
  name: 'BtcInputAmount',
  props: {
    enableButton: Boolean,
  },
  setup(props, context) {
    const enableButton = ref(props.enableButton);
    const environmentContext = EnvironmentContextProviderService.getEnvironmentContext();
    const focus = ref(false);
    const amountStyle = ref('');
    const bitcoinAmount = ref('');
    const stepState = ref<'unused' | 'done' | 'error'>('unused');

    const calculatedFees = useStateAttribute<FeeAmountData>('pegInTx', 'calculatedFees');
    const selectedFee = useStateAttribute<MiningSpeedFee>('pegInTx', 'selectedFee');
    const selectedAccount = useStateAttribute<BtcAccount>('pegInTx', 'selectedAccount');
    const peginConfiguration = useStateAttribute<PeginConfiguration>('pegInTx', 'peginConfiguration');
    const amountToTransfer = useStateAttribute<SatoshiBig>('pegInTx', 'amountToTransfer');
    const isValidAmountToTransfer = useStateAttribute<boolean>('pegInTx', 'isValidAmountToTransfer');

    const setBtcAmount = useAction('pegInTx', constants.PEGIN_TX_ADD_AMOUNT_TO_TRANSFER);
    const calculateTxFee = useAction('pegInTx', constants.PEGIN_TX_CALCULATE_TX_FEE);
    const setIsValidAmount = useAction('pegInTx', constants.PEGIN_TX_ADD_IS_VALID_AMOUNT);
    const selectedAccountBalance = useGetter<SatoshiBig>('pegInTx', constants.PEGIN_TX_GET_SELECTED_BALANCE);
    const enoughBalanceSelectedFee = useGetter<boolean>('pegInTx', constants.PEGIN_TX_GET_ENOUGH_FEE_VALUE);

    const isBTCAmountValidNumberRegex = computed(() => isBTCAmountValidRegex(bitcoinAmount.value));

    const rbtcAmount = computed(() => bitcoinAmount.value);

    const safeAmount = computed((): SatoshiBig => new SatoshiBig(bitcoinAmount.value, 'btc'));

    const safeTxFee = computed((): SatoshiBig => {
      let fee = new SatoshiBig('0', 'satoshi');
      switch (selectedFee.value) {
        case constants.BITCOIN_AVERAGE_FEE_LEVEL:
          fee = calculatedFees.value.average.amount;
          break;
        case constants.BITCOIN_FAST_FEE_LEVEL:
          fee = calculatedFees.value.fast.amount;
          break;
        case constants.BITCOIN_SLOW_FEE_LEVEL:
          fee = calculatedFees.value.slow.amount;
          break;
        default:
          break;
      }
      return fee;
    });

    const amountErrorMessage = computed(() => { // mayor rework
      const feePlusAmount: SatoshiBig = safeAmount.value.plus(safeTxFee.value);
      const minValue: SatoshiBig = new SatoshiBig(peginConfiguration.value.minValue, 'satoshi');
      const maxValue: SatoshiBig = new SatoshiBig(peginConfiguration.value.maxValue, 'satoshi');
      if (selectedAccountBalance.value.eq('0') && !isValidAmountToTransfer.value) {
        return 'Selected account has no balance';
      }
      if (!selectedAccountBalance) {
        return 'Please, select account first';
      }
      if (!selectedAccount.value) {
        return 'Please, select an account first';
      }
      if (bitcoinAmount.value.toString() === '') {
        return 'Please, enter an amount';
      }
      if (bitcoinAmount.value.toString() === '0') {
        return 'Please, enter an amount';
      }
      if (!isBTCAmountValidNumberRegex.value) {
        return 'The amount must be a valid Bitcoin value';
      }
      if (safeAmount.value.lt(minValue)) {
        return `The minimum accepted value is ${minValue.toBTCTrimmedString()} ${environmentContext.getBtcTicker()}`;
      }
      if (feePlusAmount.gte(selectedAccountBalance.value)) {
        return 'You don\'t have the balance for this amount';
      }
      if (!enoughBalanceSelectedFee) {
        return 'The selected fee does not satisfy the minimum required by the network';
      }
      if (safeAmount.value.gt(maxValue)) {
        return `The maximum accepted value is ${maxValue.toBTCTrimmedString()} ${environmentContext.getBtcTicker()}`;
      }
      return 'Invalid format';
    });

    const insufficientAmount = computed(() => {
      const feePlusAmount: SatoshiBig = safeAmount.value.plus(safeTxFee.value);
      const minValue: SatoshiBig = new SatoshiBig(peginConfiguration.value.minValue, 'satoshi');
      const maxValue: SatoshiBig = new SatoshiBig(peginConfiguration.value.maxValue, 'satoshi');
      if (safeAmount.value.lte('0')
        || feePlusAmount.gt(selectedAccountBalance.value)
        || safeAmount.value.lt(minValue)
        || safeAmount.value.gt(maxValue)) {
        return true;
      }
      if (safeAmount.value.gt('0') && feePlusAmount.lte(selectedAccountBalance.value)) {
        return false;
      }
      return false;
    });

    function blockLetterKeyDown(e: KeyboardEvent) {
      if (bitcoinAmount.value.toString().length > 15
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

    function checkStep() {
      stepState.value = isBTCAmountValidNumberRegex.value && !insufficientAmount.value
        ? 'done' : 'error';
      setIsValidAmount(stepState.value === 'done');
      context.emit('stepState', stepState.value);
    }

    function updateStore() {
      setBtcAmount(safeAmount.value);
      checkStep();
      calculateTxFee()
        .then(() => {
          checkStep();
        })
        .catch(console.error);
    }

    function fillMaxValueAvailable() {
      const tempValue = selectedAccountBalance.value.minus(safeTxFee.value);
      bitcoinAmount.value = tempValue.toBTCTrimmedString();
      setBtcAmount(tempValue);
      setIsValidAmount(selectedAccountBalance.value.gt('0'));
    }

    async function setMax() {
      fillMaxValueAvailable();
      calculateTxFee()
        .then(() => {
          fillMaxValueAvailable();
          updateStore();
        })
        .catch(console.error);
    }

    function watchBitcoinAmount() {
      checkStep();
      amountStyle.value = stepState.value === 'done' ? 'black-box' : 'yellow-box';
    }

    function watchBTCAccountTypeSelected() {
      if (stepState.value !== 'unused') {
        checkStep();
        amountStyle.value = stepState.value === 'done' ? 'black-box' : 'yellow-box';
      }
    }

    function accountChanged() {
      if (stepState.value !== 'unused') {
        enableButton.value = true;
        checkStep();
        calculateTxFee();
        amountStyle.value = stepState.value === 'done' ? 'black-box' : 'yellow-box';
      }
    }

    watch(selectedFee, checkStep);
    watch(bitcoinAmount, watchBitcoinAmount);
    watch(selectedAccountBalance, watchBTCAccountTypeSelected);
    watch(pegInTx, accountChanged);

    const isInitialValue = amountToTransfer.value.toBTCString() === '0.00000000';
    if (!isInitialValue) {
      bitcoinAmount.value = amountToTransfer.value.toBTCString();
    }

    return {
      focus,
      environmentContext,
      amountStyle,
      bitcoinAmount,
      stepState,
      blockLetterKeyDown,
      updateStore,
      rbtcAmount,
      amountErrorMessage,
      mdiArrowRight,
      setMax,
    };
  },
});
</script>
