<template>
  <v-card variant="outlined" :disabled="isFlyover">
    <v-card-title class="font-weight-bold">{{ title }}</v-card-title>
    <v-card-item>
      <div class="d-flex flex-column">
        <span class="font-weight-bold text-black">
          Estimated time to receive
        </span>
        <span class="mt-1">-</span>
      </div>
    </v-card-item>
    <v-card-item>
      <div class="d-flex flex-column">
        <span class="font-weight-bold text-black">
          RSK network fee
        </span>
        <span class="mt-1">{{ formSummary.gas }} {{ environmentContext.getRbtcTicker() }}</span>
        <span class="mt-1 grayish">USD {{ toUSD(formSummary.gas) }}</span>
      </div>
    </v-card-item>
    <v-card-item>
      <div class="d-flex flex-column">
        <span class="font-weight-bold text-black">
          BTC network fee
        </span>
        <span class="mt-1">{{ formSummary.fee }} {{ environmentContext.getBtcTicker() }}</span>
        <span class="mt-1 grayish">USD {{ toUSD(formSummary.fee) }}</span>
      </div>
    </v-card-item>
    <v-card-item>
      <div class="d-flex flex-column">
        <span class="font-weight-bold text-black">
          Other fees
        </span>
        <span class="mt-1">0 {{ environmentContext.getRbtcTicker() }}</span>
        <span class="mt-1 grayish">USD 0</span>
      </div>
    </v-card-item>
    <v-card-item>
      <div class="d-flex flex-column">
        <span class="font-weight-bold text-black">
          Estimated value to receive
        </span>
        <span class="mt-1">
          {{ formSummary.amountReceivedString }} {{ environmentContext.getBtcTicker() }}
        </span>
        <span class="mt-1 grayish">USD {{ toUSD(formSummary.amountReceivedString) }}</span>
      </div>
    </v-card-item>
    <v-card-item>
      <span class="font-weight-bold text-black">
          Recipient address
        </span>
      <div v-if="isFlyover" class="pt-2">
        <v-text-field
          flat
          variant="outlined"
          density="compact"
          hide-details
          class="flyover-input"
          @focus="$emit('flyoverInputFocusChanged', true)"
          @focusout="$emit('flyoverInputFocusChanged', false)"
          :placeholder="`Enter a ${environmentContext.getBtcTicker()} address`"
        />
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
    <v-card-item>
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
import { defineComponent, PropType } from 'vue';
import { mdiSendOutline } from '@mdi/js';
import EnvironmentContextProviderService from '@/common/providers/EnvironmentContextProvider';
import { useState, useStateAttribute } from '@/common/store/helper';
import { SessionState, NormalizedSummary, SatoshiBig } from '@/common/types';
import * as constants from '@/common/store/constants';
import { Machine } from '@/common/utils';

export default defineComponent({
  name: 'PegoutOption',
  props: {
    title: {
      type: String,
      required: true,
    },
    isFlyover: {
      type: Boolean,
      required: true,
    },
    formSummary: {
      type: Object as PropType<NormalizedSummary>,
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
  setup() {
    const environmentContext = EnvironmentContextProviderService.getEnvironmentContext();
    const session = useState<SessionState>('web3Session');
    const bitcoinPrice = useStateAttribute<number>('web3Session', 'bitcoinPrice');
    const fixedUSDDecimals = 2;

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
    };
  },
});
</script>
