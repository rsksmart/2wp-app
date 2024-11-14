<template>
  <v-row no-gutters>
    <span class="d-inline-block font-weight-bold my-3">
      Amount to send
    </span>
  </v-row>
  <v-row no-gutters align="center">
    <v-text-field
      hide-details
      hide-spin-buttons
      flat
      variant="solo"
      density="comfortable"
      rounded="lg"
      :class="stepState === 'error' && 'input-error'"
      class="text-h4 amount-input"
      v-model="rbtcAmountModel"
      type="text"
      :readonly="isComposing"
      @compositionstart="isComposing = true"
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
          </div>
        </template>
    </v-text-field>
  </v-row>
  <v-row class="my-0" v-if="stepState === 'error'">
    <v-col cols="6" align-self="start">
      <v-alert :text="amountErrorMessage" class="pa-2 mr-2"
          type="warning" color="orange">
        </v-alert>
    </v-col>
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
  name: 'RbtcInputAmount',
  emits: ['get-quotes'],
  props: {
    clear: {
      type: Boolean,
      required: false,
    },
  },
  setup(props, context) {
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
    const pegoutConfiguration = useStateAttribute<PegoutConfiguration>('pegOutTx', 'pegoutConfiguration');
    const account = useStateAttribute<string>('web3Session', 'account');
    const minStrVal = computed(() => pegoutConfiguration.value.minValue.toRBTCString().slice(0, 5));
    const isComposing = ref(false);

    const isValidAmount = (amount: WeiBig) => {
      const { minValue } = pegoutConfiguration.value;
      const { balance } = web3SessionState.value;
      return isRBTCAmountValidRegex(amount.toRBTCString())
        && amount.gte(minValue)
        && amount.lte(balance);
    };

    const rbtcAmountModel = computed({
      get() {
        return rbtcAmount.value;
      },
      set(amount: string) {
        rbtcAmount.value = amount;
        const weiBigAmount = new WeiBig(amount, 'rbtc');
        if (isValidAmount(weiBigAmount) && weiBigAmount.gt('0')) {
          setRbtcAmount(weiBigAmount);
          addAmount(weiBigAmount)
            .then(() => calculateFee());
          context.emit('get-quotes');
        }
      },
    });

    const safeAmount = computed((): WeiBig => new WeiBig(rbtcAmount.value ?? '0', 'rbtc'));

    const amountErrorMessage = computed(() => {
      const { minValue } = pegoutConfiguration.value;
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
      return '';
    });

    const insufficientAmount = computed(() => {
      const { minValue } = pegoutConfiguration.value;
      const { balance } = web3SessionState.value;
      return safeAmount.value.lte('0')
        || safeAmount.value.gt(balance)
        || safeAmount.value.lt(minValue);
    });

    function blockLetterKeyDown(e: KeyboardEvent) {
      const allowedKeys = ['Backspace', 'Delete', 'Home', 'End', 'ArrowRight', 'ArrowLeft'];
      if (allowedKeys.includes(e.key)) return;
      if (e.key === '.' && (rbtcAmount.value && !rbtcAmount.value.includes('.'))) return;
      const decimals = rbtcAmount.value.split('.').pop() ?? '';
      if (decimals.length >= 18 || Number.isNaN(Number(e.key)) || e.key === ' ') {
        e.preventDefault();
      }
    }

    watch(isComposing, () => {
      const timeout = setTimeout(() => { isComposing.value = false; }, 200);
      return () => clearTimeout(timeout);
    });

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

    function clearInput() {
      rbtcAmountModel.value = '';
      stepState.value = 'unset';
    }

    watch(account, clearInput);
    watch(() => props.clear, (flag) => {
      if (flag) clearInput();
    });

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
      estimatedBtcToReceive,
      rbtcAmountModel,
      minStrVal,
      isComposing,
    };
  },
});
</script>
