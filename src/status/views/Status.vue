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
      <span class="text-body-1">Estimated time: {{ releaseTimeText }}</span>
    </v-row>
    <v-row no-gutters v-if="showStatus && isRejected" justify="center">
      <p class="w-75 text-center text-body-1 mb-4">{{ rejectionMsg }}</p>
    </v-row>
    <v-row no-gutters v-if="showStatus">
      <tx-pegin v-if="isPegIn" :txId="txId" :isFlyover="isFlyover"
                :txNotFound="txNotFound" :txWithError="txWithError" />
      <tx-pegout v-if="isPegOut" :txId="txId" :isFlyover="isFlyover"
                :txNotFound="txNotFound" :txWithError="txWithError" />
      <status-progress-bar v-if="invalidData || unexpectedError" class="mt-4" :isFlyover="isFlyover"
                :txNotFound="txNotFound" :txWithError="txWithError" />
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

    const rejectionMsg = computed(() => {
      const details = txDetails.value as PegoutStatusDataModel;
      const { LOW_AMOUNT, CALLER_CONTRACT, FEE_ABOVE_VALUE } = constants.RejectedPegoutReasons;
      if (txNotFound.value) {
        if (blockBookError.value) {
          return 'We are experiencing technical issues and therefore were unable to retrieve and'
            + ' display the transaction status. Please try again later.';
        }
        return 'Your transaction is not processed yet, search again in a few minutes';
      }
      switch (details.reason) {
        case LOW_AMOUNT:
          return 'The transaction was rejected because the amount is less than the minimum required.';
        case CALLER_CONTRACT:
          return 'The transaction was rejected because the sender is a contract.';
        case FEE_ABOVE_VALUE:
          return 'Due to high network fees, your transaction is cancelled. Please try again later when network fees are lower or you can bridge higher amounts.';
        default:
          return '';
      }
    });

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
      txNotFound,
      txWithError,
      rejectionMsg,
      invalidData,
      unexpectedError,
    };
  },
});
</script>
