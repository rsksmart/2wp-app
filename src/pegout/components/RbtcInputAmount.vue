<template>
  <v-row no-gutters class="d-flex flex-column pa-0">
    <span class="text-body-sm mb-2">
      Amount to send
    </span>
  </v-row>
  <v-row no-gutters>
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
      @blur="focus = false">
        <template #prepend-inner>
          <v-img :src="require('@/assets/exchange/rbtc_transparent.svg')"
            :width="25" :height="25" contain />
        </template>
        <template #append-inner>
          <span class="text-bw-500">{{ environmentContext.getRbtcTicker() }}</span>
          <div class="d-flex pl-2 ga-1">
            <v-chip variant="outlined" density="compact" @click="setMin">
              {{ minStrVal }} MIN
            </v-chip>
            <v-chip v-if="false" variant="outlined" density="compact" @click="setMax">
              <v-progress-circular v-if="loadingMax"
                :size="12"
                :width="2"
                color="warning"
                indeterminate />
              <span v-else>{{ maxValue === '0' ? '' : maxValue.slice(0,5) }}</span>
              <span class="ml-1">MAX</span>
            </v-chip>
          </div>
        </template>
    </v-text-field>
  </v-row>
  <v-row no-gutters class="mt-1" v-if="stepState === 'error'">
    <v-alert :text="amountErrorMessage" type="warning" color="orange" />
  </v-row>
</template>

<script lang="ts">
import {
  computed, ref, watch, defineComponent,
} from 'vue';
import { mdiArrowRight, mdiBitcoin, mdiInformationOutline } from '@mdi/js';
import EnvironmentContextProviderService from '@/common/providers/EnvironmentContextProvider';
import * as constants from '@/common/store/constants';
import {
  isRBTCAmountValidRegex,
} from '@/common/utils';
import {
  PegoutConfiguration, SatoshiBig, SessionState, WeiBig,
} from '@/common/types';
import {
  useAction, useGetter, useState, useStateAttribute,
} from '@/common/store/helper';

export default defineComponent({
  name: 'RbtcInputAmount',
  emits: ['valid-amount'],
  props: {
    clear: {
      type: Boolean,
      required: false,
    },
    flyoverAvailable: {
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
    const loadingMax = ref(false);
    const maxValue = ref('0');
    const web3SessionState = useState<SessionState>('web3Session');
    const setRbtcAmount = useAction('flyoverPegout', constants.FLYOVER_PEGOUT_ADD_AMOUNT);
    const addAmount = useAction('pegOutTx', constants.PEGOUT_TX_ADD_AMOUNT);
    const calculateFee = useAction('pegOutTx', constants.PEGOUT_TX_CALCULATE_FEE);
    const getMaxFlyover = useAction('flyoverPegout', constants.FLYOVER_PEGOUT_ESTIMATE_MAX_VALUE);
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

    function emitGetQuotes() {
      const weiBigAmount = new WeiBig(rbtcAmount.value, 'rbtc');
      setRbtcAmount(weiBigAmount);
      addAmount(weiBigAmount)
        .then(() => calculateFee());
      context.emit('valid-amount', isValidAmount(weiBigAmount), rbtcAmount.value);
    }

    const timeOutId = ref(0);
    const rbtcAmountModel = computed({
      get() {
        return rbtcAmount.value;
      },
      set(amount: string) {
        window.clearTimeout(timeOutId.value);
        rbtcAmount.value = amount;
        timeOutId.value = window.setTimeout(emitGetQuotes, 300);
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

    function getMaxNative() {
      const { balance } = web3SessionState.value;
      return balance ?? new WeiBig(0, 'wei');
    }

    function setMax() {
      loadingMax.value = true;
      let maxFlyover = new WeiBig(0, 'wei');

      if (props.flyoverAvailable) {
        getMaxFlyover()
          .then((maxFlyoverValue) => {
            maxFlyover = maxFlyoverValue as WeiBig;
            loadingMax.value = false;
          })
          .catch(() => { loadingMax.value = false; })
          .finally(() => {
            maxValue.value = maxFlyover.toRBTCTrimmedString();
            loadingMax.value = false;
            rbtcAmountModel.value = maxValue.value;
          });
      } else {
        maxValue.value = getMaxNative().toRBTCTrimmedString();
        loadingMax.value = false;
        rbtcAmountModel.value = maxValue.value;
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
      setMax,
      maxValue,
      loadingMax,
    };
  },
});
</script>
