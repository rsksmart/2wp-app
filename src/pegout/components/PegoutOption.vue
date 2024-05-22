<template>
  <v-card :ripple="false" rounded="lg" flat variant="outlined"
    @click="selectOption"
    :class="selectedOption && 'selected'"
    class="d-flex flex-column ga-4 pa-8 fill-height">
    <span class="text-h4">
      {{ header.title }}
    </span>
    <v-row no-gutters>
      <v-col cols="3">
        <div class="d-flex text-h3 ga-1 flex-wrap">
          <span v-for="(word, i) in header.subtitle.split(' ')" :key="i"
            :class="`pa-2 bg-${header.subtitleBgColor}`">
            {{ word }}
          </span>
        </div>
      </v-col>
    </v-row>
    <div class="d-flex flex-column ga-2 py-4">
      <span>Destination Address</span>
      <div v-if="isFlyover">
        <v-text-field
          v-model="btcAddress"
          flat
          hide-details
          density="compact"
          rounded="lg"
          variant="solo"
          :class="showAddressWarning && 'input-error'"
          :placeholder="`Paste your ${environmentContext.getBtcTicker()} address`"
          @update:model-value="updateStore"/>
        <v-alert v-show="showAddressWarning"
          variant="text" type="warning" density="compact" class="text-body-1 px-0" prominent>
          <template #prepend>
            <v-icon size="small" :icon="mdiInformationOutline" />
          </template>
          The input address is not valid, remember we only accept legacy (P2PKH)
          and segwit(P2SH) addresses.
        </v-alert>
      </div>
      <div v-else>
        <div class="bg-surface py-2 px-4 rounded-lg border">
          <p class="text-bw-400">
            Address needs to be generated
          </p>
        </div>
        <v-alert
          variant="text" type="warning" density="compact" class="text-body-1 px-0" prominent>
          <template #prepend>
            <v-icon size="small" :icon="mdiInformationOutline" />
          </template>
          <p>Follow
            <span>
              <a :href=constants.DERIVE_BTC_ADDRESS_DOCUMENTATION_URL
                class="d-inline a" target='_blank'>this documentation</a>
            </span>
            to get the destination address.
          </p>
        </v-alert>
      </div>
      <div v-if="isWalletAuthorizedToSign && isBtcAddressDerivationEnabled">
        <div class="d-flex align-center">
          <v-divider />
          <span class="d-inline-block px-2 text-bw-500">or</span>
          <v-divider />
        </div>
        <v-btn
          class="mt-2 w-100"
          @click="$emit('openAddressDialog')">
            Get Bitcoin destination address
        </v-btn>
      </div>
    </div>

    <span class="text-h4">Features</span>

    <div class="d-flex flex-column">
      <span>Estimated Time to Receive</span>
      <span class="text-bw-400">
        {{ blockConfirmationsToTimeString(quote.quote.depositConfirmations) }}
      </span>
    </div>

    <div class="d-flex flex-column">
      <span>Gas</span>
      <span class="text-bw-400">
        {{ quote.quote.gasFee.toRBTCTrimmedString() }}
        {{ environmentContext.getRbtcTicker() }}
      </span>
      <span class="text-bw-400">{{ toUSD(quote.quote.gasFee.toRBTCString()) }} USD</span>
    </div>

    <div class="d-flex flex-column">
      <span>
        {{ isFlyover ? 'Provider fee' : 'Estimated BTC network fee' }}
      </span>
      <span class="text-bw-400">
        {{ quote.quote.callFee.plus(quote.quote.productFeeAmount).toRBTCTrimmedString() }}
        {{ environmentContext.getBtcTicker() }}
      </span>
      <span class="text-bw-400">
        {{ toUSD(quote.quote.callFee.plus(quote.quote.productFeeAmount).toRBTCString()) }} USD
      </span>
    </div>

    <div class="d-flex flex-column">
      <span>Amount to send</span>
      <span class="text-bw-400">
        {{ amountToSend }} {{ environmentContext.getBtcTicker() }}
      </span>
      <span class="text-bw-400">{{ toUSD(amountToSend) }} USD</span>
    </div>

    <div class="d-flex flex-column">
      <span>
        {{ isFlyover ? 'Value to receive' : 'Estimated value to receive' }}
      </span>
      <span class="text-bw-400">
        {{ estimatedValueToReceive }} {{ environmentContext.getBtcTicker() }}
      </span>
      <span class="text-bw-400">{{ toUSD(estimatedValueToReceive) }} USD</span>
    </div>

    <v-spacer class="fill-height" />
  </v-card>
</template>

<script lang="ts">
import {
  computed, defineComponent, PropType, ref,
} from 'vue';
import { mdiSendOutline, mdiInformationOutline } from '@mdi/js';
import EnvironmentContextProviderService from '@/common/providers/EnvironmentContextProvider';
import { useAction, useState, useStateAttribute } from '@/common/store/helper';
import { SessionState, SatoshiBig, QuotePegOut2WP } from '@/common/types';
import * as constants from '@/common/store/constants';
import { blockConfirmationsToTimeString, validateAddress } from '@/common/utils';

export default defineComponent({
  name: 'PegoutOption',
  props: {
    quote: {
      type: Object as PropType<QuotePegOut2WP>,
      required: true,
    },
    isWalletAuthorizedToSign: {
      type: Boolean,
      required: true,
    },
    selectedOption: {
      type: Boolean,
      default: false,
    },
  },
  setup(props, context) {
    const environmentContext = EnvironmentContextProviderService.getEnvironmentContext();
    const session = useState<SessionState>('web3Session');
    const bitcoinPrice = useStateAttribute<number>('pegOutTx', 'bitcoinPrice');
    const setBtcAddress = useAction('flyoverPegout', constants.FLYOVER_PEGOUT_ADD_BTC_ADDRESS);
    const fixedUSDDecimals = 2;
    const btcAddress = ref('');
    const isBtcAddressDerivationEnabled = false;
    const isFlyover = computed(() => props.quote.quoteHash.length > 0);

    const amountToSend = computed(() => {
      if (isFlyover.value) {
        return new SatoshiBig(props.quote.quote.value
          .plus(props.quote.quote.productFeeAmount)
          .plus(props.quote.quote.gasFee)
          .plus(props.quote.quote.callFee)
          .toRBTCTrimmedString(), 'btc')
          .toBTCTrimmedString();
      }

      return new SatoshiBig(props.quote.quote.value
        .toRBTCTrimmedString(), 'btc')
        .toBTCTrimmedString();
    });

    const estimatedValueToReceive = computed(() => {
      if (isFlyover.value) {
        return new SatoshiBig(props.quote.quote.value
          .toRBTCTrimmedString(), 'btc')
          .toBTCTrimmedString();
      }

      return new SatoshiBig(props.quote.quote.value
        .minus(props.quote.quote.productFeeAmount)
        .minus(props.quote.quote.gasFee)
        .toRBTCTrimmedString(), 'btc')
        .toBTCTrimmedString();
    });

    const header = computed(() => {
      if (isFlyover.value) {
        return {
          title: 'Flyover (For Less Advanced Users)',
          subtitle: 'Faster Option',
          subtitleBgColor: 'orange',
        };
      }
      return {
        title: 'Native (For Advanced Users)',
        subtitle: 'Maximum Security',
        subtitleBgColor: 'purple',
      };
    });

    const isValidBtcAddress = computed(() => {
      const { valid, addressType } = validateAddress(btcAddress.value);
      return valid && (addressType === constants.BITCOIN_LEGACY_ADDRESS
      || addressType === constants.BITCOIN_SEGWIT_ADDRESS);
    });

    const showAddressWarning = computed(
      () => !isValidBtcAddress.value && btcAddress.value.length > 0,
    );

    const updateStore = () => {
      setBtcAddress(btcAddress.value);
    };

    function toUSD(amount: number | string | undefined) {
      const btcAmount = new SatoshiBig(amount ?? '0', 'btc');
      return btcAmount.toUSDFromBTCString(bitcoinPrice.value, fixedUSDDecimals);
    }

    function selectOption() {
      context.emit('change-selected-option', props.quote.quoteHash);
    }

    return {
      mdiSendOutline,
      environmentContext,
      session,
      constants,
      toUSD,
      blockConfirmationsToTimeString,
      amountToSend,
      estimatedValueToReceive,
      isFlyover,
      header,
      btcAddress,
      updateStore,
      isValidBtcAddress,
      showAddressWarning,
      mdiInformationOutline,
      selectOption,
      isBtcAddressDerivationEnabled,
    };
  },
});
</script>
