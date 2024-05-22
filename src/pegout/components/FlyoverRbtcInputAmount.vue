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
        :class="stepState === 'error' && 'input-error'"
        class="text-h4"
        v-model="rbtcAmount"
        type="number"
        step="0.00000001"
        @keydown="blockLetterKeyDown"
        @focus="focus = true"
        @blur="focus = false"
        @update:modelValue="updateStore()">
          <template #prepend-inner>
            <v-chip :prepend-icon="mdiBitcoin" class="btc-icon">
              {{ environmentContext.getRbtcTicker() }}
            </v-chip>
          </template>
          <template #append-inner>
            <div class="d-flex px-2 ga-1">
              <v-chip variant="outlined" density="compact" @click="setMin">
                MIN
              </v-chip>
              <v-chip variant="outlined" density="compact" @click="setMax">
                MAX
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
        <v-chip :prepend-icon="mdiBitcoin" class="btc-icon">
          {{ environmentContext.getBtcTicker() }}
        </v-chip>
        <span class="text-h4">
          {{ rbtcAmount }}
        </span>
      </div>
    </div>
    </v-col>
  </v-row>
  <v-row no-gutters>
    <v-col>
      <v-alert v-show="stepState === 'error'"
        variant="text" type="warning" density="compact" prominent
        class="text-body-1 pa-0 pt-2 input-error">
      <template #prepend>
        <v-icon :icon="mdiInformationOutline" size="small"/>
      </template>
      {{ amountErrorMessage }}
    </v-alert>
  </v-col>
  <v-spacer />
  </v-row>
  </template>

<script lang="ts">
import {
  computed, ref, watch, defineComponent,
} from 'vue';
import { mdiArrowRight, mdiBitcoin, mdiInformationOutline } from '@mdi/js';
import EnvironmentContextProviderService from '@/common/providers/EnvironmentContextProvider';
import * as constants from '@/common/store/constants';
import { isRBTCAmountValidRegex } from '@/common/utils';
import { SessionState, WeiBig } from '@/common/types';
import { useAction, useGetter, useState } from '@/common/store/helper';

export default defineComponent({
  name: 'FlyoverRbtcInputAmount',
  setup(_, context) {
    const environmentContext = EnvironmentContextProviderService.getEnvironmentContext();
    const focus = ref(false);
    const isMaxValueZero = ref(false);
    const rbtcAmount = ref('');
    const amountStyle = ref('');
    const stepState = ref<'unset' | 'valid' |'error'>('unset');

    const web3SessionState = useState<SessionState>('web3Session');
    const minMaxValues = useGetter<{minValue: WeiBig; maxValue: WeiBig}>('flyoverPegout', constants.FLYOVER_PEGOUT_GET_MIN_MAX_VALUES);
    const setRbtcAmount = useAction('flyoverPegout', constants.FLYOVER_PEGOUT_ADD_AMOUNT);
    const addAmount = useAction('pegOutTx', constants.PEGOUT_TX_ADD_AMOUNT);
    const calculateFee = useAction('pegOutTx', constants.PEGOUT_TX_CALCULATE_FEE);
    const clearQuotes = useAction('flyoverPegout', constants.FLYOVER_PEGOUT_CLEAR_QUOTES);
    const account = computed<string>(() => web3SessionState.value.account as string);

    const safeAmount = computed((): WeiBig => new WeiBig(rbtcAmount.value ?? '0', 'rbtc'));

    const amountErrorMessage = computed(() => {
      const { minValue, maxValue } = minMaxValues.value;
      const { balance } = web3SessionState.value;
      if (rbtcAmount.value.toString() === '') {
        return 'Please, enter an amount';
      }
      if (rbtcAmount.value.toString() === '0' && balance.lte('0')) {
        return 'Selected account has no balance';
      }
      if (rbtcAmount.value.toString() === '0') {
        return 'Please, enter an amount';
      }
      if (!isRBTCAmountValidRegex(rbtcAmount.value)) {
        return `The amount must be a valid ${environmentContext.getRbtcTicker()} value`;
      }
      if (safeAmount.value.gt(balance)) {
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
      const { minValue, maxValue } = minMaxValues.value;
      const { balance } = web3SessionState.value;
      return safeAmount.value.lte('0')
          || safeAmount.value.gt(balance)
          || safeAmount.value.lt(minValue)
          || safeAmount.value.gt(maxValue);
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
      clearQuotes();
      setRbtcAmount(new WeiBig(rbtcAmount.value, 'rbtc'));
      addAmount(new WeiBig(rbtcAmount.value, 'rbtc')).then(() => {
        calculateFee();
      });
    }

    function checkAmount() {
      if (!isWalletConnected.value) return;
      stepState.value = !insufficientAmount.value && isRBTCAmountValidRegex(rbtcAmount.value)
        ? 'valid' : 'error';
      amountStyle.value = stepState.value === 'valid' ? 'black-box' : 'yellow-box';
    }

    function clearStateWhenWalletIsDisconnected() {
      if (!isWalletConnected.value) {
        rbtcAmount.value = '';
        amountStyle.value = '';
        stepState.value = 'unset';
        isMaxValueZero.value = false;
        context.emit('walletDisconnected');
      }
    }

    watch(account, clearStateWhenWalletIsDisconnected);
    watch(rbtcAmount, checkAmount);

    function setMin() {
      // TODO: implement
      return 0;
    }
    function setMax() {
      // TODO: implement
      return 0;
    }

    return {
      amountStyle,
      isWalletConnected,
      rbtcAmount,
      focus,
      updateStore,
      blockLetterKeyDown,
      stepState,
      amountErrorMessage,
      mdiArrowRight,
      environmentContext,
      mdiInformationOutline,
      mdiBitcoin,
      setMin,
      setMax,
    };
  },
});
</script>
