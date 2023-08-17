<template>
  <div class="form-step ma-0 py-4">
    <v-row class="align-start mx-0">
      <v-col cols="auto" class="pl-0">
        <div v-bind:class="[focus ?
              'number-filled' : 'number']">2</div>
      </v-col>
      <v-col class="px-0 pb-2">
        <p v-bind:class="{'boldie': focus}">
          Enter the amount you want to send:
        </p>
        <v-row class="d-cols-wht ma-0 mt-4">
          <v-col cols="4" v-bind:class="[amountStyle]"
                 class="input-box-outline" id="amount-field">
            <v-col cols="8" class="d-flex align-center">
              <v-text-field
                :disabled="!isWalletConnected"
                v-model="rbtcAmount"
                class="amount-input"
                placeholder="Add amount" type="number" step="0.00000001"
                @focus="focus = true"
                @blur="focus = false"
                @change="updateStore()"
                @keydown="blockLetterKeyDown"
                variant="solo"
                flat hide-details full-width single-line/>
            </v-col>
            <v-col cols="4" class="ma-0 pa-0">
              <v-row>
                <v-img :src="require('@/assets/exchange/rbtc.png')" height="30" contain/>
              </v-row>
            </v-col>
          </v-col>
          <v-col cols="1" class="py-0 d-flex align-center">
            <v-icon color="#000" :icon="mdiArrowRight"></v-icon>
          </v-col>
          <v-col cols="5" class="pa-0 d-flex align-center">
            <v-row class="ma-0 pa-0">
              <v-col class="ma-0 pa-0 d-flex align-center">
                <span>{{estimatedBtcToReceive.toBTCTrimmedString()}}</span>
              </v-col>
              <v-col class="ma-0 pa-0 d-flex align-center">
                <v-img :src="require('@/assets/exchange/btc.png')" height="30" contain/>
              </v-col>
            </v-row>
          </v-col>
          <v-col cols="4" class="pa-0 pt-4">
            <v-row class="derive-button ma-0 d-flex justify-center">
              <v-btn :disabled="enableButton"
                variant="outlined" rounded
                width="100%" height="38"
                @click="setMax" id="max-btn">
                <span>
                 Use max available balance
                </span>
              </v-btn>
            </v-row>
          </v-col>
        </v-row>
        <v-row class="ma-0 mt-2 error-max-balance" style="min-height: 17px;">
          <span v-if="stepState === 'error'" class="yellowish" id="rbtc-error-msg">
            {{amountErrorMessage}}
          </span>
        </v-row>
      </v-col>
    </v-row>
  </div>
</template>

<script lang="ts">
import Web3 from 'web3';
import {
  computed, ref, watch, defineComponent,
} from 'vue';
import { mdiArrowRight } from '@mdi/js';
import EnvironmentContextProviderService from '@/common/providers/EnvironmentContextProvider';
import * as constants from '@/common/store/constants';
import { isRBTCAmountValidRegex } from '@/common/utils';
import {
  MiningSpeedFee,
  PegOutTxState, SatoshiBig, SessionState, WeiBig,
} from '@/common/types';
import { useAction, useGetter, useState } from '@/common/store/helper';

export default defineComponent({
  name: 'RbtcInputAmount',
  props: {
    enableButton: Boolean,
  },
  setup() {
    const environmentContext = EnvironmentContextProviderService.getEnvironmentContext();
    const focus = ref(false);
    const rbtcAmount = ref('');
    const amountStyle = ref('');
    const stepState = ref<'unset' | 'valid' |'error'>('unset');

    const pegOutTxState = useState<PegOutTxState>('pegOutTx');
    const web3SessionState = useState<SessionState>('web3Session');
    const initPegoutTx = useAction('pegOutTx', constants.PEGOUT_TX_INIT);
    const clearState = useAction('pegOutTx', constants.PEGOUT_TX_CLEAR);
    const setRbtcAmount = useAction('pegOutTx', constants.PEGOUT_TX_ADD_AMOUNT);
    const calculateTxFee = useAction('pegOutTx', constants.PEGOUT_TX_CALCULATE_FEE);
    const setValidAmount = useAction('pegOutTx', constants.PEGOUT_TX_ADD_VALID_AMOUNT);
    const safeTxFee = useGetter<WeiBig>('pegOutTx', constants.PEGOUT_TX_GET_SAFE_TX_FEE);
    const estimatedBtcToReceive = useGetter<SatoshiBig>('pegOutTx', constants.PEGOUT_TX_GET_ESTIMATED_BTC_TO_RECEIVE);
    const account = computed<string>(() => web3SessionState.value.account as string);
    const selectedFee = computed<MiningSpeedFee>(
      () => pegOutTxState.value.selectedFee as MiningSpeedFee,
    );

    const safeAmount = computed((): WeiBig => new WeiBig(rbtcAmount.value ?? '0', 'rbtc'));

    const amountErrorMessage = computed(() => {
      const feePlusAmount: WeiBig = safeAmount.value.plus(safeTxFee.value);
      const { minValue, maxValue } = pegOutTxState.value.pegoutConfiguration;
      const { balance } = web3SessionState.value;
      if (rbtcAmount.value.toString() === '') {
        return 'Please, enter an amount';
      }
      if (rbtcAmount.value.toString() === '0') {
        return 'Please, enter an amount';
      }
      if (safeAmount.value.lt(minValue)) { // remove it
        return `The minimum accepted value is ${minValue.toRBTCTrimmedString()} ${environmentContext.getRbtcTicker()}`;
      }
      if (!isRBTCAmountValidRegex(rbtcAmount.value)) {
        return `The amount must be a valid ${environmentContext.getRbtcTicker()} value`;
      }
      if (feePlusAmount.gte(balance)) {
        return 'You don\'t have the balance for this amount';
      }
      if (safeAmount.value.lt(minValue)) {
        return `The minimum accepted value is ${minValue.toRBTCTrimmedString()} ${environmentContext.getRbtcTicker()}`;
      }
      if (safeAmount.value.gt(maxValue)) {
        return `The maximum accepted value is ${maxValue.toRBTCTrimmedString()} ${environmentContext.getRbtcTicker()}`;
      }
      return '';
    });

    const insufficientAmount = computed(() => {
      const feePlusAmount: WeiBig = safeAmount.value.plus(safeTxFee.value);
      const { pegoutConfiguration } = pegOutTxState.value;
      const { balance } = web3SessionState.value;
      if (safeAmount.value.lte('0')
        || feePlusAmount.gt(balance)
        || safeAmount.value.lt(pegoutConfiguration.minValue)
        || safeAmount.value.gt(pegoutConfiguration.maxValue)) {
        return true;
      }
      if (safeAmount.value.gt('0') && feePlusAmount.lte(balance)) {
        return false;
      }
      return false;
    });

    const isWalletConnected = computed((): boolean => web3SessionState.value.account !== undefined);

    function blockLetterKeyDown(e: KeyboardEvent) {
      if (rbtcAmount.value.toString().length > 18
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

    function updateStore() {
      setRbtcAmount(new WeiBig(rbtcAmount.value, 'rbtc'));
      calculateTxFee();
    }

    async function calculateFeeByAmount(amount: WeiBig): Promise<WeiBig> {
      const web3 = web3SessionState.value.web3 as Web3;
      const sender = web3SessionState.value.account;
      let finalFee: WeiBig;
      const gas = Number(await web3.eth.estimateGas({
        from: sender,
        to: pegOutTxState.value.pegoutConfiguration.bridgeContractAddress,
        value: amount.toWeiString(),
      }));

      const gasPrice = Number(await web3.eth.getGasPrice());
      const averageGasPrice = Math.round(gasPrice * (3 / 2));
      const calculatedFees = {
        slow: new WeiBig(gasPrice * gas, 'wei'),
        average: new WeiBig(averageGasPrice * gas, 'wei'),
        fast: new WeiBig(gasPrice * gas * 2, 'wei'),
      };

      switch (pegOutTxState.value.selectedFee) {
        case constants.BITCOIN_SLOW_FEE_LEVEL:
          finalFee = calculatedFees.slow;
          break;
        case constants.BITCOIN_AVERAGE_FEE_LEVEL:
          finalFee = calculatedFees.average;
          break;
        case constants.BITCOIN_FAST_FEE_LEVEL:
          finalFee = calculatedFees.fast;
          break;
        default:
          finalFee = calculatedFees.average;
          break;
      }

      return finalFee;
    }

    async function setMax() {
      const { balance } = web3SessionState.value;
      const fee = await calculateFeeByAmount(balance);
      const maxAmount = balance.minus(fee);
      rbtcAmount.value = maxAmount.toRBTCTrimmedString();
      await setRbtcAmount(maxAmount);
      await calculateTxFee();
    }

    function checkAmount() {
      if (!isWalletConnected.value) return;
      stepState.value = !insufficientAmount.value && isRBTCAmountValidRegex(rbtcAmount.value)
        ? 'valid' : 'error';
      setValidAmount(stepState.value === 'valid');
      amountStyle.value = stepState.value === 'valid' ? 'black-box' : 'yellow-box';
    }

    function clearStateWhenWalletIsDisconnected() {
      if (!isWalletConnected.value) {
        clearState();
        initPegoutTx();
        rbtcAmount.value = '';
      }
    }

    watch(account, clearStateWhenWalletIsDisconnected);
    watch(rbtcAmount, checkAmount);
    watch(selectedFee, checkAmount);

    return {
      amountStyle,
      isWalletConnected,
      rbtcAmount,
      focus,
      updateStore,
      blockLetterKeyDown,
      estimatedBtcToReceive,
      setMax,
      stepState,
      amountErrorMessage,
      mdiArrowRight,
    };
  },
});
</script>
