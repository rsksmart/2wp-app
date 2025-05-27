<template>
  <v-row no-gutters class="d-flex flex-column pa-0">
    <span class="text-body-sm mb-2">
      Amount to send
    </span>
    <v-text-field
      hide-details
      hide-spin-buttons
      flat
      variant="solo"
      density="comfortable"
      rounded="lg"
      :class="(!isValidAmount && isInputFilled) && 'input-error'"
      class="text-h4 flex-grow-0 amount-input"
      v-model="bitcoinAmountModel"
      type="text"
      :readonly="isComposing"
      @compositionstart="isComposing = true"
      @keydown="blockLetterKeyDown"
      @wheel.prevent
      @focus="focus = true"
      @blur="focus = false">
        <template #prepend-inner>
          <v-icon density="comfortable" :icon="mdiBitcoin" color="orange"
            class="ml-n1 opacity-100" />
        </template>
        <template #append-inner>
          <span class="text-bw-500">{{ environmentContext.getBtcTicker() }}</span>
          <div class="d-flex pl-2 ga-1">
            <v-chip variant="outlined" density="compact" @click="setMin">
              {{ boundaries.minValue.toBTCString().slice(0,5) }} MIN
            </v-chip>
            <v-chip variant="outlined" density="compact" @click="setMax">
              MAX
            </v-chip>
          </div>
        </template>
    </v-text-field>
    <div>
      <v-alert v-if="!isValidAmount && isInputFilled" :text="amountErrorMessage"
        density="compact" type="warning" color="orange"/>
    </div>
  </v-row>
</template>

<script lang="ts">
import EnvironmentContextProviderService from '@/common/providers/EnvironmentContextProvider';
import { EnvironmentAccessorService } from '@/common/services/enviroment-accessor.service';
import {
  computed, defineComponent, ref, watch,
} from 'vue';
import SatoshiBig from '@/common/types/SatoshiBig';
import {
  PeginConfiguration,
  LiquidityProvider2WP,
  WeiBig,
} from '@/common/types';
import { useAction, useGetter, useStateAttribute } from '@/common/store/helper';
import { mdiBitcoin } from '@mdi/js';
import * as constants from '@/common/store/constants';
import {
  isBTCAmountValidRegex,
  toWeiBigIntString,
  generateMockRSKAddress,
  getBridgeLockingCap,
  bigIntToUserFormattedWei,
} from '@/common/utils';

export default defineComponent({
  name: 'BtcInput',
  setup(props, context) {
    const environmentContext = EnvironmentContextProviderService.getEnvironmentContext();
    const peginConfiguration = useStateAttribute<PeginConfiguration>('pegInTx', 'peginConfiguration');
    const liquidityProviders = useStateAttribute<LiquidityProvider2WP[]>('flyoverPegin', 'liquidityProviders');
    const flyoverEstimateGasFee = useAction('flyoverPegin', constants.FLYOVER_PEGIN_ESTIMATE_QUOTE_FEE);
    const account = useGetter<string>('web3Session', constants.SESSION_GET_CHECKSUMMED_ACCOUNT);
    const calculateMaxFee = useAction('pegInTx', constants.PEGIN_CALCULATE_MAX_FEE);

    const boundaries = computed(() => {
      const minValue: SatoshiBig = new SatoshiBig(peginConfiguration.value.minValue, 'btc');
      return {
        minValue,
      };
    });
    const isComposing = ref(false);
    watch(isComposing, () => {
      const timeout = setTimeout(() => { isComposing.value = false; }, 200);
      return () => clearTimeout(timeout);
    });

    const bitcoinAmount = ref('');
    function blockLetterKeyDown(e: KeyboardEvent) {
      const allowedKeys = ['Backspace', 'Delete', 'Home', 'End', 'ArrowRight', 'ArrowLeft'];
      if (allowedKeys.includes(e.key)) return;
      if (e.key === '.' && (bitcoinAmount.value && !bitcoinAmount.value.includes('.'))) return;
      const decimals = bitcoinAmount.value.split('.').pop() ?? '';
      if (decimals.length >= 8 || Number.isNaN(Number(e.key)) || e.key === ' ') {
        e.preventDefault();
      }
    }

    const setBtcAmountPeginTx = useAction('pegInTx', constants.PEGIN_TX_ADD_AMOUNT_TO_TRANSFER);
    const setBtcAmountFlyover = useAction('flyoverPegin', constants.FLYOVER_PEGIN_ADD_AMOUNT);

    function setBtcAmount(amount: SatoshiBig) {
      setBtcAmountPeginTx(amount);
      setBtcAmountFlyover(amount);
    }

    const safeTxFee = useGetter<SatoshiBig>('pegInTx', constants.PEGIN_TX_GET_SAFE_TX_FEE);
    const safeAmount = useStateAttribute<SatoshiBig>('pegInTx', 'amountToTransfer');
    const selectedAccountBalance = useGetter<SatoshiBig>('pegInTx', constants.PEGIN_TX_GET_SELECTED_BALANCE);

    const insufficientAmount = computed(() => {
      const feePlusAmount: SatoshiBig = safeAmount.value.plus(safeTxFee.value);
      const { minValue } = boundaries.value;
      if (safeAmount.value.lte('0')
        || safeAmount.value.lt(minValue)
        || feePlusAmount.gt(selectedAccountBalance.value)) {
        return true;
      }
      if (safeAmount.value.gt('0') && feePlusAmount.lte(selectedAccountBalance.value)) {
        return false;
      }
      return false;
    });

    const amountErrorMessage = computed(() => {
      const { minValue } = boundaries.value;
      if (safeAmount.value.lt(minValue)) {
        return `The minimum accepted value is ${minValue.toBTCTrimmedString()} ${environmentContext.getBtcTicker()}`;
      }
      const feePlusAmount: SatoshiBig = safeAmount.value.plus(safeTxFee.value);
      if (feePlusAmount.gte(selectedAccountBalance.value)) {
        return 'You don\'t have the balance for this amount';
      }
      if (isBTCAmountValidRegex(bitcoinAmount.value)) {
        return 'The amount must be a valid Bitcoin value';
      }
      return '';
    });

    const isInputFilled = computed(() => bitcoinAmount.value !== '');
    const isValidAmount = computed(() => !insufficientAmount.value
      && isBTCAmountValidRegex(bitcoinAmount.value));

    function emitIsValidAmount() {
      const amount = new SatoshiBig(Number(bitcoinAmount.value), 'btc');
      setBtcAmount(amount);
      context.emit('validAmount', isValidAmount.value, bitcoinAmount.value);
    }

    const timeOutId = ref(0);
    const bitcoinAmountModel = computed({
      get() {
        return bitcoinAmount.value;
      },
      set(amount: string) {
        window.clearTimeout(timeOutId.value);
        bitcoinAmount.value = amount;
        timeOutId.value = window.setTimeout(emitIsValidAmount, 300);
      },
    });

    function setMin() {
      const { minValue } = boundaries.value;
      bitcoinAmountModel.value = minValue.toBTCTrimmedString();
    }

    async function getFlyoverMaxBalanceMinusFeesBigIntString(
      provider: LiquidityProvider2WP | undefined,
      maxTransactionValue: WeiBig,
      accountBalance: WeiBig,
    ) {
      const callFee = provider?.pegin.fee || new WeiBig(0, 'wei');
      let bigIntCallFee = toWeiBigIntString(callFee.toRBTCString());
      if (bigIntCallFee === '0') bigIntCallFee = constants.BIGGEST_BIG_INT.toString();
      const maximumGasFee = await flyoverEstimateGasFee({
        maxFlyoverTxValue: maxTransactionValue,
        callEoaOrContractAddress: account.value || generateMockRSKAddress(),
      }) as WeiBig;
      let bigIntGasFee = toWeiBigIntString(maximumGasFee.toRBTCString());
      if (bigIntGasFee === '0') bigIntGasFee = constants.BIGGEST_BIG_INT.toString();
      const fullFee = callFee.plus(maximumGasFee);

      const balanceMinusFlyoverFees = accountBalance.minus(fullFee);
      let bigIntBalanceMinusFlyoverFees = toWeiBigIntString(balanceMinusFlyoverFees.toRBTCString());
      if (bigIntBalanceMinusFlyoverFees === '0') bigIntBalanceMinusFlyoverFees = constants.BIGGEST_BIG_INT.toString();

      return bigIntBalanceMinusFlyoverFees;
    }

    async function getMaxFlyover() {
      const lpId = EnvironmentAccessorService.getEnvironmentVariables().flyoverProviderId;

      const provider = liquidityProviders.value.find((p) => p.id === lpId);
      const availableLiquidity = provider?.pegin.availableLiquidity || new WeiBig(0, 'wei');
      const maxTransactionValue = provider?.pegin.maxTransactionValue || new WeiBig(0, 'wei');

      let bigIntAvailableLiquidity = toWeiBigIntString(availableLiquidity?.toRBTCString() || '0');
      if (bigIntAvailableLiquidity === '0') bigIntAvailableLiquidity = constants.BIGGEST_BIG_INT.toString();

      let bigIntMaxTransactionValue = toWeiBigIntString(maxTransactionValue?.toRBTCString());
      if (bigIntMaxTransactionValue === '0') bigIntMaxTransactionValue = constants.BIGGEST_BIG_INT.toString();

      const accountBalance = new WeiBig(toWeiBigIntString(selectedAccountBalance.value.toBTCString()), 'wei');
      let bigIntUserBalance = toWeiBigIntString(accountBalance.toRBTCString());
      if (bigIntUserBalance === '0') bigIntUserBalance = constants.BIGGEST_BIG_INT.toString();

      const bigIntBalanceMinusFlyoverFees = await getFlyoverMaxBalanceMinusFeesBigIntString(
        provider,
        maxTransactionValue,
        accountBalance,
      );
      return [
        BigInt(bigIntAvailableLiquidity),
        BigInt(bigIntMaxTransactionValue),
        BigInt(bigIntBalanceMinusFlyoverFees),
      ].reduce((min, current) => (current < min ? current : min));
    }

    async function getNativeMaxBalanceMinusFeesBigIntString() {
      const maxFee = await calculateMaxFee().catch(() => new SatoshiBig(0, 'satoshi')) as SatoshiBig;
      const balanceMinusNativeFee = selectedAccountBalance.value.minus(maxFee);
      let bigIntBalanceMinusNativeFee = toWeiBigIntString(balanceMinusNativeFee.toBTCString());
      if (bigIntBalanceMinusNativeFee === '0') bigIntBalanceMinusNativeFee = constants.BIGGEST_BIG_INT.toString();
      return bigIntBalanceMinusNativeFee;
    }

    async function getMaxNative() {
      const bridgeLockingCap = await getBridgeLockingCap().catch(() => new WeiBig(0, 'wei'));
      let bigIntBridgeLockingCap = toWeiBigIntString(bridgeLockingCap.toRBTCString());
      if (bigIntBridgeLockingCap === '0') bigIntBridgeLockingCap = constants.BIGGEST_BIG_INT.toString();

      const bigIntBalanceMinusNativeFee = await getNativeMaxBalanceMinusFeesBigIntString();
      return [
        BigInt(bigIntBridgeLockingCap),
        BigInt(bigIntBalanceMinusNativeFee),
      ].reduce((min, current) => (current < min ? current : min));
    }

    async function setMax() {
      const maxValue = [await getMaxFlyover(), await getMaxNative()]
        .reduce((max, current) => (current > max ? current : max));

      const satoshiMaxValue = new SatoshiBig(
        bigIntToUserFormattedWei(maxValue.toString()),
        'btc',
      );
      bitcoinAmountModel.value = satoshiMaxValue.toBTCTrimmedString();
    }

    watch(selectedAccountBalance, () => {
      emitIsValidAmount();
    });

    return {
      environmentContext,
      boundaries,
      mdiBitcoin,
      isComposing,
      blockLetterKeyDown,
      bitcoinAmountModel,
      isValidAmount,
      isInputFilled,
      amountErrorMessage,
      setMin,
      setMax,
    };
  },
});
</script>
