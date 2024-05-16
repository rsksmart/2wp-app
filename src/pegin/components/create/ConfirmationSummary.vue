<template>
    <v-row>
      <span class="font-weight-bold mt-4 mb-2">Summary</span>
    </v-row>
    <v-row class="rounded-lg py-8 px-4 border-md">
      <v-col cols="6" class="d-flex flex-column ga-4 pr-6">
        <div class="pb-4">
          <h3 class="text-h3 pa-1 pb-2 bg-orange d-inline-block">
            {{ environmentContext.getBtcTicker() }}
          </h3>
        </div>
        <div v-for="({title, value}) in confirmationBTCSummary" :key="title"
          class="d-flex flex-column ga-1">
          <span>{{ title }}</span>
          <div class="d-flex align-center justify-space-between bg-surface py-2 px-4
            rounded-lg border">
            <span class="text-h4">{{ value }}</span>
            <v-chip :prepend-icon="mdiBitcoin" class="btc-icon">
              {{ environmentContext.getBtcTicker() }}
            </v-chip>
          </div>
        </div>
      </v-col>
      <div>
        <v-divider vertical class="border-opacity-50" />
      </div>
      <v-col cols="6" class="d-flex flex-column ga-4 pl-6">
        <div class="pb-4">
          <h3 class="text-h3 pa-1 pb-2 bg-green d-inline-block">
            {{ environmentContext.getRbtcTicker() }}
          </h3>
        </div>
        <div v-for="({title, value}) in confirmationRBTCSummary" :key="title"
          class="d-flex flex-column ga-1">
          <span>{{ title }}</span>
          <div class="d-flex align-center justify-space-between bg-surface py-2 px-4
            rounded-lg border">
            <span class="text-h4">{{ value }}</span>
            <v-chip :prepend-icon="mdiBitcoin" class="btc-icon">
              {{ environmentContext.getRbtcTicker() }}
            </v-chip>
          </div>
        </div>
      </v-col>
    </v-row>
</template>

<script lang="ts">
import { computed, defineComponent } from 'vue';
import { mdiBitcoin, mdiArrowRight, mdiArrowLeft } from '@mdi/js';
import { truncateString } from '@/common/utils';
import { useGetter, useState, useStateAttribute } from '@/common/store/helper';
import { PegInTxState, SatoshiBig } from '@/common/types';
import * as constants from '@/common/store/constants';
import EnvironmentContextProviderService from '@/common/providers/EnvironmentContextProvider';

export default defineComponent({
  name: 'ConfirmationSummary',
  setup() {
    const pegInTxState = useState<PegInTxState>('pegInTx');
    const safeFee = useGetter<SatoshiBig>('pegInTx', constants.PEGIN_TX_GET_SAFE_TX_FEE);
    const account = useStateAttribute<string>('web3Session', 'account');
    const environmentContext = EnvironmentContextProviderService.getEnvironmentContext();

    const confirmationBTCSummary = computed(() => ([
      {
        title: 'Sender Address',
        value: '',
      },
      {
        title: 'You will send',
        value: pegInTxState.value.amountToTransfer.toBTCTrimmedString(),
      },
      {
        title: 'PowPeg Address',
        value: truncateString(pegInTxState.value.peginConfiguration.federationAddress),
      },
    ]));

    const confirmationRBTCSummary = computed(() => ([
      {
        title: 'Recipient Address',
        value: truncateString(pegInTxState.value.rskAddressSelected || account.value),
      },
      {
        title: 'You will receive',
        value: pegInTxState.value.amountToTransfer.toBTCTrimmedString(),
      },
      {
        title: 'Fee',
        value: safeFee.value.toBTCTrimmedString(),
      },
    ]));

    return {
      mdiBitcoin,
      mdiArrowRight,
      mdiArrowLeft,
      confirmationBTCSummary,
      confirmationRBTCSummary,
      environmentContext,
    };
  },
});
</script>
