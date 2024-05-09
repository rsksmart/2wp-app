<template>
  <v-container fluid>
    <v-row no-gutters justify="center">
      <v-col md="5" lg="4" xl="3" xxl="2">
        <v-row no-gutters>
          <div class="text-h1 mb-2 pa-4 bg-teal">You are</div>
        </v-row>
        <v-row no-gutters>
          <div class="text-h1 pa-4 bg-yellow">Done!</div>
        </v-row>
        <v-row no-gutters>
          <div class="pt-4">
            <span>
              You will receive {{ amount }} {{ symbol }} on your address
              <br>
            </span>
            <template>within the next 5-10 minutes.</template>
          </div>
        </v-row>
      </v-col>
      <v-col md="5" lg="4" xl="3" xxl="2">
        <v-row no-gutters>
          <p class="text-subtitle-1">Transaction ID</p>
        </v-row>
        <v-row no-gutters class="mb-4">
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
        <v-row no-gutters class="my-4">
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
import { PegInTxState, TxStatusType } from '@/common/types';
import EnvironmentContextProviderService from '@/common/providers/EnvironmentContextProvider';

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
  },
  setup(props) {
    const clearStatus = useAction('status', constants.STATUS_CLEAR);
    const router = useRouter();
    // TODO: Get tx type from state and REMOVE from route params
    // const txType = useGetter<TransactionType>('session', constants.SESSION_GET_TX_TYPE);
    const pegInTxState = useState<PegInTxState>('pegInTx');
    const environmentContext = EnvironmentContextProviderService.getEnvironmentContext();

    const amount = computed(() => pegInTxState.value.amountToTransfer.toBTCTrimmedString());
    const symbol = computed(() => (props.type === (TxStatusType.PEGIN).toLowerCase()
      ? environmentContext.getRbtcTicker()
      : environmentContext.getBtcTicker()));

    function goHome() {
      clearStatus();
      router.push({ name: 'Home' });
    }

    function toTxStatus() {
      router.push({ name: 'Status', params: { txId: props.txId } });
    }

    function copyToClipboard() {
      navigator.clipboard.writeText(props.txId);
    }

    return {
      mdiContentCopy,
      amount,
      symbol,
      pegInTxState,
      copyToClipboard,
      goHome,
      toTxStatus,
    };
  },
});
</script>
