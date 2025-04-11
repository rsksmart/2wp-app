<template>
  <v-card :ripple="false" :disabled="flyoverNotAvailable"
    @click="selectOption" rounded="lg" flat variant="outlined"
    :class="{
      'selected': selected,
      'not-available': flyoverNotAvailable,
    }"
    class="d-flex flex-column ga-4 pa-8 fill-height">
    <div v-if="flyoverNotAvailable"
      class="not-available-text d-flex align-center justify-center pa-8 text-center">
      <slot />
    </div>
    <v-row no-gutters class="my-2">
      <div class='text-h3'>
        <span :class='`pa-1 bg-${option.subtitleColor}`'>
          {{ option.title }}
        </span>
      </div>
    </v-row>
    <v-row no-gutters justify="space-between">
        <div class="d-flex align-center ga-1">
          <span class="text-balance">{{ option.label }}</span>
          <v-btn @click="openLink(option.link)" icon density="compact" size="small" variant="plain">
            <v-icon :icon="mdiOpenInNew"></v-icon>
          </v-btn>
        </div>
      <v-tooltip :text="tooltipText" location="top" max-width="200">
        <template v-slot:activator="{ props }">
            <div v-bind="props" class="d-flex align-center ga-1">
              <v-icon :icon="mdiClockOutline" :color="option.subtitleColor" size="20" />
              <span :class='`text-${option.subtitleColor}`'>{{ option.estimatedTime() }}</span>
            </div>
        </template>
      </v-tooltip>
    </v-row>
    <v-divider :color="option.subtitleColor" class="border-opacity-100" ></v-divider>
    <v-row>
      <v-col>
    <div class="d-flex flex-column">
      <span :class='`text-${option.subtitleColor}`'>Value to receive</span>
      <span class="text-bw-400">
        {{ option.valueToReceive()?.toBTCTrimmedString() }} {{ environmentContext.getRbtcTicker() }}
      </span>
      <span class="text-bw-400">USD {{ toUSD(option.valueToReceive()) }}</span>
    </div>
      </v-col>
      <v-col>
    <div class="d-flex flex-column">
      <span>Total Fee {{ optionType === 'POWPEG' ? '(Network)' : '(Network & Provider)' }}</span>
      <span class="text-bw-400">
        {{ option.totalFee()?.toBTCTrimmedString() }} {{ environmentContext.getBtcTicker() }}
      </span>
      <span class="text-bw-400">USD {{ toUSD(option.totalFee()) }}</span>
    </div>
      </v-col>
    </v-row>
    <v-spacer></v-spacer>
  </v-card>
</template>

<script lang="ts">
import {
  PropType,
  computed, defineComponent,
} from 'vue';
import * as constants from '@/common/store/constants';
import { mdiInformationOutline, mdiOpenInNew, mdiClockOutline } from '@mdi/js';
import { useGetter, useState, useStateAttribute } from '@/common/store/helper';
import { blockConfirmationsToTimeString, truncateString } from '@/common/utils';
import EnvironmentContextProviderService from '@/common/providers/EnvironmentContextProvider';
import { PeginQuote, PegInTxState, SatoshiBig } from '@/common/types';
import { PowPegMode } from '@/common/store/constants';

export default defineComponent({
  name: 'PeginOptionCard',
  props: {
    optionType: {
      type: String,
      required: true,
    },
    selected: {
      type: Boolean,
      default: false,
    },
    quote: {
      type: Object as PropType<PeginQuote>,
    },
    flyoverNotAvailable: {
      type: Boolean,
      default: false,
    },
  },
  setup(props, context) {
    const account = useStateAttribute<string>('web3Session', 'account');
    const rskAddress = computed(() => truncateString(account.value));
    const environmentContext = EnvironmentContextProviderService.getEnvironmentContext();
    const pegInTxState = useState<PegInTxState>('pegInTx');
    const selectedFee = useGetter<SatoshiBig>('pegInTx', constants.PEGIN_TX_GET_SAFE_TX_FEE);
    const bitcoinPrice = useStateAttribute<number>('pegInTx', 'bitcoinPrice');

    const fixedUSDDecimals = 2;
    const computedQuote = computed(() => props.quote);

    const quoteFee = computed(() => {
      if (!computedQuote.value) return new SatoshiBig('0', 'btc');
      return computedQuote.value.providerFee;
    });

    const PeginOptions = {
      POWPEG: {
        title: PowPegMode.NATIVE,
        label: 'Powered by PowPeg',
        subtitleColor: 'purple',
        link: 'https://dev.rootstock.io/rsk/architecture/powpeg/',
        estimatedTime: () => '17 hours',
        totalFee: () => selectedFee.value,
        amountToTransfer: () => pegInTxState.value.amountToTransfer
          .plus(selectedFee.value),
        valueToReceive: () => pegInTxState.value.amountToTransfer,
      },
      FLYOVER: {
        title: PowPegMode.FAST,
        label: 'Powered by PowPeg + Flyover',
        subtitleColor: 'orange',
        link: 'https://dev.rootstock.io/concepts/rif-suite/#meet-the-suite',
        estimatedTime: () => blockConfirmationsToTimeString(computedQuote.value?.quote.confirmations ?? 0, 'btc'),
        amountToTransfer: () => computedQuote.value?.getTotalTxAmount(selectedFee.value)
          ?? new SatoshiBig('0', 'btc'),
        totalFee: () => computedQuote.value?.getTotalQuoteFee(selectedFee.value),
        providerFee: () => quoteFee.value,
        valueToReceive: () => computedQuote.value?.quote.value ?? new SatoshiBig('0', 'btc'),
      },
    };
    const option = computed(() => PeginOptions[props.optionType as keyof typeof PeginOptions]);

    function selectOption() {
      context.emit('selected-option', props.optionType, props.quote);
    }

    function toUSD(value: SatoshiBig) {
      if (!value) return '';
      return value.toUSDFromBTCString(bitcoinPrice.value, fixedUSDDecimals);
    }

    function openLink(link: string) {
      window.open(link, '_blank');
    }

    const tooltipText = 'Time is approximate and may vary due to block confirmation times and network congestion.';

    return {
      constants,
      mdiInformationOutline,
      selectOption,
      option,
      rskAddress,
      environmentContext,
      selectedFee,
      toUSD,
      mdiOpenInNew,
      openLink,
      mdiClockOutline,
      tooltipText,
    };
  },
});
</script>
