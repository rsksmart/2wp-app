<template>
  <v-card :ripple="false" rounded="lg" flat variant="outlined"
    @click="selectOption" :disabled="flyoverNotAvailable"
    :class="{ 'selected': selectedOption, 'not-available': flyoverNotAvailable }"
    class="d-flex flex-column ga-4 pa-6 fill-height w-100">
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
        <span :class='`font-weight-bold pa-1 bg-${header.subtitleBgColor}`'>
          {{ header.title }}
        </span>
      </v-col>
    </v-row>
    <v-row no-gutters>
      <v-col class="d-flex justify-start">
        <span class="text-body-amount">
          ~{{ estimatedValueToReceive }} {{ environmentContext.getBtcTicker() }}
        </span>
      </v-col>
      <v-col cols="auto" class="d-flex justify-end align-center">
        <span class="text-body-sm">{{ header.label }}&nbsp;</span>
        <v-btn @click="openLink(header.link)" icon density="compact" size="small" variant="plain">
           &nbsp;<v-icon :icon="mdiOpenInNew" />
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
                  <v-icon :icon="mdiClockOutline" :color="header.timeColor" size="20" />
                  <span :class='`text-${header.timeColor}`'>{{ estimatedTimeToReceive }}</span>
                </div>
              </template>
            </v-tooltip>
          </v-col>
          <v-col cols="6">
            <v-row no-gutters>
              <v-tooltip :text="feeTooltipText" location="top" max-width="200">
                <template v-slot:activator="{ props }">
                  <div v-bind="props" class="d-flex align-center ga-1">
                    <v-icon :icon="mdiCurrencyUsd" :color="header.timeColor" size="20" />
                    <span :class='`text-${header.timeColor}`'>{{ toUSD(totalFee) }} USD </span>
                  </div>
                </template>
              </v-tooltip>
            </v-row>
          </v-col>
        </v-row>
      </v-col>
      <v-col />
    </v-row>
    <v-row no-gutters class="d-flex justify-start">
      <span class="text-body-sm">
        Destination Bitcoin Address
      </span>
    </v-row>
    <template v-if="isFlyover">
      <v-row no-gutters class="d-flex justify-start">
        <v-text-field
          v-model="btcAddress"
          flat
          hide-details
          density="compact"
          rounded="lg"
          variant="solo"
          :class="showAddressWarning && 'input-error'"
          :placeholder="btcAddressPlaceholder"
          @update:model-value="updateStore"
          class="pb-0"/>
      </v-row>
      <v-row no-gutters class="d-flex justify-start">
        <v-alert v-show="showAddressWarning" variant="text" type="warning"
          density="compact" class="pa-0" prominent>
          <template #prepend>
            <v-icon size="x-small" :icon="mdiInformationOutline" />
          </template>
          <span class="text-body-sm">
            Invalid address. Please note that native segwit is not supported at this time.
          </span>
        </v-alert>
      </v-row>
    </template>
    <template v-else>
      <v-row no-gutters class="d-flex justify-start">
        <v-text-field
          :v-model="session.btcDerivedAddress || 'Derived Bitcoin Address'"
          flat readonly
          hide-details
          density="compact"
          rounded="lg"
          variant="solo"
          :placeholder="session.btcDerivedAddress || 'Derived Bitcoin Address'">
          <template v-slot:append-inner
            v-if="isWalletAuthorizedToSign && !session.btcDerivedAddress">
            <v-chip variant="outlined" @click="$emit('openAddressDialog')">
                Derive
            </v-chip>
          </template>
          <template v-slot:append-inner v-else>
            <v-icon size="x-small"
              :icon="mdiContentCopy" @click="copyToClipboard" />
          </template>
        </v-text-field>
      </v-row>
      <v-row no-gutters class="d-flex justify-start">
        <v-alert variant="text" type="warning" density="compact" class="pa-0" prominent>
          <template #prepend>
            <v-icon size="x-small" :icon="mdiInformationOutline" />
          </template>
          <span class="text-body-sm">Follow
            <a :href=constants.DERIVE_BTC_ADDRESS_DOCUMENTATION_URL target='_blank'>
              this steps
            </a>
            to view and access your {{ environmentContext.getBtcTicker() }} funds.
          </span>
        </v-alert>
      </v-row>
    </template>
  </v-card>
</template>

<script lang="ts">
import {
  computed, defineComponent, PropType, ref,
} from 'vue';
import {
  mdiInformationOutline,
  mdiOpenInNew,
  mdiClockOutline,
  mdiContentCopy,
  mdiCurrencyUsd,
} from '@mdi/js';
import EnvironmentContextProviderService from '@/common/providers/EnvironmentContextProvider';
import { useAction, useState, useStateAttribute } from '@/common/store/helper';
import {
  SessionState, SatoshiBig, QuotePegOut2WP,
  WeiBig,
} from '@/common/types';
import * as constants from '@/common/store/constants';
import { blockConfirmationsToTimeString, validateAddress } from '@/common/utils';
import { PowPegMode } from '@/common/store/constants';
import { useTheme } from 'vuetify';

export default defineComponent({
  name: 'PegoutOption',
  props: {
    optionType: {
      type: String as PropType<constants.pegoutType>,
      required: true,
    },
    flyoverNotAvailable: {
      type: Boolean,
      required: false,
    },
    quote: {
      type: Object as PropType<QuotePegOut2WP>,
      required: false,
    },
    isWalletAuthorizedToSign: {
      type: Boolean,
      required: false,
    },
    selectedOption: {
      type: Boolean,
      default: false,
    },
    quoteDifference: {
      type: Number,
      required: false,
    },
  },
  setup(props, context) {
    const environmentContext = EnvironmentContextProviderService.getEnvironmentContext();
    const session = useState<SessionState>('web3Session');
    const bitcoinPrice = useStateAttribute<number>('pegOutTx', 'bitcoinPrice');
    const networkFee = useStateAttribute<WeiBig>('pegOutTx', 'calculatedFee');
    const setBtcAddress = useAction('flyoverPegout', constants.FLYOVER_PEGOUT_ADD_BTC_ADDRESS);
    const fixedUSDDecimals = 2;
    const btcAddress = ref('');
    const isFlyover = computed(() => props.optionType === constants.pegoutType.FLYOVER);
    const tooltipText = 'Time is approximate and may vary due to block confirmation times and network congestion.';
    const feeTooltipText = 'Fee is approximate and may vary due to network congestion.';

    const { global: { current } } = useTheme();

    const estimatedValueToReceive = computed(() => {
      if (props.quote) {
        return new SatoshiBig((props.quote.quote.value)
          .toRBTCTrimmedString(), 'btc')
          .toBTCTrimmedString();
      }
      return '';
    });

    const estimatedTimeToReceive = computed(() => {
      if (props.quote) {
        const { depositConfirmations } = props.quote.quote;
        if (depositConfirmations === 0) {
          return '34 hours';
        }
        return blockConfirmationsToTimeString(depositConfirmations);
      }
      return '';
    });

    const header = computed(() => {
      if (isFlyover.value) {
        return {
          title: PowPegMode.FAST,
          label: 'Powered by PowPeg + Flyover',
          subtitleBgColor: 'orange',
          link: 'https://dev.rootstock.io/developers/integrate/flyover/',
          color: '#FF9100',
          timeColor: 'green',
        };
      }
      return {
        title: PowPegMode.NATIVE,
        label: 'Powered by PowPeg',
        subtitleBgColor: 'purple',
        link: 'https://dev.rootstock.io/concepts/powpeg/',
        color: '#9E75FF',
        timeColor: 'red',
      };
    });

    const totalFee = computed(() => {
      if (props.quote) {
        let fee;
        if (isFlyover.value) {
          fee = props.quote.quote.callFee
            .plus(props.quote.quote.gasFee)
            .plus(props.quote.quote.productFeeAmount)
            .plus(networkFee.value);
        } else {
          fee = props.quote.quote.gasFee
            .plus(props.quote.quote.productFeeAmount);
        }
        return fee.toRBTCTrimmedString();
      }
      return '0';
    });

    const btcAddressPlaceholder = `Paste your ${environmentContext.getBtcTicker()} address`;

    const isValidBtcAddress = computed(() => {
      const { valid, addressType } = validateAddress(btcAddress.value);
      return valid && (addressType === constants.BITCOIN_LEGACY_ADDRESS
      || addressType === constants.BITCOIN_SEGWIT_ADDRESS
      || addressType === constants.BITCOIN_NATIVE_SEGWIT_ADDRESS);
    });

    const showAddressWarning = computed(
      () => !isValidBtcAddress.value && btcAddress.value.length > 0,
    );

    const moneyBagIcon = computed(() => (current.value.dark
      ? require('@/assets/money-bag-dark.svg')
      : require('@/assets/money-bag-light.svg')));

    const updateStore = () => {
      setBtcAddress(btcAddress.value);
    };

    function toUSD(amount: number | string | undefined) {
      const btcAmount = new SatoshiBig(amount ?? '0', 'btc');
      return btcAmount.toUSDFromBTCString(bitcoinPrice.value, fixedUSDDecimals);
    }

    function selectOption() {
      context.emit('change-selected-option', props.quote ? props.quote.quoteHash : '');
    }

    function openLink(link: string) {
      window.open(link, '_blank');
    }

    function copyToClipboard() {
      navigator.clipboard.writeText(session.value.btcDerivedAddress || '');
    }

    return {
      environmentContext,
      session,
      constants,
      toUSD,
      blockConfirmationsToTimeString,
      estimatedValueToReceive,
      isFlyover,
      header,
      btcAddress,
      updateStore,
      isValidBtcAddress,
      showAddressWarning,
      mdiInformationOutline,
      selectOption,
      estimatedTimeToReceive,
      mdiOpenInNew,
      openLink,
      btcAddressPlaceholder,
      totalFee,
      tooltipText,
      feeTooltipText,
      mdiContentCopy,
      copyToClipboard,
      mdiClockOutline,
      mdiCurrencyUsd,
      moneyBagIcon,
    };
  },
});
</script>

<style scoped>
  ::v-deep(.v-alert__prepend) {
    margin-inline-end: 4px;
    margin-top: 5px;
    align-self: start;
  }
</style>
