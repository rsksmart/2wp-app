<template>
  <v-card :ripple="false" @click="selectOption" rounded="lg" flat variant="outlined"
    :class="selected && 'selected'"
    class="d-flex flex-column ga-4 pa-8 fill-height">
    <v-row no-gutters class="my-2">
      <div class='text-h3'>
        <span :class='`pa-1 bg-${option.subtitleColor}`'>
          {{ option.title }}
        </span>
      </div>
    </v-row>
    <v-row no-gutters>
      <v-col cols="auto">
        <span class="text-right"> {{ option.label }}</span>
      </v-col>
      <v-col cols="auto" class="pl-2">
        <v-btn @click="openLink(option.link)" icon density="compact" size="small" variant="plain">
            <v-icon :icon="mdiOpenInNew"></v-icon>
        </v-btn>
      </v-col>
    </v-row>
    <div class="d-flex flex-column ga-2 py-4">
      <rsk-address-input :option-type="optionType"/>
    </div>
    <span class="text-h4">Features</span>
    <div class="d-flex flex-column">
      <span>Estimated Time</span>
      <span class="text-bw-400">{{ option.estimatedTime() }}</span>
    </div>
    <div class="d-flex flex-column">
      <span>{{ environmentContext.getBtcTicker() }} fee</span>
      <span class="text-bw-400">
        {{ selectedFee.toBTCTrimmedString() }} {{ environmentContext.getBtcTicker() }}
      </span>
      <span class="text-bw-400">USD {{ toUSD(selectedFee) }}</span>
    </div>
    <div class="d-flex flex-column">
      <span>Provider fee</span>
      <span class="text-bw-400">
        {{ option.providerFee().toBTCTrimmedString() }} {{ environmentContext.getBtcTicker() }}
      </span>
      <span class="text-bw-400">USD {{ toUSD(option.providerFee()) }}</span>
    </div>
    <div class="d-flex flex-column">
      <span>Amount to send</span>
      <span class="text-bw-400">
        {{ option.amountToTransfer().toBTCTrimmedString() }} {{ environmentContext.getBtcTicker() }}
      </span>
      <span class="text-bw-400">USD {{ toUSD(option.amountToTransfer()) }}</span>
    </div>
    <div class="d-flex flex-column">
      <span>Value to receive</span>
      <span class="text-bw-400">
        {{ option.valueToReceive().toBTCTrimmedString() }} {{ environmentContext.getRbtcTicker() }}
      </span>
      <span class="text-bw-400">USD {{ toUSD(option.valueToReceive()) }}</span>
    </div>
    <v-spacer class="fill-height" />
  </v-card>
</template>

<script lang="ts">
import {
  PropType,
  computed, defineComponent,
} from 'vue';
import * as constants from '@/common/store/constants';
import { mdiInformationOutline, mdiOpenInNew } from '@mdi/js';
import { useGetter, useState, useStateAttribute } from '@/common/store/helper';
import { blockConfirmationsToTimeString, truncateString } from '@/common/utils';
import RskAddressInput from '@/pegin/components/create/RskAddressInput.vue';
import EnvironmentContextProviderService from '@/common/providers/EnvironmentContextProvider';
import { PeginQuote, PegInTxState, SatoshiBig } from '@/common/types';

export default defineComponent({
  name: 'PeginOptionCard',
  components: {
    RskAddressInput,
  },
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
        title: 'Native Mode',
        label: 'Powered by PowPeg',
        subtitleColor: 'purple',
        link: 'https://dev.rootstock.io/rsk/architecture/powpeg/',
        estimatedTime: () => '17 hours',
        amountToTransfer: () => pegInTxState.value.amountToTransfer
          .plus(selectedFee.value),
        providerFee: () => new SatoshiBig('0', 'btc'),
        valueToReceive: () => pegInTxState.value.amountToTransfer,
      },
      FLYOVER: {
        title: 'Fast Mode',
        label: 'Powered by PowPeg + Flyover',
        subtitleColor: 'orange',
        link: 'https://dev.rootstock.io/concepts/rif-suite/#meet-the-suite',
        estimatedTime: () => blockConfirmationsToTimeString(computedQuote.value?.quote.confirmations ?? 0, 'btc'),
        amountToTransfer: () => computedQuote.value?.getTotalTxAmount(selectedFee.value)
          ?? new SatoshiBig('0', 'btc'),
        providerFee: () => quoteFee.value,
        valueToReceive: () => computedQuote.value?.quote.value ?? new SatoshiBig('0', 'btc'),
      },
    };
    const option = computed(() => PeginOptions[props.optionType as keyof typeof PeginOptions]);

    function selectOption() {
      context.emit('selected-option', props.optionType, props.quote);
    }

    function toUSD(value: SatoshiBig) {
      return value.toUSDFromBTCString(bitcoinPrice.value, fixedUSDDecimals);
    }

    function openLink(link: string) {
      window.open(link, '_blank');
    }

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
    };
  },
});
</script>
