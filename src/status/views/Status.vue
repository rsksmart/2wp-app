<template>
  <v-container class="status d-flex justify-center">
    <v-col xs="10" sm="8" md="7" lg="5" xl="5" class="d-flex space-between flex-column">
      <v-row no-gutters class="d-flex justify-start">
        <span class="text-h2 pa-2 bg-purple">Transaction </span>
        <span class="text-h2 pa-2 ml-2 bg-orange">Status</span>
      </v-row>
      <v-row no-gutters class="mt-5 mb-2">
        <span>Transaction ID</span>
      </v-row>
      <v-row no-gutters :class="`mb-4 px-4 py-2 d-flex align-center border-md
        rounded-lg border-opacity-0 tx-id-input ${inputClassByTheme()}`">
        <v-col>
          <v-text-field variant="plain" density="compact" hide-details flat
          v-model="txId" @keydown.enter="getPegStatus"
          :rules="[rules.required, rules.valid]" />
        </v-col>
        <template v-if="!typingSearch">
          <v-col cols="auto">
            <v-btn height="24" width="24" variant="plain" class="ml-2"
              @click="copyToClipboard(txId)" density="compact" :icon="mdiContentCopy" />
          </v-col>
          <v-col cols="auto">
            <v-btn v-if="!txNotFound" height="24" width="24"
              density="compact" class="ml-1" :href="txIdExplorerLink" target="_blank"
              variant="plain" :icon="mdiOpenInNew" />
          </v-col>
          <v-col cols="auto">
            <v-btn v-if="!txNotFound" height="24" width="24" density="compact" class="ml-1 mx-1"
              @click="resetTxIdClean" variant="plain" :icon="mdiClose" />
          </v-col>
        </template>
        <v-col cols="auto">
          <v-btn class="text-none ml-2" color="emphasis"
            variant="outlined" @click="getPegStatus" rounded>
              <span class="btn-label">{{ btnLabel }}</span>
          </v-btn>
        </v-col>
      </v-row>
      <template v-if="!isValidTxId && txId !== ''">
        <v-row no-gutters>
          <span class="error pl-1 mt-n3">{{ notValidTxIdMessage }}</span>
        </v-row>
      </template>
      <v-row no-gutters>
        <span class="text-body-2" v-if="!txId">
          To see a transaction's status input or paste the Transaction ID
          in the field above.
        </span>
      </v-row>
      <template v-if="!typingSearch">
        <v-row no-gutters v-if="showStatus">
          <div class="border-sm mb-5 pa-5 rounded-lg border-opacity-100 w-100">
            <tx-pegin v-if="isPegIn" :txId="txId" :isFlyover="isFlyover"
              :txNotFound="txNotFound" :txWithError="txWithError" />
            <tx-pegout v-if="isPegOut" :txId="txId" :isFlyover="isFlyover"
              :txNotFound="txNotFound" :txWithError="txWithError" />
            <status-progress-bar v-if="invalidData || unexpectedError || blockBookError"
              class="mb-4 pb-8" :isFlyover="isFlyover" :txNotFound="txNotFound"
              :txWithError="txWithError" />
          </div>
        </v-row>
        <v-row v-else>
          <v-progress-circular
            class="ma-auto mb-5"
            :size="250"
            :width="18"
            color="warning"
            indeterminate>
            Searching...
          </v-progress-circular>
        </v-row>
      </template>
      <v-row class="d-flex justify-center mt-5">
        <v-btn-rsk :href="'https://rootstock.io/ecosystem/'" target="_blank" rel="noopener" size="x-large">
          Explore Ecosystem
        </v-btn-rsk>
      </v-row>
    </v-col>
  </v-container>
</template>

<script lang="ts">
import {
  computed, ref, watch, defineComponent, onUnmounted,
} from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { mdiOpenInNew, mdiContentCopy, mdiClose } from '@mdi/js';
import TxPegout from '@/common/components/status/TxPegout.vue';
import TxPegin from '@/common/components/status/TxPegin.vue';
import {
  PegoutStatus, TxStatusType,
  PegoutStatusDataModel, TxStatus, TxStatusMessage, PeginStatus,
} from '@/common/types';
import * as constants from '@/common/store/constants';
import {
  useAction, useGetter,
  useState, useStateAttribute,
} from '@/common/store/helper';
import StatusProgressBar from '@/common/components/status/StatusProgressBar.vue';
import { PegStatus } from '@/common/store/constants';
import {
  copyToClipboard, getBtcTxExplorerUrl,
  getRskTxExplorerUrl,
} from '@/common/utils';
import { useTheme } from 'vuetify/lib/framework.mjs';

export default defineComponent({
  name: 'StatusSearch',
  components: {
    StatusProgressBar,
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
    const typingSearch = ref(true);
    const route = useRoute();
    const router = useRouter();

    const { global: { current } } = useTheme();

    const status = useState<TxStatus>('status');

    const setTxStatus = useAction('status', constants.STATUS_GET_TX_STATUS);
    const clearStatus = useAction('status', constants.STATUS_CLEAR);
    const activeMessage = useGetter<TxStatusMessage>('status', constants.STATUS_GET_ACTIVE_MESSAGE);
    const txDetails = useStateAttribute<PegoutStatusDataModel|PeginStatus>('status', 'txDetails');

    const showStatus = computed(() => !loading.value);

    const invalidData = computed(() => status.value.type === TxStatusType.INVALID_DATA);
    const unexpectedError = computed(() => status.value.type === TxStatusType.UNEXPECTED_ERROR);
    const blockBookError = computed(() => status.value.type === TxStatusType.BLOCKBOOK_FAILED);

    const isFlyover = computed((): boolean => status.value.type === TxStatusType.FLYOVER_PEGOUT
      || status.value.type === TxStatusType.FLYOVER_PEGIN);
    const quoteNotFound = computed(() => isFlyover.value
      && status.value.flyoverStatus?.status === TxStatusType.NOT_FOUND);

    const txNotFound = computed((): boolean => invalidData.value
      || unexpectedError.value
      || quoteNotFound.value
      || blockBookError.value);

    const isRejected = computed(() => status.value.txDetails?.status === 'REJECTED' || txNotFound.value);

    const isPegIn = computed((): boolean => status.value.type === TxStatusType.PEGIN
      || status.value.type === TxStatusType.FLYOVER_PEGIN);

    const isPegOut = computed((): boolean => status.value.type === TxStatusType.PEGOUT
      || status.value.type === TxStatusType.FLYOVER_PEGOUT);

    const showTimeLeft = computed((): boolean => {
      const details = txDetails.value as PegoutStatusDataModel;
      return status.value.type === TxStatusType.PEGOUT
          && (details.status === PegoutStatus.PENDING
          || details.status === PegoutStatus.WAITING_FOR_CONFIRMATION
          || details.status === PegoutStatus.RECEIVED
          || details.status === PegoutStatus.WAITING_FOR_SIGNATURE);
    });

    const txWithError = computed(() => {
      if (txNotFound.value) return false;
      const { status: errorStatus } = txDetails.value;
      return errorStatus as PegStatus === PegStatus.REJECTED_REFUND
        || errorStatus as PegStatus === PegStatus.REJECTED_NO_REFUND
        || errorStatus as PegStatus === PegStatus.ERROR_BELOW_MIN
        || errorStatus as PegStatus === PegStatus.ERROR_NOT_A_PEGIN
        || errorStatus as PegStatus === PegStatus.ERROR_UNEXPECTED
        || errorStatus as PegoutStatus === PegoutStatus.NOT_PEGOUT_TX
        || errorStatus as PegoutStatus === PegoutStatus.NOT_FOUND
        || errorStatus as PegoutStatus === PegoutStatus.REJECTED;
    });

    const rules = {
      required: (value: string) => !!value || 'Required.',
      valid: (value: string) => (/^(0x[a-fA-F0-9]{64}|[a-fA-F0-9]{64})$/.test(value))
        || 'Invalid Transaction Id.',
    };

    function regexValidationTxId(): boolean {
      const regex = /^(0x[a-fA-F0-9]{64}|[a-fA-F0-9]{64})$/;
      return regex.test(txId.value);
    }

    const isValidTxId = computed(() => regexValidationTxId());

    const btnLabel = computed(() => (!typingSearch.value && showStatus ? 'Refresh' : 'Show status'));

    const txIdExplorerLink = computed(() => (isPegOut.value
      ? getRskTxExplorerUrl(txId.value)
      : getBtcTxExplorerUrl(txId.value)));

    function clean() {
      clearStatus();
      loading.value = false;
      typingSearch.value = true;
    }

    const notValidTxIdMessage = computed((): string => {
      let message = '';
      if (!regexValidationTxId()) {
        message = 'The transaction id must be a valid one.';
        clean();
      }
      return message;
    });

    function getPegStatus() {
      if (!isValidTxId.value) clean();
      else if (route.path !== `/status/txId/${txId.value}`) {
        router.push({
          name: 'Status',
          params: { txId: txId.value },
        });
      } else if (txId.value !== '' && isValidTxId.value) {
        clean();
        typingSearch.value = false;
        loading.value = true;
        setTxStatus(txId.value)
          .then(() => {
            loading.value = false;
          })
          .catch(() => {
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

    function resetTxIdClean() {
      txId.value = '';
      clean();
    }

    function inputClassByTheme() {
      return `input-bg-${current.value.dark ? 'dark' : 'light'}`;
    }

    watch(route, onUrlChange, { immediate: true, deep: true });

    clearStatus();

    onUnmounted(clean);

    return {
      txId,
      isValidTxId,
      getPegStatus,
      notValidTxIdMessage,
      activeMessage,
      showStatus,
      showTimeLeft,
      isPegIn,
      isRejected,
      isPegOut,
      isFlyover,
      back,
      mdiOpenInNew,
      mdiContentCopy,
      rules,
      txNotFound,
      txWithError,
      invalidData,
      blockBookError,
      unexpectedError,
      typingSearch,
      loading,
      btnLabel,
      copyToClipboard,
      txIdExplorerLink,
      mdiClose,
      resetTxIdClean,
      inputClassByTheme,
    };
  },
});
</script>

<style scoped>
  .text-body-2 {
    font-size: 14px;
    line-height: 18px;
    letter-spacing: -1%;
    font-weight: 400;
  }
  .tx-id-input {
    border-radius: 10px;
    border-width: 1px;
    font-weight: 400;
    font-size: 17.5px;
    line-height: 21px;
    letter-spacing: 0%;
  }
  .input-bg-dark {
    background-color: rgb(var(--v-theme-bw-700), 0.7) !important;
  }
  .input-bg-light {
    border: 1px solid black !important;
  }
  .btn-label {
    font-weight: 500;
    font-size: 14px;
    line-height: 16px;
    letter-spacing: 0%;
  }
  .error {
    color: #D80027 !important;
    font-size: 12px;
    line-height: 14px;
    letter-spacing: -1%;
    font-weight: 400;
  }
  ::v-deep(.v-field.v-field--focused) {
    box-shadow: none !important;
    border: none !important;
  }
  ::v-deep(.v-field__input) {
    padding-top: 0 !important;
  }
</style>
