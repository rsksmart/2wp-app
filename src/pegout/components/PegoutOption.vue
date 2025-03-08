<template>
  <v-card :ripple="false" rounded="lg" flat variant="outlined"
    @click="selectOption" :disabled="flyoverNotAvailable"
    :class="{ 'selected': selectedOption, 'not-available': flyoverNotAvailable }"
    class="pa-8 fill-height">
    <div v-if="flyoverNotAvailable"
      class="not-available-text d-flex align-center justify-center pa-8 text-center">
      <slot />
    </div>
    <v-row no-gutters class="mb-5 py-2">
      <div class='text-h3'>
        <span :class='`pa-1 bg-${header.subtitleBgColor}`'>
          {{ header.title }}
        </span>
      </div>
    </v-row>
    <v-row no-gutters class="mb-5">
      <v-col cols="auto">
        <span class="text-right"> {{ header.label }}</span>
      </v-col>
      <v-col cols="auto" class="pl-2">
        <v-btn @click="openLink(header.link)" icon density="compact" size="small" variant="plain">
            <v-icon :icon="mdiOpenInNew"></v-icon>
        </v-btn>
      </v-col>
      <v-spacer />
      <v-col class="d-flex justify-end ml-0" :style='`color: ${header.color}`'>
        <v-tooltip :text="tooltipText" location="top" max-width="200">
        <template v-slot:activator="{ props }">
            <div v-bind="props" class="d-flex align-center ga-1">
              <v-icon :icon="mdiClockTimeThreeOutline" />
              <span :class='`ml-2 ${header.subtitleBgColor}`'>
                {{ estimatedTimeToReceive }}
              </span>
            </div>
        </template>
      </v-tooltip>
      </v-col>
    </v-row>
    <v-divider class="mb-5" thickness="1" :style='`color: ${header.color}; opacity: 1;`' />
    <v-row no-gutters class="mb-5">
      <v-col>
        <div class="d-flex flex-column">
          <span :class='`text-${header.subtitleBgColor}`'>
            {{ isFlyover ? 'Value to receive' : 'Estimated value to receive' }}
          </span>
          <span class="text-bw-400">
            {{ estimatedValueToReceive }}
            {{ environmentContext.getBtcTicker() }}
          </span>
          <span class="text-bw-400" :class="{ 'font-weight-bold': hasChanged()}">
            USD {{ toUSD(estimatedValueToReceive) }}
          </span>
        </div>
      </v-col>
      <v-col>
        <div class="d-flex flex-column">
          <span>
            {{ isFlyover ? 'Total Fee (Network & Provider)' : 'Total Fee (Network)' }}
          </span>
          <span class="text-bw-400"
                :class="{ 'font-weight-bold': hasChanged()}">
            {{ totalFee }}
            {{ environmentContext.getBtcTicker() }}
          </span>
          <span class="text-bw-400" :class="{ 'font-weight-bold': hasChanged()}">
            USD {{ toUSD(totalFee) }}
          </span>
        </div>
      </v-col>
    </v-row>
    <div class="ga-2">
      <div class="mb-4">Destination Bitcoin Address</div>
      <div v-if="isFlyover">
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
        <v-alert v-show="showAddressWarning"
          variant="text" type="warning" density="compact"
          class="text-body-1 px-0 pt-1 mb-0" prominent>
          <template #prepend>
            <v-icon size="small" :icon="mdiInformationOutline" />
          </template>
          Invalid address. Please note that native segwit is not supported at this time.
        </v-alert>
      </div>
      <template v-else>
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
        <v-alert
          variant="text" type="warning" density="compact" class="text-body-1 px-0 pt-1" prominent>
          <template #prepend>
            <v-icon size="small" :icon="mdiInformationOutline" />
          </template>
          <span>Follow
            <a :href=constants.DERIVE_BTC_ADDRESS_DOCUMENTATION_URL
              class="d-inline a" target='_blank'>
              this steps
            </a>
            to view and access your {{ environmentContext.getBtcTicker() }} funds.
          </span>
        </v-alert>
      </template>
    </div>
  </v-card>
</template>

<script lang="ts">
import {
  computed, defineComponent, PropType, ref,
} from 'vue';
import {
  mdiSendOutline,
  mdiInformationOutline,
  mdiOpenInNew,
  mdiClockTimeThreeOutline,
  mdiContentCopy,
} from '@mdi/js';
import EnvironmentContextProviderService from '@/common/providers/EnvironmentContextProvider';
import { useAction, useState, useStateAttribute } from '@/common/store/helper';
import {
  SessionState, SatoshiBig, QuotePegOut2WP,
} from '@/common/types';
import * as constants from '@/common/store/constants';
import { blockConfirmationsToTimeString, validateAddress } from '@/common/utils';
import { EnvironmentAccessorService } from '@/common/services/enviroment-accessor.service';
import { PowPegMode } from '@/common/store/constants';

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
    const setBtcAddress = useAction('flyoverPegout', constants.FLYOVER_PEGOUT_ADD_BTC_ADDRESS);
    const fixedUSDDecimals = 2;
    const btcAddress = ref('');
    const isFlyover = computed(() => props.optionType === constants.pegoutType.FLYOVER);
    const tooltipText = 'Time is approximate and may vary due to block confirmation times and network congestion.';
    const quoteDiffPercentage = EnvironmentAccessorService.getEnvironmentVariables()
      .flyoverPegoutDiffPercentage;

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
          link: 'https://dev.rootstock.io/concepts/rif-suite/#meet-the-suite',
          color: '#FF9100',
        };
      }
      return {
        title: PowPegMode.NATIVE,
        label: 'Powered by PowPeg',
        subtitleBgColor: 'purple',
        link: 'https://dev.rootstock.io/rsk/architecture/powpeg/',
        color: '#9E75FF',
      };
    });

    const totalFee = computed(() => {
      if (props.quote) {
        let fee;
        if (isFlyover.value) {
          fee = props.quote.quote.callFee
            .plus(props.quote.quote.gasFee)
            .plus(props.quote.quote.productFeeAmount);
        } else {
          fee = props.quote.quote.gasFee
            .plus(props.quote.quote.productFeeAmount);
        }
        return fee.toRBTCTrimmedString();
      }
      return '';
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

    function hasChanged(): boolean {
      if (!isFlyover.value) {
        return false;
      }
      return (props.quoteDifference ?? 0) > quoteDiffPercentage;
    }

    function openLink(link: string) {
      window.open(link, '_blank');
    }

    function copyToClipboard() {
      navigator.clipboard.writeText(session.value.btcDerivedAddress || '');
    }

    return {
      mdiSendOutline,
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
      hasChanged,
      estimatedTimeToReceive,
      mdiOpenInNew,
      openLink,
      btcAddressPlaceholder,
      mdiClockTimeThreeOutline,
      totalFee,
      tooltipText,
      mdiContentCopy,
      copyToClipboard,
    };
  },
});
</script>
