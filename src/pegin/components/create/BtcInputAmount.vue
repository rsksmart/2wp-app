<template>
  <v-row no-gutters>
    <v-col>
      <span class="d-inline-block font-weight-bold my-3">
        I will send
      </span>
    </v-col>
    <v-col>
      <span class="d-inline-block font-weight-bold my-3 ml-6">
        I will receive
      </span>
    </v-col>
  </v-row>
  <v-row no-gutters align="center">
    <v-col>
      <v-text-field
        hide-details
        hide-spin-buttons
        flat
        variant="solo"
        density="comfortable"
        rounded="lg"
        class="text-h4"
        v-model="bitcoinAmount"
        type="number"
        step="0.00000001"
        @keydown="blockLetterKeyDown"
        @wheel.prevent
        @focus="focus = true"
        @blur="focus = false"
        @update:modelValue="updateStore()">
          <template #prepend-inner>
            <v-chip :prepend-icon="mdiBitcoin" class="btc-icon">
              {{ environmentContext.getBtcTicker() }}
            </v-chip>
          </template>
          <template #append-inner>
            <div class="d-flex px-2 ga-1">
              <v-chip variant="outlined" density="compact" @click="setMin">
                {{ boundaries.minValue.toBTCString().slice(0,5) }} MIN
              </v-chip>
              <v-chip variant="outlined" density="compact" @click="setMax">
                {{ boundaries.maxValue.toBTCString().slice(0,5) }} MAX
              </v-chip>
            </div>
          </template>
        </v-text-field>
      </v-col>
      <v-icon class="mx-2" :icon="mdiArrowRight" color="bw-600" />
    <v-col>
      <div class="d-flex justify-space-between align-center flex-grow-1
        bg-surface pa-3 rounded-lg border">
      <div class="d-flex ga-2 align-center">
        <v-chip class="pl-2 pr-3">
          <v-avatar class="mr-2 rbtc-icon">
            <v-img :src="require('@/assets/exchange/rbtc.png')" />
          </v-avatar>
          {{ environmentContext.getRbtcTicker() }}
        </v-chip>
        <span class="text-h4">
          {{ bitcoinAmount }}
        </span>
      </div>
    </div>
    </v-col>
  </v-row>
  <v-row class="my-0" v-if="stepState === 'error'">
    <v-col cols="6" align-self="start">
      <v-alert :text="amountErrorMessage" class="pa-2"
          type="warning" color="alert">
        </v-alert>
    </v-col>
  </v-row>
</template>

<script lang="ts">
import {
  computed, ref, watch, defineComponent,
} from 'vue';
import { mdiArrowRight, mdiBitcoin } from '@mdi/js';
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
  setup(props, context) {
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

    const boundaries = computed(() => {
      const minValue: SatoshiBig = new SatoshiBig(peginConfiguration.value.minValue, 'satoshi');
      const maxValue: SatoshiBig = new SatoshiBig(peginConfiguration.value.maxValue, 'satoshi');
      return {
        minValue,
        maxValue,
      };
    });

    const amountErrorMessage = computed(() => { // mayor rework
      const feePlusAmount: SatoshiBig = safeAmount.value.plus(safeTxFee.value);
      const { minValue, maxValue } = boundaries.value;
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
      const { minValue, maxValue } = boundaries.value;
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
      if (e.key === 'ArrowUp') e.preventDefault();
      if (e.key === 'ArrowDown') e.preventDefault();
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
      const maxAvailable = selectedAccountBalance.value
        .cmp(boundaries.value.maxValue.plus(safeTxFee.value)) === -1
        ? selectedAccountBalance.value : boundaries.value.maxValue;
      const tempValue = maxAvailable.minus(safeTxFee.value);
      bitcoinAmount.value = tempValue.toBTCTrimmedString();
      setBtcAmount(tempValue);
      setIsValidAmount(selectedAccountBalance.value.gt('0'));
    }

    function setMin() {
      const tempValue = new SatoshiBig(peginConfiguration.value.minValue, 'satoshi');
      bitcoinAmount.value = tempValue.toBTCTrimmedString();
      setBtcAmount(tempValue);
      setIsValidAmount(true);
      updateStore();
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
      setMin,
      mdiBitcoin,
      boundaries,
    };
  },
});
</script>
