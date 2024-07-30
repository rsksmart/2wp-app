<template>
  <v-card :ripple="false" @click="selectOption" rounded="lg" flat variant="outlined"
    :class="selected && 'selected'"
    class="d-flex flex-column ga-4 pa-8 fill-height">
    <v-row no-gutters>
      <v-col cols="3">
        <div class="d-flex text-h3 ga-1 flex-wrap">
          <span v-for="(word, i) in option.title.split(' ')" :key="i"
            :class='`pa-2 bg-${option.subtitleColor}`'>
            {{ word }}
          </span>
        </div>
      </v-col>
    </v-row>
    <div class="d-flex flex-column ga-2 py-4">
      <rsk-address-input/>
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
import { mdiInformationOutline } from '@mdi/js';
import { useGetter, useState, useStateAttribute } from '@/common/store/helper';
import { truncateString } from '@/common/utils';
import RskAddressInput from '@/pegin/components/create/RskAddressInput.vue';
import EnvironmentContextProviderService from '@/common/providers/EnvironmentContextProvider';
import { PegInTxState, QuotePegIn2WP, SatoshiBig } from '@/common/types';

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
      type: Object as PropType<QuotePegIn2WP>,
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
    const quote = computed(() => props.quote?.quote);

    const quoteFee = computed(() => {
      if (!quote.value) return new SatoshiBig('0', 'btc');
      return quote.value.productFeeAmount
        .plus(quote.value.callFee)
        .plus(new SatoshiBig(quote.value.gasFee.toRBTCString(), 'btc'));
    });

    const PeginOptions = {
      POWPEG: {
        title: 'Native Powpeg',
        subtitleColor: 'purple',
        link: 'https://dev.rootstock.io/rsk/architecture/powpeg/',
        estimatedTime: () => '17 hours',
        amountToTransfer: () => pegInTxState.value.amountToTransfer
          .plus(selectedFee.value),
        providerFee: () => new SatoshiBig('0', 'btc'),
        valueToReceive: () => pegInTxState.value.amountToTransfer,
      },
      FLYOVER: {
        title: 'Faster Option',
        subtitleColor: 'orange',
        link: 'https://dev.rootstock.io/guides/flyover/',
        estimatedTime: () => '15 minutes',
        amountToTransfer: () => quote.value?.value
          .plus(quoteFee.value).plus(selectedFee.value) ?? new SatoshiBig('0', 'btc'),
        providerFee: () => quoteFee.value,
        valueToReceive: () => quote.value?.value ?? new SatoshiBig('0', 'btc'),
      },
    };
    const option = computed(() => PeginOptions[props.optionType as keyof typeof PeginOptions]);

    function selectOption() {
      context.emit('selected-option', props.optionType, props.quote);
    }

    function toUSD(value: SatoshiBig) {
      return value.toUSDFromBTCString(bitcoinPrice.value, fixedUSDDecimals);
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
    };
  },
});
</script>
