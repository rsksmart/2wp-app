<template>
  <v-row>
    <h2 class="mt-4 mb-2 w-100 text-center">Summary</h2>
  </v-row>
  <v-row class="rounded-lg py-8 px-4 border-md">
    <v-col :order="columnOrder.btc" cols="auto" class="d-flex flex-column ga-4 flex-grow-1">
      <div class="pb-4">
        <h3 class="text-h3 pa-1 pb-2 bg-orange d-inline-block">
          Bitcoin
        </h3>
      </div>
      <div v-for="({title, value, ticker, link}) in btcSide" :key="title"
        class="d-flex flex-column ga-1">
        <span>{{ title }}</span>
        <div class="d-flex align-center justify-space-between bg-surface py-2 px-4
          rounded-lg border">
          <span class="text-h4">{{ value?.length > 18 ? truncateString(value) : value }}</span>
          <v-chip v-if="ticker" :prepend-icon="mdiBitcoin" class="btc-icon">
            {{ environmentContext.getBtcTicker() }}
          </v-chip>
          <v-btn v-else-if="link" height="32" :disabled="value === '-'"
            variant="plain" :href="link" target="_blank" density="compact" :icon="mdiOpenInNew">
          </v-btn>
        </div>
      </div>
    </v-col>
    <v-col order="6" cols="auto">
      <v-divider vertical class="border-opacity-50" />
      </v-col>
    <v-col :order="columnOrder.rsk" cols="auto" class="d-flex flex-column ga-4 flex-grow-1">
      <div class="pb-4">
        <h3 class="text-h3 pa-1 pb-2 bg-green d-inline-block">
          Rootstock
        </h3>
      </div>
      <div v-for="({title, value, ticker, link}) in rskSide" :key="title"
        class="d-flex flex-column ga-1">
        <span>{{ title }}</span>
        <div class="d-flex align-center justify-space-between bg-surface py-2 px-4
          rounded-lg border">
          <span class="text-h4">{{ value?.length > 18 ? truncateString(value) : value }}</span>
          <v-chip v-if="ticker" class="pl-2 pr-3">
                <v-avatar class="mr-2 rbtc-icon">
                  <v-img :src="require('@/assets/exchange/rbtc.png')" />
                </v-avatar>
              {{ environmentContext.getRbtcTicker() }}
          </v-chip>
          <v-btn v-else-if="link" height="32" :disabled="value === '-'"
            variant="plain" :href="link" target="_blank" density="compact" :icon="mdiOpenInNew">
          </v-btn>
        </div>
      </div>
    </v-col>
  </v-row>
</template>

<script lang="ts">
import { computed, defineComponent } from 'vue';
import {
  mdiBitcoin, mdiArrowRight, mdiArrowLeft, mdiOpenInNew,
} from '@mdi/js';
import EnvironmentContextProviderService from '@/common/providers/EnvironmentContextProvider';
import { TxStatusType } from '@/common/types';
import {
  getBtcAddressExplorerUrl,
  getBtcTxExplorerUrl,
  getRskAddressExplorerUrl,
  getRskTxExplorerUrl,
  truncateString,
} from '@/common/utils';

export default defineComponent({
  name: 'StatusSummary',
  props: {
    details: {
      type: Object,
      required: true,
    },
    type: {
      type: String,
      required: true,
    },
  },
  setup(props) {
    const environmentContext = EnvironmentContextProviderService.getEnvironmentContext();
    const columnOrder = computed(
      () => (props.type === TxStatusType.PEGOUT ? { btc: 12, rsk: 1 } : { btc: 1, rsk: 12 }),
    );

    const btcSide = computed(() => {
      if (props.type === TxStatusType.PEGOUT) {
        return [
          {
            title: 'Recipient Address',
            value: props.details.recipientAddress || '-',
            link: getBtcAddressExplorerUrl(props.details.recipientAddress),
          },
          {
            title: 'Transaction ID',
            value: props.details.btcTxId || '-',
            link: getBtcTxExplorerUrl(props.details.btcTxId),
          },
          {
            title: 'You will receive',
            value: props.details.amountReceivedString,
            ticker: true,
          },
          {
            title: props.details.fee === 0 ? 'Estimated Fee' : 'Fee',
            value: props.details.fee === 0 ? props.details.estimatedFee : props.details.fee,
            ticker: true,
          },
          {
            title: 'Total',
            value: props.details.amountFromString,
            ticker: true,
          },
        ];
      }
      return [
        {
          title: 'Sender Address',
          value: props.details.senderAddress || '-',
          link: getBtcAddressExplorerUrl(props.details.senderAddress),
        },
        {
          title: 'Transaction ID',
          value: props.details.txId || '-',
          link: getBtcTxExplorerUrl(props.details.txId),
        },
        {
          title: 'You will send',
          value: props.details.amountFromString,
          ticker: true,
        },
        {
          title: 'Fee',
          value: props.details.fee,
          ticker: true,
        },
        {
          title: 'Total',
          value: props.details.total,
          ticker: true,
        },
      ];
    });

    const rskSide = computed(() => {
      if (props.type === TxStatusType.PEGOUT) {
        return [
          {
            title: 'Sender Address',
            value: props.details.senderAddress || '-',
            link: getRskAddressExplorerUrl(props.details.senderAddress),
          },
          {
            title: 'Transaction ID',
            value: props.details.txId || '-',
            link: getRskTxExplorerUrl(props.details.txId),
          },
          {
            title: 'You will send',
            value: props.details.amountFromString,
            ticker: true,
          },
          {
            title: 'Fee',
            value: '-',
            ticker: true,
          },
          {
            title: 'Total',
            value: '-',
            ticker: true,
          }];
      }
      return [
        {
          title: 'Recipient Address',
          value: props.details.recipientAddress || '-',
          link: getRskAddressExplorerUrl(props.details.recipientAddress),
        },
        {
          title: 'Transaction ID',
          value: props.details.rskTxId || '-',
          link: getRskTxExplorerUrl(props.details.rskTxId),
        },
        {
          title: 'You will receive',
          value: props.details.amountReceivedString,
          ticker: true,
        },
        {
          title: 'Fee',
          value: '0',
          ticker: true,
        },
        {
          title: 'Total',
          value: props.details.amountReceivedString,
          ticker: true,
        },
      ];
    });

    return {
      mdiBitcoin,
      mdiArrowRight,
      mdiArrowLeft,
      rskSide,
      btcSide,
      environmentContext,
      columnOrder,
      mdiOpenInNew,
      truncateString,
    };
  },
});
</script>
