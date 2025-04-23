<template>
  <v-container fluid>
    <v-row no-gutters justify="center">
      <v-col md="5" lg="4" xl="3" xxl="2">
        <v-row no-gutters>
          <div class="text-h1 mb-2 pa-4 bg-teal">You are</div>
        </v-row>
        <v-row no-gutters class="mb-8">
          <div class="text-h1 pa-4 bg-yellow">Done!</div>
        </v-row>
        <v-row no-gutters>
          <div>
            <span>{{ amountToReceive }}</span><br>
            on your address
            <span v-if="estimatedTime">within the next</span><br>
            <span>{{ estimatedTime }}</span>
          </div>
        </v-row>
      </v-col>
      <v-col md="5" lg="4" xl="3" xxl="2">
        <v-row no-gutters>
          <p class="text-subtitle-1">Transaction ID</p>
        </v-row>
        <v-row no-gutters class="mb-8">
          <v-text-field
            density="comfortable"
            variant="outlined"
            :placeholder="txId"
            readonly
          >
            <template #append-inner >
              <v-icon size="x-small" :icon="mdiContentCopy" @click="copyToClipboard" />
            </template>
          </v-text-field>
        </v-row>
        <v-row no-gutters class="my-4 mt-8">
          <v-btn-rsk block @click="toTxStatus">See Transaction</v-btn-rsk>
        </v-row>
        <v-row no-gutters>
          <v-btn-rsk block @click="goHome">Start Again</v-btn-rsk>
        </v-row>
      </v-col>
    </v-row>
  </v-container>
</template>

<script lang="ts">
import { mdiContentCopy } from '@mdi/js';
import { defineComponent, computed, PropType } from 'vue';
import { useAction, useState } from '@/common/store/helper';
import * as constants from '@/common/store/constants';
import { useRouter } from 'vue-router';
import { PegInTxState, SatoshiBig, TxStatusType } from '@/common/types';
import EnvironmentContextProviderService from '@/common/providers/EnvironmentContextProvider';
import { blockConfirmationsToTimeString } from '@/common/utils';

export default defineComponent({
  name: 'SuccessTx',
  props: {
    type: {
      type: String as PropType<TxStatusType>,
      required: true,
    },
    txId: {
      type: String,
      required: true,
    },
    amount: {
      type: String,
      required: true,
    },
    confirmations: {
      type: Number,
      required: true,
    },
  },
  setup(props) {
    const clearStatus = useAction('status', constants.STATUS_CLEAR);
    const router = useRouter();
    const pegInTxState = useState<PegInTxState>('pegInTx');
    const environmentContext = EnvironmentContextProviderService.getEnvironmentContext();

    const amountToReceive = computed(() => {
      const amount = new SatoshiBig(props.amount, 'satoshi');
      const amountText = `${amount.toBTCTrimmedString()}
        ${environmentContext.getBtcTicker()}`;
      return `You will receive ${amountText}`;
    });

    const estimatedTime = computed(() => {
      switch (props.type.toUpperCase()) {
        case TxStatusType.PEGIN:
          return '17 hours';
        case TxStatusType.PEGOUT:
          return '34 hours';
        case TxStatusType.FLYOVER_PEGIN:
          return `${blockConfirmationsToTimeString(props.confirmations ?? 0, 'btc')}`;
        case TxStatusType.FLYOVER_PEGOUT:
          return `${blockConfirmationsToTimeString(props.confirmations ?? 0, 'rsk')}`;
        default:
          return '';
      }
    });

    function goHome() {
      clearStatus();
      router.push({ name: 'Home' });
    }

    function toTxStatus() {
      router.push({ name: 'Status', params: { txId: props.txId, txType: props.type } });
    }

    function copyToClipboard() {
      navigator.clipboard.writeText(props.txId);
    }

    return {
      mdiContentCopy,
      amountToReceive,
      estimatedTime,
      pegInTxState,
      copyToClipboard,
      goHome,
      toTxStatus,
    };
  },
});
</script>
