<template>
  <v-card :ripple="false" @click="selectOption" rounded="lg" flat variant="outlined"
    :class="selected && 'selected'"
    class="d-flex flex-column ga-4 pa-8 fill-height">
    <span class="text-h4">{{ option.title }}</span>
    <v-row no-gutters>
      <v-col cols="3">
        <div class="d-flex text-h3 ga-1 flex-wrap">
          <span v-for="(word, i) in option.subtitle.split(' ')" :key="i"
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
      <span class="text-bw-400">{{ estimatedTime }}</span>
    </div>
    <div class="d-flex flex-column">
      <span>{{ environmentContext.getBtcTicker() }} fee</span>
      <span class="text-bw-400">
        {{ selectedFee.toBTCTrimmedString() }} {{ environmentContext.getBtcTicker() }}
      </span>
    </div>
    <div class="d-flex flex-column">
      <span>Provider fee</span>
      <span class="text-bw-400">{{ providerFee }} {{ environmentContext.getBtcTicker() }}</span>
    </div>
    <div class="d-flex flex-column">
      <span>Amount to send</span>
      <span class="text-bw-400">{{ amountToSend }} {{ environmentContext.getBtcTicker() }}</span>
    </div>
    <div class="d-flex flex-column">
      <span>Value to receive</span>
      <span class="text-bw-400">{{ valueToReceive }} {{ environmentContext.getRbtcTicker() }}</span>
    </div>
    <v-spacer class="fill-height" />
  </v-card>
</template>

<script lang="ts">
import {
  computed, defineComponent,
} from 'vue';
import * as constants from '@/common/store/constants';
import { mdiInformationOutline } from '@mdi/js';
import { useGetter, useState, useStateAttribute } from '@/common/store/helper';
import { truncateString } from '@/common/utils';
import RskAddressInput from '@/pegin/components/create/RskAddressInput.vue';
import EnvironmentContextProviderService from '@/common/providers/EnvironmentContextProvider';
import { PegInTxState, SatoshiBig } from '@/common/types';

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
  },
  setup(props, context) {
    const account = useStateAttribute<string>('web3Session', 'account');
    const rskAddress = computed(() => truncateString(account.value));
    const environmentContext = EnvironmentContextProviderService.getEnvironmentContext();
    const pegInTxState = useState<PegInTxState>('pegInTx');
    const selectedFee = useGetter<SatoshiBig>('pegInTx', constants.PEGIN_TX_GET_SAFE_TX_FEE);

    const PeginOptions = {
      native: {
        title: 'Native (For Advanced Users)',
        subtitle: 'Maximum Security',
        subtitleColor: 'purple',
        estimatedTime: () => '34 Hours',
        amountToTransfer: () => pegInTxState.value.amountToTransfer
          .plus(selectedFee.value).toBTCTrimmedString(),
        providerFee: () => '0',
        valueToReceive: () => pegInTxState.value.amountToTransfer.toBTCTrimmedString(),
      },
      flyover: {
        title: 'Flyover (For Less Advanced Users)',
        subtitle: 'Faster Option',
        subtitleColor: 'orange',
        estimatedTime: () => '15 minutes',
        amountToTransfer: () => '0.0006',
        providerFee: () => '0.0002',
        valueToReceive: () => '0.00051',
      },
    };
    const option = computed(() => PeginOptions[props.optionType as keyof typeof PeginOptions]);
    const estimatedTime = computed(() => option.value.estimatedTime());
    const amountToSend = computed(() => option.value.amountToTransfer());
    const providerFee = computed(() => option.value.providerFee());
    const valueToReceive = computed(() => option.value.valueToReceive());

    function selectOption() {
      context.emit('selected-option', props.optionType);
    }

    return {
      constants,
      mdiInformationOutline,
      selectOption,
      option,
      rskAddress,
      environmentContext,
      estimatedTime,
      amountToSend,
      providerFee,
      valueToReceive,
      selectedFee,
    };
  },
});
</script>
