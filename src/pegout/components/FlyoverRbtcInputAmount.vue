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
        v-model="rbtcAmountModel"
        type="number"
        step="0.00000001"
        @wheel.prevent
        @keydown="blockLetterKeyDown"
        @focus="focus = true"
        @blur="focus = false"
        >
          <template #prepend-inner>
            <v-chip class="pl-2 pr-3">
                <v-avatar class="mr-2 rbtc-icon">
                  <v-img :src="require('@/assets/exchange/rbtc.png')" />
                </v-avatar>
              {{ environmentContext.getRbtcTicker() }}
            </v-chip>
          </template>
          <template #append-inner>
            <div class="d-flex px-2 ga-1">
              <v-chip variant="outlined" density="compact" @click="setMin">
                {{ minStrVal }} MIN
              </v-chip>
              <v-chip variant="outlined" density="compact" @click="setMax">
                {{ maxStrVal }} MAX
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
          {{ stepState === 'valid' ? willReceive : '' }}
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
import {
  PegoutConfiguration, SatoshiBig, SessionState, WeiBig,
} from '@/common/types';
import {
  useAction, useGetter, useState, useStateAttribute,
} from '@/common/store/helper';

export default defineComponent({
  name: 'FlyoverRbtcInputAmount',
  props: {
    willReceive: {
      type: String,
      required: true,
    },
  },
  setup(_, context) {
    const environmentContext = EnvironmentContextProviderService.getEnvironmentContext();
    const focus = ref(false);
    const rbtcAmount = ref('');
    const amountStyle = ref('');
    const stepState = ref<'unset' | 'valid' |'error'>('unset');
    const web3SessionState = useState<SessionState>('web3Session');
    const setRbtcAmount = useAction('flyoverPegout', constants.FLYOVER_PEGOUT_ADD_AMOUNT);
    const addAmount = useAction('pegOutTx', constants.PEGOUT_TX_ADD_AMOUNT);
    const calculateFee = useAction('pegOutTx', constants.PEGOUT_TX_CALCULATE_FEE);
    const estimatedBtcToReceive = useGetter<SatoshiBig>('pegOutTx', constants.PEGOUT_TX_GET_ESTIMATED_BTC_TO_RECEIVE);
    const getRbtcGasFee = useGetter<Promise<WeiBig>>('web3Session', constants.SESSION_GET_RBTC_GAS_FEE);
    const pegoutConfiguration = useStateAttribute<PegoutConfiguration>('pegOutTx', 'pegoutConfiguration');
    const minStrVal = computed(() => pegoutConfiguration.value.minValue.toRBTCString().slice(0, 5));
    const maxStrVal = computed(() => pegoutConfiguration.value.maxValue.toRBTCString().slice(0, 5));

    const isValidAmount = (amount: WeiBig) => {
      const { minValue, maxValue } = pegoutConfiguration.value;
      const { balance } = web3SessionState.value;
      return isRBTCAmountValidRegex(amount.toRBTCString())
          && amount.gte(minValue)
          && amount.lte(balance)
          && amount.lte(maxValue);
    };

    const rbtcAmountModel = computed({
      get() {
        return rbtcAmount.value;
      },
      set(amount: string) {
        rbtcAmount.value = amount;
        const weiBigAmount = new WeiBig(amount, 'rbtc');
        if (isValidAmount(weiBigAmount)) {
          setRbtcAmount(weiBigAmount);
          addAmount(weiBigAmount)
            .then(() => calculateFee());
          context.emit('get-quotes');
        }
      },
    });

    const safeAmount = computed((): WeiBig => new WeiBig(rbtcAmount.value ?? '0', 'rbtc'));

    const amountErrorMessage = computed(() => {
      const { minValue, maxValue } = pegoutConfiguration.value;
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
        return `This value is below the minimum allowed value of ${minValue.toRBTCTrimmedString()} ${environmentContext.getRbtcTicker()}`;
      }
      if (safeAmount.value.gt(maxValue)) {
        return `This value is above the maximum allowed value of  ${maxValue.toRBTCTrimmedString()} ${environmentContext.getRbtcTicker()}`;
      }
      return '';
    });

    const insufficientAmount = computed(() => {
      const { minValue, maxValue } = pegoutConfiguration.value;
      const { balance } = web3SessionState.value;
      return safeAmount.value.lte('0')
          || safeAmount.value.gt(balance)
          || safeAmount.value.lt(minValue)
          || safeAmount.value.gt(maxValue);
    });

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
      if (e.key === 'ArrowUp') e.preventDefault();
      if (e.key === 'ArrowDown') e.preventDefault();
    }

    function checkAmount() {
      stepState.value = !insufficientAmount.value && isRBTCAmountValidRegex(rbtcAmount.value)
        ? 'valid' : 'error';
    }

    watch(rbtcAmountModel, checkAmount);

    function setMin() {
      const { minValue } = pegoutConfiguration.value;
      const { balance } = web3SessionState.value;
      if (balance.lt(minValue)) {
        rbtcAmountModel.value = balance.toRBTCTrimmedString();
      } else {
        rbtcAmountModel.value = minValue.toRBTCTrimmedString();
      }
    }

    async function setMax() {
      const { maxValue } = pegoutConfiguration.value;
      const { balance } = web3SessionState.value;
      const minFee = await getRbtcGasFee.value;
      if (balance.lt(maxValue)) {
        rbtcAmountModel.value = balance.minus(minFee).toRBTCTrimmedString();
      } else {
        rbtcAmountModel.value = maxValue.toRBTCTrimmedString();
      }
    }

    return {
      amountStyle,
      rbtcAmount,
      focus,
      blockLetterKeyDown,
      stepState,
      amountErrorMessage,
      mdiArrowRight,
      environmentContext,
      mdiInformationOutline,
      mdiBitcoin,
      setMin,
      setMax,
      estimatedBtcToReceive,
      rbtcAmountModel,
      minStrVal,
      maxStrVal,
    };
  },
});
</script>
