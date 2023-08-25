<template>
  <div id="option-4" class="py-4">
    <v-row class="align-start mx-0">
      <v-col cols="auto" class="pl-0">
        <div v-bind:class="[focus ?
              'number-filled' : 'number']">4</div>
      </v-col>
      <v-col class="pl-0">
        <p v-bind:class="{'boldie' : focus}">
          Select transaction fee:
        </p>
        <v-row class="mx-0 mt-4 d-flex justify-start">
          <v-col cols="11 pa-0 pl-1">
            <v-row class="mx-0">
              <v-slider v-model="txFeeIndex" :tick-labels="transactionFees" :max="2"
                        :color="txFeeColor" :track-color="txFeeColor" step="1"
                        @focus="focus = true"
                        @blur="focus = false"
                        @change="updateStore"/>
            </v-row>
            <v-row class="mx-0">
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
            <v-row class="mx-0">
              <v-col cols="4" class="d-flex justify-start pa-0">
                <span class="boldie text-left">$ {{ slowFeeUSD }}</span>
              </v-col>
              <v-col cols="4" class="d-flex justify-center pa-0">
                <span class="boldie text-center">$ {{ averageFeeUSD }}</span>
              </v-col>
              <v-col cols="4" class="d-flex justify-end pa-0">
                <span class="boldie text-right">$ {{ fastFeeUSD }}</span>
              </v-col>
            </v-row>
          </v-col>
        </v-row>
        <v-row class="pl-1 mx-0 mt-1 d-flex justify-start" style="min-height: 17px;">
          <span v-if="showErrorMessage" class="message-error-fee">
            You don't have the balance for this fee + amount
          </span>
        </v-row>
      </v-col>
    </v-row>
  </div>
</template>

<script lang="ts">
import * as constants from '@/common/store/constants';
import { MiningSpeedFee } from '@/common/types/pegInTx';
import EnvironmentContextProviderService from '@/common/providers/EnvironmentContextProvider';
import { FeeAmountData } from '@/common/types';
import { computed, onBeforeMount, ref } from 'vue';
import { useAction, useGetter, useStateAttribute } from '@/common/store/helper';

export default {
  name: 'BtcFeeSelect',
  setup() {
    const environmentContext = EnvironmentContextProviderService.getEnvironmentContext();
    const focus = ref(false);
    const hasChange = ref(false);
    const txFeeIndex = ref(1);
    const fixedUSDDecimals = 2;
    const transactionFees = ['Slow', 'Average', 'Fast'];

    const bitcoinPrice  = useStateAttribute<number>('web3Session', 'bitcoinPrice');
    const account  = useStateAttribute<string>('web3Session', 'account');
    const calculatedFees  = useStateAttribute<FeeAmountData>('pegInTx', 'calculatedFees');
    const selectedFee  = useStateAttribute<MiningSpeedFee>('pegInTx', 'selectedFee');
    const isEnoughBalance = useGetter<Boolean>('pegInTx', constants.PEGIN_TX_IS_ENOUGH_BALANCE);
    const setSelectedFee = useAction('pegInTx', constants.PEGIN_TX_SELECT_FEE_LEVEL);

    const txFeeColor = computed(() => {
      let color;
      if (txFeeIndex.value === 0) color = '#F6C61B';
      if (txFeeIndex.value === 1) color = '#737778';
      if (txFeeIndex.value === 2) color = '#00B43C';
      return color;
    });

    const slowFee = computed(() => {
      return calculatedFees.value.slow.amount.toBTCString();
    });

    const slowFeeUSD = computed(() => {
      return calculatedFees.value.slow
        .amount.toUSDFromBTCString(bitcoinPrice.value, fixedUSDDecimals);
    });

    const averageFee = computed(() => {
      return calculatedFees.value.average.amount.toBTCString();
    });

    const averageFeeUSD = computed(() => {
      return calculatedFees.value.average
        .amount.toUSDFromBTCString(bitcoinPrice.value, fixedUSDDecimals);
    });

    const fastFee = computed(() => {
      return calculatedFees.value.fast.amount.toBTCString();
    });

    const fastFeeUSD = computed(() => {
      return calculatedFees.value.fast
        .amount.toUSDFromBTCString(bitcoinPrice.value, fixedUSDDecimals);
    });

    const showErrorMessage = computed(() => {
      return !isEnoughBalance.value
        && !account.value
        && hasChange.value;
    });

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

    onBeforeMount(() => {
      let selectedFeeIdx = 1;
      if (selectedFee) {
        switch (selectedFee) {
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
  }
}
</script>