<template>
  <v-card :ripple="false"
    @click="selectOption" rounded="lg" flat variant="outlined"
    :class="{
      'selected': selected,
      'not-available': flyoverNotAvailable,
    }" class="d-flex flex-column ga-4 pa-6 fill-height w-100">
    <div v-if="flyoverNotAvailable"
      class="not-available-text d-flex align-center justify-center pa-8 text-center">
      <slot />
    </div>
    <v-row no-gutters>
      <v-col cols="8" class="d-flex justify-start align-center">
        <span class="text-body-sm">
          Estimated value to receive
        </span>
      </v-col>
      <v-col cols="4" class="d-flex justify-end">
        <span :class='`font-weight-bold pa-1 bg-${option.subtitleColor}`'>
          {{ option.title }}
        </span>
      </v-col>
    </v-row>
    <v-row no-gutters>
      <v-col cols="8" class="d-flex justify-start">
        <span class="text-body-amount">
          ~{{ option.valueToReceive()?.toBTCTrimmedString() }} {{ environmentContext
            .getRbtcTicker() }}
        </span>
      </v-col>
      <v-col cols="4" class="d-flex justify-end">
        <span class="text-body-sm">{{ option.label }}</span>
        <v-btn @click="openLink(option.link)" icon density="compact" size="small" variant="plain">
          <v-icon :icon="mdiOpenInNew" />
        </v-btn>
      </v-col>
    </v-row>
    <v-divider class="border-opacity-100" />
    <v-row no-gutters class="text-body-details">
      <v-col cols="8" class="d-flex justify-start">
        <v-row no-gutters>
          <v-col cols="6">
            <v-tooltip :text="tooltipText" location="top" max-width="200">
              <template v-slot:activator="{ props }">
                <div v-bind="props" class="d-flex align-center ga-1">
                  <v-icon :icon="mdiClockOutline" :color="option.timeColor" size="20" />
                  <span :class='`text-${option.timeColor}`'>{{ option.estimatedTime() }}</span>
                </div>
              </template>
            </v-tooltip>
          </v-col>
          <v-col cols="6">
            <v-row no-gutters>
              <v-tooltip :text="feeTooltipText" location="top" max-width="200">
                <template v-slot:activator="{ props }">
                  <div v-bind="props" class="d-flex align-center ga-1">
                    <v-icon :icon="mdiCurrencyUsd" :color="option.timeColor" size="20" />
                    <span :class='`text-${option.timeColor}`'>
                      {{ toUSD(option.totalFee()) }} USD
                    </span>
                  </div>
                </template>
              </v-tooltip>
            </v-row>
          </v-col>
        </v-row>
      </v-col>
      <v-col />
    </v-row>
  </v-card>
</template>

<script lang="ts">
import {
  PropType,
  computed, defineComponent,
} from 'vue';
import * as constants from '@/common/store/constants';
import {
  mdiInformationOutline, mdiOpenInNew, mdiClockOutline, mdiCurrencyUsd,
} from '@mdi/js';
import { useGetter, useState, useStateAttribute } from '@/common/store/helper';
import { blockConfirmationsToTimeString, truncateString } from '@/common/utils';
import EnvironmentContextProviderService from '@/common/providers/EnvironmentContextProvider';
import { PeginQuote, PegInTxState, SatoshiBig } from '@/common/types';
import { PowPegMode } from '@/common/store/constants';
import { useTheme } from 'vuetify';

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
    const { global: { current } } = useTheme();

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
        link: 'https://dev.rootstock.io/concepts/powpeg/',
        estimatedTime: () => '17 hours',
        timeColor: 'red',
        totalFee: () => selectedFee.value,
        amountToTransfer: () => pegInTxState.value.amountToTransfer
          .plus(selectedFee.value),
        valueToReceive: () => pegInTxState.value.amountToTransfer.safeMinus(selectedFee.value),
      },
      FLYOVER: {
        title: PowPegMode.FAST,
        label: 'Powered by PowPeg + Flyover',
        subtitleColor: 'orange',
        link: 'https://dev.rootstock.io/developers/integrate/flyover/',
        estimatedTime: () => blockConfirmationsToTimeString(computedQuote.value?.quote.confirmations ?? 0, 'btc'),
        timeColor: 'green',
        amountToTransfer: () => computedQuote.value?.getTotalTxAmount(selectedFee.value)
          ?? new SatoshiBig('0', 'btc'),
        totalFee: () => computedQuote.value?.getTotalQuoteFee(selectedFee.value),
        providerFee: () => quoteFee.value,
        valueToReceive: () => computedQuote.value?.quote.value ?? new SatoshiBig('0', 'btc'),
      },
    };
    const option = computed(() => PeginOptions[props.optionType as keyof typeof PeginOptions]);

    const moneyBagIcon = computed(() => (current.value.dark
      ? require('@/assets/money-bag-dark.svg')
      : require('@/assets/money-bag-light.svg')));

    function selectOption() {
      context.emit('selected-option', props.optionType, props.quote);
    }

    function toUSD(value: SatoshiBig | undefined): string {
      if (!value) return '';
      return value.toUSDFromBTCString(bitcoinPrice.value, fixedUSDDecimals);
    }

    function openLink(link: string) {
      window.open(link, '_blank');
    }

    const tooltipText = 'Time is approximate and may vary due to block confirmation times and network congestion.';
    const feeTooltipText = 'Fee is approximate and may vary due to network congestion.';

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
      mdiCurrencyUsd,
      tooltipText,
      feeTooltipText,
      moneyBagIcon,
    };
  },
});
</script>
