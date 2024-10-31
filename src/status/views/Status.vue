<template>
  <v-container>
    <v-row no-gutters class="d-flex justify-start mx-6">
      <span class="text-h1 pa-2 bg-purple">Transaction </span>
      <span class="text-h1 pa-2 ml-2 bg-orange">Status</span>
    </v-row>
    <v-row no-gutters class="mt-16 mx-6">
      <span class="d-flex flex-0-0">Transaction id</span>
    </v-row>
    <v-row no-gutters class="mb-16 ml-6 mr-4">
      <v-text-field comfortable variant="outlined"
                    v-model="txId" @keydown.enter="getPegStatus"
                    :append-inner-icon="mdiMagnify"
                    @click:append-inner="getPegStatus"
                    :rules="[rules.required, rules.valid]"
                    @keyup.enter="getPegStatus" />
    </v-row>
    <v-row no-gutters v-if="showStatus && showTimeLeft" justify="center">
      <span class="text-bw-400 text-body-1">Estimated time: {{ releaseTimeText }}</span>
    </v-row>
    <v-row no-gutters v-if="showStatus">
      <tx-pegin v-if="isPegIn" :txId="txId" :isFlyover="isFlyover"
                :txWithErrorType="txWithErrorType" :txWithError="txWithError" />
      <tx-pegout v-if="isPegOut" :txId="txId" :isFlyover="isFlyover"
                :txWithErrorType="txWithErrorType" :txWithError="txWithError" />
      <status-progress-bar class="mt-4" v-if="txWithErrorType" :isFlyover="isFlyover"
                :txWithErrorType="txWithErrorType" :txWithError="txWithError" />
    </v-row>
    <v-row v-else>
    <v-progress-circular
        class="ma-auto"
        :size="250"
        :width="18"
        color="warning"
        indeterminate>
        Searching...
      </v-progress-circular>
    </v-row>
  </v-container>
</template>

<script lang="ts">
import {
  computed, ref, watch, defineComponent, onUnmounted,
} from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { mdiMagnify } from '@mdi/js';
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
    const route = useRoute();
    const router = useRouter();

    const status = useState<TxStatus>('status');

    const setTxStatus = useAction('status', constants.STATUS_GET_TX_STATUS);
    const clearStatus = useAction('status', constants.STATUS_CLEAR);
    const activeMessage = useGetter<TxStatusMessage>('status', constants.STATUS_GET_ACTIVE_MESSAGE);
    const releaseTimeText = useGetter<string>('status', constants.STATUS_GET_RELEASE_TIME_TEXT);
    const txDetails = useStateAttribute<PegoutStatusDataModel|PeginStatus>('status', 'txDetails');

    const showStatus = computed(() => !loading.value);

    const isRejected = computed(() => status.value.txDetails?.status === 'REJECTED');

    const isPegIn = computed((): boolean => status.value.type === TxStatusType.PEGIN
      || status.value.type === TxStatusType.FLYOVER_PEGIN);

    const isPegOut = computed((): boolean => status.value.type === TxStatusType.PEGOUT
      || status.value.type === TxStatusType.FLYOVER_PEGOUT);

    const isFlyover = computed((): boolean => status.value.type === TxStatusType.FLYOVER_PEGOUT
      || status.value.type === TxStatusType.FLYOVER_PEGIN);

    const txWithErrorType = computed((): boolean => status.value.type === TxStatusType.INVALID_DATA
      || status.value.type === TxStatusType.UNEXPECTED_ERROR);

    const showTimeLeft = computed((): boolean => {
      const details = txDetails.value as PegoutStatusDataModel;
      return status.value.type === TxStatusType.PEGOUT
          && (details.status === PegoutStatus.PENDING
          || details.status === PegoutStatus.WAITING_FOR_CONFIRMATION
          || details.status === PegoutStatus.RECEIVED
          || details.status === PegoutStatus.WAITING_FOR_SIGNATURE);
    });

    const txWithError = computed(() => {
      if (txWithErrorType.value) return true;
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
    const notValidTxIdMessage = computed((): string => {
      let message = '';
      if (!regexValidationTxId()) {
        message = 'The transaction id must be a valid one.';
      }
      return message;
    });

    const computedActiveClass = computed((): string => {
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
      if (!isValidTxId.value) clean();
      else if (route.path !== `/status/txId/${txId.value}`) {
        router.push({
          name: 'Status',
          params: { txId: txId.value },
        });
      } else if (txId.value !== '' && isValidTxId.value) {
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

    onUnmounted(clean);

    return {
      txId,
      computedActiveClass,
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
      isFlyover,
      back,
      mdiMagnify,
      rules,
      txWithErrorType,
      txWithError,
    };
  },
});
</script>
