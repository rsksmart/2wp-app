<template>
  <v-row no-gutters class="btc-fee-select">
    <v-col class="pa-0">
      <span class="d-inline-block">
        Select transaction fee
      </span>
      <v-row class="ma-0 d-flex justify-start">
        <v-col class="pa-0">
          <v-row class="ma-0 pa-0">
            <v-slider v-model="txFeeIndex" :ticks="transactionFees" max="2"
                      track-size="2"
                      thumb-size="12"
                      show-ticks="always"
                      :color="txFeeColor" :track-color="txFeeColor" step="1"
                      @update:focused="focus = !focus"
                      @blur="focus = false"
                      class="ma-0 label" />
          </v-row>
          <v-row class="ma-0">
            <v-col cols="4" class="d-flex justify-start pa-0">
                    <span class="text-left">{{ slowFee }}
                    {{environmentContext.getBtcTicker()}}</span>
            </v-col>
            <v-col cols="4" class="d-flex justify-center pa-0">
                    <span class="text-center">{{ averageFee }}
                    {{environmentContext.getBtcTicker()}}</span>
            </v-col>
            <v-col cols="4" class="d-flex justify-end pa-0">
                    <span class="text-right">{{ fastFee }}
                    {{environmentContext.getBtcTicker()}}</span>
            </v-col>
          </v-row>
          <v-row class="ma-0">
            <v-col cols="4" class="d-flex justify-start pa-0">
              <span class="boldie text-left">USD {{ slowFeeUSD }}</span>
            </v-col>
            <v-col cols="4" class="d-flex justify-center pa-0">
              <span class="boldie text-center">USD {{ averageFeeUSD }}</span>
            </v-col>
            <v-col cols="4" class="d-flex justify-end pa-0">
              <span class="boldie text-right">USD {{ fastFeeUSD }}</span>
            </v-col>
          </v-row>
        </v-col>
      </v-row>
      <v-row v-if="showErrorMessage" class="ma-0 d-flex justify-start">
        <span class="message-error-fee">
          You don't have the balance for this fee + amount
        </span>
      </v-row>
    </v-col>
  </v-row>
</template>

<script lang="ts">
import {
  computed, onBeforeMount, ref, defineComponent, watch,
} from 'vue';
import * as constants from '@/common/store/constants';
import { MiningSpeedFee } from '@/common/types/pegInTx';
import EnvironmentContextProviderService from '@/common/providers/EnvironmentContextProvider';
import { FeeAmountData } from '@/common/types';
import { useAction, useGetter, useStateAttribute } from '@/common/store/helper';

export default defineComponent({
  name: 'BtcFeeSelect',
  setup() {
    const environmentContext = EnvironmentContextProviderService.getEnvironmentContext();
    const focus = ref(false);
    const hasChange = ref(false);
    const txFeeIndex = ref(1);
    const fixedUSDDecimals = 2;
    const transactionFees = { 0: 'Slow', 1: 'Average', 2: 'Fast' };

    const bitcoinPrice = useStateAttribute<number>('web3Session', 'bitcoinPrice');
    const account = useStateAttribute<string>('web3Session', 'account');
    const calculatedFees = useStateAttribute<FeeAmountData>('pegInTx', 'calculatedFees');
    const selectedFee = useStateAttribute<MiningSpeedFee>('pegInTx', 'selectedFee');
    const isEnoughBalance = useGetter<boolean>('pegInTx', constants.PEGIN_TX_IS_ENOUGH_BALANCE);
    const setSelectedFee = useAction('pegInTx', constants.PEGIN_TX_SELECT_FEE_LEVEL);

    const txFeeColor = computed(() => {
      let color;
      if (txFeeIndex.value === 0) color = '#F6C61B';
      if (txFeeIndex.value === 1) color = '#737778';
      if (txFeeIndex.value === 2) color = '#00B43C';
      return color;
    });

    const slowFee = computed(() => calculatedFees.value.slow.amount.toBTCString());

    const slowFeeUSD = computed(() => calculatedFees.value.slow
      .amount.toUSDFromBTCString(bitcoinPrice.value, fixedUSDDecimals));

    const averageFee = computed(() => calculatedFees.value.average.amount.toBTCString());

    const averageFeeUSD = computed(() => calculatedFees.value.average
      .amount.toUSDFromBTCString(bitcoinPrice.value, fixedUSDDecimals));

    const fastFee = computed(() => calculatedFees.value.fast.amount.toBTCString());

    const fastFeeUSD = computed(() => calculatedFees.value.fast
      .amount.toUSDFromBTCString(bitcoinPrice.value, fixedUSDDecimals));

    const showErrorMessage = computed(() => !isEnoughBalance.value
        && !account.value
        && hasChange.value);

    function updateStore() {
      let userSelectedFee: MiningSpeedFee;
      hasChange.value = true;
      switch (txFeeIndex.value) {
        case 0:
          userSelectedFee = constants.BITCOIN_SLOW_FEE_LEVEL;
          break;
        case 1:
          userSelectedFee = constants.BITCOIN_AVERAGE_FEE_LEVEL;
          break;
        case 2:
          userSelectedFee = constants.BITCOIN_FAST_FEE_LEVEL;
          break;
        default:
          userSelectedFee = constants.BITCOIN_AVERAGE_FEE_LEVEL;
          break;
      }
      setSelectedFee(userSelectedFee);
    }

    watch(() => txFeeIndex.value, updateStore);

    onBeforeMount(() => {
      let selectedFeeIdx = 1;
      if (selectedFee.value) {
        switch (selectedFee.value) {
          case constants.BITCOIN_SLOW_FEE_LEVEL:
            selectedFeeIdx = 0;
            break;
          case constants.BITCOIN_FAST_FEE_LEVEL:
            selectedFeeIdx = 2;
            break;
          default:
            selectedFeeIdx = 1;
            break;
        }
      }
      txFeeIndex.value = selectedFeeIdx;
    });

    return {
      txFeeColor,
      txFeeIndex,
      transactionFees,
      updateStore,
      focus,
      environmentContext,
      slowFee,
      averageFee,
      fastFee,
      slowFeeUSD,
      averageFeeUSD,
      fastFeeUSD,
      showErrorMessage,
    };
  },
});
</script>

<style scoped>
.btc-fee-select {
  font-size: 12px;
  line-height: 120%;
  letter-spacing: 0%;
  font-weight: 500;
  .label {
    font-weight: 400;
    font-size: 14px;
    line-height: 100%;
    letter-spacing: 0.2px;
  }
}
</style>
