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
        <v-text-field
                v-model="btcAddress"
                flat
                hide-details
                single-line
                density="compact"
                variant="outlined"
                :placeholder="`Paste your ${environmentContext.getBtcTicker()} address`"
                @update:model-value="updateStore"/>
      </div>
      <div v-else class="d-flex flex-column pt-2 derive-button">
          <span v-if="session.btcDerivedAddress">
            {{session.btcDerivedAddress}}
          </span>
          <v-btn v-else
            :disabled="!isReadyToSign || !pegoutOptionAuthorizedWalletToSign"
            variant="outlined"
            rounded
            @click="$emit('openAddressDialog')" >
            <span>
              Get Bitcoin destination address
            </span>
          </v-btn>
          <span v-if="!pegoutOptionAuthorizedWalletToSign" class="text-black pt-1" >
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
        <v-row class="ma-0 pt-1" style="min-height: 17px;">
          <span v-if="showAddressWarning" class="yellowish" id="rbtc-error-msg">
            The input address is not valid, remember we only accept legacy (P2PKH)
            and segwit(P2SH) addresses.
          </span>
        </v-row>
    </v-card-item>
    <v-card-item class="flex-grow-1 d-flex flex-column align-left justify-end">
        <v-btn
          v-if="!formState.matches(['loading'])"
          :disabled="!isReadyToCreate
                    || formState.matches(['goingHome'])
                    || (isFlyover && !isValidBtcAddress)"
          @click="$emit('send')"
          rounded
          color="#000"
        >
          Accept
          <template v-slot:append>
            <v-icon :icon="mdiSendOutline" color="#fff"></v-icon>
          </template>
        </v-btn>
    </v-card-item>
  </v-card>
</template>

<script lang="ts">
import {
  computed, defineComponent, PropType, ref,
} from 'vue';
import { mdiClockFast, mdiSendOutline, mdiTagCheck } from '@mdi/js';
import EnvironmentContextProviderService from '@/common/providers/EnvironmentContextProvider';
import { useAction, useState, useStateAttribute } from '@/common/store/helper';
import { SessionState, SatoshiBig, QuotePegOut2WP } from '@/common/types';
import * as constants from '@/common/store/constants';
import { Machine, blockConfirmationsToTimeString, validateAddress } from '@/common/utils';

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
    pegoutOptionAuthorizedWalletToSign: {
      type: Boolean,
      required: true,
    },
  },
  setup(props) {
    const environmentContext = EnvironmentContextProviderService.getEnvironmentContext();
    const session = useState<SessionState>('web3Session');
    const bitcoinPrice = useStateAttribute<number>('web3Session', 'bitcoinPrice');
    const setBtcAddress = useAction('flyoverPegout', constants.FLYOVER_PEGOUT_ADD_BTC_ADDRESS);
    const fixedUSDDecimals = 2;
    const btcAddress = ref('');

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
          text: 'Faster',
          icon: mdiClockFast,
        };
      }
      return {
        text: 'Default',
        icon: mdiTagCheck,
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
      btcAddress,
      updateStore,
      isValidBtcAddress,
      showAddressWarning,
    };
  },
});
</script>
