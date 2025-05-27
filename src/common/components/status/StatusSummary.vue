<template>
  <v-container class="py-0 mt-8">
    <v-row no-gutters>
      <v-col :order="columnOrder.btc" cols="6">
        <div v-for="({title, value, link}) in btcSide" :key="title" class="custom-input">
          <v-row no-gutters>
            <span>{{ title }}</span>
          </v-row>
          <v-row no-gutters class="mt-3 mb-2">
            <v-col class="pa-0">
              <span class="bold">{{ value?.length > 18
                ? truncateStringToSize(value, 6) : value }}</span>
            </v-col>
            <v-col col="auto" class="pa-0 d-flex justify-end">
              <v-btn height="24" width="24" :disabled="value === '-'" variant="plain" small
                  @click="copyToClipboard(value)" density="compact" :icon="mdiContentCopy">
              </v-btn>
              <v-btn  height="24" width="24" :disabled="value === '-'"  class="pl-4 mr-2"
                variant="plain" :href="link" target="_blank" density="compact" :icon="mdiOpenInNew">
              </v-btn>
            </v-col>
          </v-row>
        </div>
      </v-col>
      <v-col :order="columnOrder.rsk" cols="6">
        <div v-for="({title, value, link}) in rskSide" :key="title" class="custom-input">
          <v-row no-gutters>
            <span>{{ title }}</span>
          </v-row>
          <v-row no-gutters class="mt-3 mb-2">
            <v-col class="pa-0">
              <span class="bold">{{ value?.length > 18
                ? truncateStringToSize(value, 6) : value }}</span>
            </v-col>
            <v-col col="auto" class="pa-0 d-flex justify-end">
              <v-btn height="24" width="24" :disabled="value === '-'" variant="plain"
                  @click="copyToClipboard(value)" density="compact" :icon="mdiContentCopy">
              </v-btn>
              <v-btn v-if="link" height="24" width="24" :disabled="value === '-'" class="pl-2 mr-2"
                variant="plain" :href="link" target="_blank" density="compact" :icon="mdiOpenInNew">
              </v-btn>
            </v-col>
          </v-row>
        </div>
      </v-col>
    </v-row>
  </v-container>
</template>

<script lang="ts">
import { computed, defineComponent } from 'vue';
import {
  mdiOpenInNew, mdiContentCopy,
} from '@mdi/js';
import {
  TxStatusType,
} from '@/common/types';
import {
  getBtcAddressExplorerUrl,
  getRskAddressExplorerUrl,
  truncateStringToSize,
  copyToClipboard,
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
    withTxIds: {
      type: Boolean,
      default: true,
    },
    txWithErrorType: Boolean,
    txWithError: Boolean,
  },
  setup(props) {
    const columnOrder = computed(
      () => (props.type === TxStatusType.PEGOUT || props.type === TxStatusType.FLYOVER_PEGOUT
        ? { btc: 12, rsk: 1 } : { btc: 1, rsk: 12 }),
    );

    const btcSide = computed(() => {
      if (props.type === TxStatusType.PEGOUT || props.type === TxStatusType.FLYOVER_PEGOUT) {
        return [
          {
            title: 'Recipient Address',
            value: props.details.recipientAddress && !props.txWithError
              ? props.details.recipientAddress : '-',
            link: getBtcAddressExplorerUrl(props.details.recipientAddress),
          },
        ];
      }
      return [
        {
          title: 'Sender Address',
          value: props.details.senderAddress || '-',
          link: getBtcAddressExplorerUrl(props.details.senderAddress),
        },
      ];
    });

    const rskSide = computed(() => {
      if (props.type === TxStatusType.PEGOUT || props.type === TxStatusType.FLYOVER_PEGOUT) {
        return [
          {
            title: 'Sender Address',
            value: props.details.senderAddress || '-',
            link: getRskAddressExplorerUrl(props.details.senderAddress),
          },
        ];
      }
      return [
        {
          title: 'Recipient Address',
          value: props.details.recipientAddress && !props.txWithError
            ? props.details.recipientAddress : '-',
          link: getRskAddressExplorerUrl(props.details.recipientAddress),
        },
      ];
    });

    return {
      rskSide,
      btcSide,
      columnOrder,
      mdiOpenInNew,
      truncateStringToSize,
      mdiContentCopy,
      copyToClipboard,
    };
  },
});
</script>
<style scoped>
  .v-col.order-1 {
    padding-right: 16px;
  }
  .v-col.order-12 {
    padding-left: 16px;
  }
  .custom-input {
    border-bottom: 1px solid rgb(var(--v-theme-bw-600)) !important;
    font-size: 14px;
    line-height: 14px;
    font-weight: 500;
  }
  .bold {
    font-weight: 700;
    font-size: 18px;
    line-height: 24px;
  }
</style>
