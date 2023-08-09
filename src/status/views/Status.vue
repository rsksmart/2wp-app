<template>
  <v-container fluid class="px-0 mx-0 max-width">
    <v-col>
      <v-container class="transactions ma-0 pa-0">
        <v-row class="mx-0 mb-5 d-flex justify-center">
          <h1 class="text-center">Transaction status</h1>
        </v-row>
        <v-row class="mx-0 mt-10 mb-4" justify="center">
          <p class="subtitle">Enter the
            transaction id in the textbox below
            to check the status of the operation</p>
        </v-row>
        <v-row justify="center" class="mx-0">
          <v-col cols="7" md="8" xl="7" lg="7" class="pa-0">
            <v-row>
              <v-text-field hide-details density="compact" variant="outlined"
                v-model="txId"
                label="Transaction id" />
              <v-btn :disabled="!isValidTxId" :icon="mdiMagnify" class="mx-2"
                style="opacity: 1;" variant="text"
                @click="getPegStatus" @keyup.enter="getPegStatus">
              </v-btn>
            </v-row>
            <v-row v-if="!isValidTxId && txId" class="mx-0 pl-1 pt-1">
              <span class="yellowish">
                {{ notValidTxIdMessage }}
              </span>
            </v-row>
            <v-row class="mx-0 pl-1 pt-1" v-if="activeMessage.error && isValidTxId
              && txId === txIdProp">
              <span class="redish">
                {{ activeMessage.errorMessage }}
              </span>
            </v-row>
          </v-col>
        </v-row>
        <v-row justify="center" v-if="showStatus" class="mx-0 mt-12 mb-6">
          <div class="mt-4 mb-0 status text-center" :class="activeMessage.activeMessageStyle">
            {{ activeMessage.statusMessage }}
            <v-row v-if="showTimeLeft" class="mt-1 mb-0 text-center d-flex justify-center">
              <p class="subtitle blueish">Estimated time: {{ releaseTimeText }}</p>
            </v-row>
          </div>
        </v-row>
      </v-container>
      <v-container fluid class="transactions pa-0">
        <tx-pegin v-if="!activeMessage.isRejected
          && isPegIn
          && !activeMessage.error" :txId="txId" />
        <tx-pegout v-if="((!activeMessage.isRejected
          && !activeMessage.error)
          || isRejected)
          && isPegOut" :txId="txId" />
        <v-row justify="center" class="mx-0 mt-5">
          <v-col cols="2" class="d-flex justify-start pa-0 ma-0">
            <v-btn rounded variant="outlined" color="#000000" width="110" @click="back">
              <span>Go home</span>
            </v-btn>
          </v-col>
          <v-col cols="10" class="d-flex justify-end ma-0 py-0 pl-0">
            <v-btn v-if="!activeMessage.isRejected && showStatus" class="px-5"
              width="117" color="#000000" rounded
              @click="getPegStatus">
              <span class="whiteish">Refresh</span>
            </v-btn>
          </v-col>
        </v-row>
      </v-container>
    </v-col>
  </v-container>
</template>

<script lang="ts">
import {
  computed, ref, watch, defineComponent,
} from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { mdiMagnify } from '@mdi/js';
import TxPegout from '@/common/components/status/TxPegout.vue';
import TxPegin from '@/common/components/status/TxPegin.vue';
import {
  PegoutStatus, TxStatusType,
  PegoutStatusDataModel, TxStatus, TxStatusMessage,
} from '@/common/types';
import * as constants from '@/common/store/constants';
import { useAction, useGetter, useState } from '@/common/store/helper';

export default defineComponent({
  name: 'StatusSearch',
  components: {
    TxPegout,
    TxPegin,
  },
  props: {
    txIdProp: {
      type: String,
      default: '',
    },
  },
  setup(props) {
    const txId = ref('');
    const loading = ref(false);
    const route = useRoute();
    const router = useRouter();

    const status = useState<TxStatus>('status');

    const setTxStatus = useAction('status', constants.STATUS_GET_TX_STATUS);
    const clearStatus = useAction('status', constants.STATUS_CLEAR);
    const getBtcPrice = useAction('pegInTx', constants.PEGIN_TX_ADD_BITCOIN_PRICE);
    const activeMessage = useGetter<TxStatusMessage>('status', constants.STATUS_GET_ACTIVE_MESSAGE);
    const releaseTimeText = useGetter<string>('status', constants.STATUS_GET_RELEASE_TIME_TEXT);

    const showStatus = computed(() => !loading.value
        && !activeMessage.value.error
        && !!activeMessage.value.statusMessage);

    const isRejected = computed(() => status.value.txDetails?.status === 'REJECTED');

    const isPegIn = computed((): boolean => status.value.type === TxStatusType.PEGIN);

    const isPegOut = computed((): boolean => status.value.type === TxStatusType.PEGOUT);

    const showTimeLeft = computed((): boolean => {
      const txDetails = status.value.txDetails as PegoutStatusDataModel;
      return status.value.type === TxStatusType.PEGOUT
          && (txDetails.status === PegoutStatus.WAITING_FOR_CONFIRMATION
          || txDetails.status === PegoutStatus.RECEIVED
          || txDetails.status === PegoutStatus.WAITING_FOR_SIGNATURE);
    });

    function regexValidationTxId(): boolean {
      const regex = /^(0x[a-fA-F0-9]{64}|[a-fA-F0-9]{64})$/;
      return regex.test(txId.value);
    }

    const isValidTxId = computed(() => regexValidationTxId());
    const notValidTxIdMessage = computed((): string => {
      let message = '';
      if (!regexValidationTxId()) {
        message = 'The transaction id must be a valid one.';
      }
      return message;
    });

    const activeClass = computed((): string => {
      let activeClass = '';
      if (!isValidTxId.value && txId.value) {
        activeClass = 'status-text-field-warning';
      } else if (activeMessage.value.error && txId.value && txId.value === props.txIdProp) {
        activeClass = 'status-text-field-error';
      }
      return activeClass;
    });

    function clean() {
      clearStatus();
      loading.value = false;
    }

    function getPegStatus() {
      if (route.path !== `/status/txId/${txId.value}`) {
        router.push({
          name: 'Status',
          params: { txId: txId.value },
        });
      } else if (txId.value !== '') {
        clean();
        loading.value = true;
        setTxStatus(txId.value)
          .then(() => {
            loading.value = false;
          });
      }
    }

    function onUrlChange() {
      if (props.txIdProp) {
        txId.value = props.txIdProp ?? '';
        getPegStatus();
      } else {
        clean();
      }
    }

    function back() {
      router.replace({ name: 'Home' });
    }

    watch(route, onUrlChange, { immediate: true, deep: true });

    clearStatus();
    getBtcPrice();

    return {
      txId,
      activeClass,
      isValidTxId,
      getPegStatus,
      notValidTxIdMessage,
      activeMessage,
      showStatus,
      showTimeLeft,
      releaseTimeText,
      isPegIn,
      isRejected,
      isPegOut,
      back,
      mdiMagnify,
    };
  },
});
</script>