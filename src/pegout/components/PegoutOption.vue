<template>
  <v-card variant="outlined" height="100%" class="d-flex flex-column">
    <v-card-title class="font-weight-bold d-flex align-center justify-space-between">
      {{ title.text }}
      <v-icon :icon="title.icon" size="36"></v-icon>
    </v-card-title>
    <v-card-item>
      <div class="d-flex flex-column">
        <span class="font-weight-bold text-black">
          Estimated time to receive
        </span>
        <span class="mt-1">
          {{ blockConfirmationsToTimeString(quote.quote.depositConfirmations) }}
        </span>
      </div>
    </v-card-item>
    <v-card-item>
      <div class="d-flex flex-column">
        <span class="font-weight-bold text-black">
          RSK network fee
        </span>
        <span class="mt-1">{{ quote.quote.gasFee.toRBTCTrimmedString() }}
          {{ environmentContext.getRbtcTicker() }}
        </span>
        <span class="mt-1 grayish">USD {{ toUSD(quote.quote.gasFee.toRBTCString()) }}</span>
      </div>
    </v-card-item>
    <v-card-item>
      <div class="d-flex flex-column">
        <span class="font-weight-bold text-black">
          {{ isFlyover ? 'Provider fee' : 'Estimated BTC network fee' }}
        </span>
        <span class="mt-1">
          {{ quote.quote.callFee.plus(quote.quote.productFeeAmount).toRBTCTrimmedString() }}
          {{ environmentContext.getBtcTicker() }}
        </span>
        <span class="mt-1 grayish">USD
          {{ toUSD(quote.quote.callFee.plus(quote.quote.productFeeAmount).toRBTCString()) }}
        </span>
      </div>
    </v-card-item>
    <v-card-item>
      <div class="d-flex flex-column">
        <span class="font-weight-bold text-black">
          Amount to send
        </span>
        <span class="mt-1">
          {{ amountToSend }} {{ environmentContext.getBtcTicker() }}
        </span>
        <span class="mt-1 grayish">USD {{ toUSD(amountToSend) }}
        </span>
      </div>
    </v-card-item>
    <v-card-item>
      <div class="d-flex flex-column">
        <span class="font-weight-bold text-black">
          {{ isFlyover ? 'Value to receive' : 'Estimated value to receive' }}
        </span>
        <span class="mt-1">
          {{ estimatedValueToReceive }} {{ environmentContext.getBtcTicker() }}
        </span>
        <span class="mt-1 grayish">USD {{ toUSD(estimatedValueToReceive) }}</span>
      </div>
    </v-card-item>
    <v-card-item>
      <span class="font-weight-bold text-black">
          Recipient address
        </span>
      <div v-if="isFlyover" class="pt-2">
        <span>{{ quote.quote.depositAddr }}</span>
      </div>
      <div v-else class="d-flex flex-column pt-2 derive-button">
          <span v-if="session.btcDerivedAddress">
            {{session.btcDerivedAddress}}
          </span>
          <v-btn v-else
            :disabled="!isReadyToSign || !authorizedWalletToSignMessage"
            variant="outlined"
            rounded
            @click="$emit('openAddressDialog')" >
            <span>
              Get Bitcoin destination address
            </span>
          </v-btn>
          <span v-if="!authorizedWalletToSignMessage" class="text-black pt-1" >
            As you are not using MetaMask, Ledger or Trezor, you need to follow
              <a :href=constants.DERIVE_BTC_ADDRESS_DOCUMENTATION_URL
              class="d-inline-block text-black a"
              style="font-size: inherit;"
              target='_blank'>
                this documentation
              </a>
            to get the destination address.
          </span>
        </div>
    </v-card-item>
    <v-card-item class="flex-grow-1 d-flex flex-column align-self-start justify-end">
        <v-btn
          v-if="!formState.matches(['loading'])"
          :disabled="!isReadyToCreate || formState.matches(['goingHome'])"
          @click="$emit('send')"
          rounded
          color="#000"
        >
          Choose this option
          <template v-slot:append>
            <v-icon :icon="mdiSendOutline" color="#fff"></v-icon>
          </template>
        </v-btn>
    </v-card-item>
  </v-card>
</template>

<script lang="ts">
import { computed, defineComponent, PropType } from 'vue';
import { mdiClockFast, mdiSendOutline, mdiTagCheck } from '@mdi/js';
import EnvironmentContextProviderService from '@/common/providers/EnvironmentContextProvider';
import { useState, useStateAttribute } from '@/common/store/helper';
import { SessionState, SatoshiBig, QuotePegOut2WP } from '@/common/types';
import * as constants from '@/common/store/constants';
import { Machine, blockConfirmationsToTimeString } from '@/common/utils';

export default defineComponent({
  name: 'PegoutOption',
  props: {
    quote: {
      type: Object as PropType<QuotePegOut2WP>,
      required: true,
    },
    formState: {
      type: Object as PropType<Machine<'loading' | 'goingHome' | 'fill'>>,
      required: true,
    },
    isReadyToSign: {
      type: Boolean,
      required: true,
    },
    isReadyToCreate: {
      type: Boolean,
      required: true,
    },
    authorizedWalletToSignMessage: {
      type: Boolean,
      required: true,
    },
  },
  setup(props) {
    const environmentContext = EnvironmentContextProviderService.getEnvironmentContext();
    const session = useState<SessionState>('web3Session');
    const bitcoinPrice = useStateAttribute<number>('web3Session', 'bitcoinPrice');
    const fixedUSDDecimals = 2;

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

    const title = computed(() => {
      if (isFlyover.value) {
        return {
          text: 'Faster option',
          icon: mdiClockFast,
        };
      }
      return {
        text: 'Cheaper option',
        icon: mdiTagCheck,
      };
    });

    function toUSD(amount: number | string | undefined) {
      const btcAmount = new SatoshiBig(amount ?? '0', 'btc');
      return btcAmount.toUSDFromBTCString(bitcoinPrice.value, fixedUSDDecimals);
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
      title,
    };
  },
});
</script>