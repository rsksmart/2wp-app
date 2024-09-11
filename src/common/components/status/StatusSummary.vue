<template>
  <v-row>
    <h2 class="mt-4 mb-2 w-100 text-center">Summary</h2>
  </v-row>
  <v-row class="rounded-lg py-8 px-4 border-md">
    <v-col :order="columnOrder.btc" cols="6" class="d-flex flex-column ga-4">
      <div class="pb-4">
        <h3 class="text-h3 pa-1 pb-2 bg-orange d-inline-block">
          Bitcoin
        </h3>
      </div>
      <div v-for="({title, value, ticker, link}) in btcSide" :key="title"
        class="d-flex flex-column ga-1">
        <span>{{ title }}</span>
        <div class="d-flex align-center bg-surface py-2 px-4 rounded-lg border">
          <span class="text-h4">{{ value?.length > 18 ? truncateString(value) : value }}</span>
          <v-spacer />
          <v-chip v-if="ticker" :prepend-icon="mdiBitcoin" class="btc-icon">
            {{ environmentContext.getBtcTicker() }}
          </v-chip>
          <template v-else>
            <v-btn height="32" width="32" :disabled="value === '-'"
                   variant="plain" @click="copyToClipboard(value)" density="compact"
                   :icon="mdiContentCopy">
            </v-btn>
            <v-btn v-if="link" height="32" width="32" :disabled="value === '-'" variant="plain"
                   :href="link" target="_blank" density="compact" :icon="mdiOpenInNew" >
            </v-btn>
          </template>
        </div>
      </div>
    </v-col>
    <v-col :order="columnOrder.rsk" cols="6" class="d-flex flex-column ga-4">
      <div class="pb-4">
        <h3 class="text-h3 pa-1 pb-2 bg-green d-inline-block">
          Rootstock
        </h3>
      </div>
      <div v-for="({title, value, ticker, link}) in rskSide" :key="title"
        class="d-flex flex-column ga-1">
        <span>{{ title }}</span>
        <div class="d-flex align-center bg-surface py-2 px-4
          rounded-lg border">
          <span class="text-h4">{{ value?.length > 18 ? truncateString(value) : value }}</span>
          <v-spacer />
          <v-chip v-if="ticker" class="pl-2 pr-3">
                <v-avatar class="mr-2 rbtc-icon">
                  <v-img :src="require('@/assets/exchange/rbtc.png')" />
                </v-avatar>
              {{ environmentContext.getRbtcTicker() }}
          </v-chip>
          <template v-else>
            <v-btn height="32" width="32" :disabled="value === '-'" variant="plain"
                   @click="copyToClipboard(value)" density="compact" :icon="mdiContentCopy">
            </v-btn>
            <v-btn v-if="link" height="32" width="32" :disabled="value === '-'"
              variant="plain" :href="link" target="_blank" density="compact" :icon="mdiOpenInNew">
            </v-btn>
          </template>
        </div>
      </div>
    </v-col>
  </v-row>
</template>

<script lang="ts">
import { computed, defineComponent } from 'vue';
import {
  mdiBitcoin, mdiArrowRight, mdiArrowLeft, mdiOpenInNew, mdiContentCopy,
} from '@mdi/js';
import EnvironmentContextProviderService from '@/common/providers/EnvironmentContextProvider';
import { TxStatus, TxStatusType } from '@/common/types';
import {
  getBtcAddressExplorerUrl,
  getBtcTxExplorerUrl,
  getRskAddressExplorerUrl,
  getRskTxExplorerUrl,
  truncateString,
  copyToClipboard,
} from '@/common/utils';
import { useState } from '@/common/store/helper';

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
    withTxIds: {
      type: Boolean,
      default: true,
    },
    txWithErrorType: Boolean,
    txWithError: Boolean,
  },
  setup(props) {
    const environmentContext = EnvironmentContextProviderService.getEnvironmentContext();
    const columnOrder = computed(
      () => (props.type === TxStatusType.PEGOUT || props.type === TxStatusType.FLYOVER_PEGOUT
        ? { btc: 12, rsk: 1 } : { btc: 1, rsk: 12 }),
    );
    const status = useState<TxStatus>('status');

    const btcSide = computed(() => {
      if (props.type === TxStatusType.PEGOUT || props.type === TxStatusType.FLYOVER_PEGOUT) {
        const fee = props.details.fee === 0 ? props.details.estimatedFee : props.details.fee;
        return [
          {
            title: 'Recipient Address',
            value: props.details.recipientAddress && !props.txWithError
              ? props.details.recipientAddress : '-',
            link: getBtcAddressExplorerUrl(props.details.recipientAddress),
          },
          {
            title: 'Transaction ID',
            value: props.details.btcTxId && !props.txWithError
              ? props.details.btcTxId : '-',
            link: getBtcTxExplorerUrl(props.details.btcTxId),
          },
          {
            title: props.details.fee === 0 ? 'Estimated Fee' : 'Fee',
            value: status.value.type === TxStatusType.FLYOVER_PEGOUT || props.txWithError ? '-' : fee,
            ticker: true,
          },
          {
            title: 'You receive',
            value: props.txWithError ? '-' : props.details.amountReceivedString,
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
        ...(props.withTxIds ? [{
          title: 'Transaction ID',
          value: props.details.txId || '-',
          link: getBtcTxExplorerUrl(props.details.txId),
        }] : []),
        {
          title: props.details && props.type === TxStatusType.FLYOVER_PEGIN
            ? 'Fee (includes provider and network fees)' : 'Fee',
          value: props.details.fee,
          ticker: true,
        },
        {
          title: 'You send',
          value: props.details.total,
          ticker: true,
        },
      ];
    });

    const rskSide = computed(() => {
      if (props.type === TxStatusType.PEGOUT || props.type === TxStatusType.FLYOVER_PEGOUT) {
        const gasFee = props.details.gas?.gt(0) ? props.details.gas.toRBTCTrimmedString() : '-';
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
            title: props.type === TxStatusType.FLYOVER_PEGOUT
              ? 'Fee (includes provider and network fees)' : 'Fee',
            value: status.value.type === TxStatusType.FLYOVER_PEGOUT
              ? props.details.fee
              : gasFee,
            ticker: true,
          },
          {
            title: 'You send',
            value: props.details.amountFromString,
            ticker: true,
          }];
      }
      return [
        {
          title: 'Recipient Address',
          value: props.details.recipientAddress && !props.txWithError
            ? props.details.recipientAddress : '-',
          link: getRskAddressExplorerUrl(props.details.recipientAddress),
        },
        ...(props.withTxIds ? [{
          title: 'Transaction ID',
          value: props.details.rskTxId && !props.txWithError
            ? props.details.rskTxId : '-',
          link: getRskTxExplorerUrl(props.details.rskTxId),
        }] : []),
        {
          title: 'Fee',
          value: '-',
          ticker: true,
        },
        {
          title: 'You receive',
          value: props.details.amountReceivedString && !props.txWithError
            ? props.details.amountReceivedString : '-',
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
      mdiContentCopy,
      copyToClipboard,
    };
  },
});
</script>
<style scoped>
.v-col.order-12 {
  padding-left: 20px;
  box-shadow: inset 1px 0 rgb(var(--v-theme-bw-500));
}
.v-col.order-1 {
  padding-right: 20px;
}
</style>
