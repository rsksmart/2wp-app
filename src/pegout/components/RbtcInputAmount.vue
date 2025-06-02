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
            <v-chip variant="outlined" density="compact" @click="setMax">
              MAX
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
import { EnvironmentAccessorService } from '@/common/services/enviroment-accessor.service';
import * as constants from '@/common/store/constants';
import {
  isRBTCAmountValidRegex,
  toWeiBigIntString,
} from '@/common/utils';
import {
  PegoutConfiguration, SatoshiBig, SessionState, WeiBig, LiquidityProvider2WP,
} from '@/common/types';
import {
  useAction, useGetter, useState, useStateAttribute,
} from '@/common/store/helper';
import { ApiService } from '@/common/services';

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
    const web3SessionState = useState<SessionState>('web3Session');
    const setRbtcAmount = useAction('flyoverPegout', constants.FLYOVER_PEGOUT_ADD_AMOUNT);
    const addAmount = useAction('pegOutTx', constants.PEGOUT_TX_ADD_AMOUNT);
    const calculateFee = useAction('pegOutTx', constants.PEGOUT_TX_CALCULATE_FEE);
    const estimatedBtcToReceive = useGetter<SatoshiBig>('pegOutTx', constants.PEGOUT_TX_GET_ESTIMATED_BTC_TO_RECEIVE);
    const pegoutConfiguration = useStateAttribute<PegoutConfiguration>('pegOutTx', 'pegoutConfiguration');
    const account = useStateAttribute<string>('web3Session', 'account');
    const minStrVal = computed(() => pegoutConfiguration.value.minValue.toRBTCString().slice(0, 5));
    const isComposing = ref(false);
    const liquidityProviders = useStateAttribute<LiquidityProvider2WP[]>('flyoverPegout', 'liquidityProviders');

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

    async function getFlyoverMaxBalanceMinusFeesBigIntString(
      provider: LiquidityProvider2WP | undefined,
    ) {
      // CALL FEE
      const callFee = provider?.pegin.fee || new WeiBig(0, 'wei');
      let bigIntCallFee = toWeiBigIntString(callFee.toRBTCString());
      if (bigIntCallFee === '0') bigIntCallFee = constants.BIGGEST_BIG_INT.toString();

      // GAS FEE
      const extraFeeMultiplier = new WeiBig('0.1', 'rbtc'); // set on LPS
      const minimumEstimatedConfirmations = 2; // set on LPS
      const { feeRate: fastestFeeRate } = await ApiService
        .estimateFee(minimumEstimatedConfirmations).catch(() => ({ feeRate: '0.00001' }));
      const feeRateWeiBig = new WeiBig(
        toWeiBigIntString(fastestFeeRate.toString()),
        'wei',
      );
      const gasFee = feeRateWeiBig.plus((feeRateWeiBig.mul(extraFeeMultiplier)).div(1e18));
      const flyoverFees = callFee.plus(gasFee);

      const { balance } = web3SessionState.value;
      const balanceMinusFlyoverFees = balance.minus(flyoverFees);
      let bigIntBalanceMinusFlyoverFees = toWeiBigIntString(balanceMinusFlyoverFees?.toRBTCString() || '0');
      if (bigIntBalanceMinusFlyoverFees === '0') bigIntBalanceMinusFlyoverFees = constants.BIGGEST_BIG_INT.toString();

      return bigIntBalanceMinusFlyoverFees;
    }

    async function getMaxFlyover() {
      const { flyoverProviderId: lpId } = EnvironmentAccessorService.getEnvironmentVariables();

      const provider = liquidityProviders.value.find((p) => p.id === lpId);

      const availableLiquidity = provider?.pegout.availableLiquidity || new WeiBig(0, 'wei');
      let bigIntAvailableLiquidity = toWeiBigIntString(availableLiquidity?.toRBTCString() || '0');
      if (bigIntAvailableLiquidity === '0') bigIntAvailableLiquidity = constants.BIGGEST_BIG_INT.toString();

      const maxTransactionValue = provider?.pegout.maxTransactionValue || new WeiBig(0, 'wei');
      let bigIntMaxTransactionValue = toWeiBigIntString(maxTransactionValue?.toRBTCString());
      if (bigIntMaxTransactionValue === '0') bigIntMaxTransactionValue = constants.BIGGEST_BIG_INT.toString();

      const bigIntFlyoverMaxBalanceMinusFees = await getFlyoverMaxBalanceMinusFeesBigIntString(
        provider,
      );

      return [
        BigInt(bigIntAvailableLiquidity),
        BigInt(bigIntMaxTransactionValue),
        BigInt(bigIntFlyoverMaxBalanceMinusFees),
      ].reduce((min, current) => (current < min ? current : min));
    }

    async function getMaxNative() {
      const { balance } = web3SessionState.value;
      let bigIntUserBalance = toWeiBigIntString(balance.toRBTCString());
      if (bigIntUserBalance === '0') bigIntUserBalance = constants.BIGGEST_BIG_INT.toString();

      return BigInt(bigIntUserBalance);
    }

    async function setMax() {
      const maxValue = props.flyoverAvailable ? await getMaxFlyover() : await getMaxNative();

      rbtcAmountModel.value = new WeiBig(maxValue, 'wei').toRBTCTrimmedString();
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
    };
  },
});
</script>
