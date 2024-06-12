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
      <p>Estimated time: {{ releaseTimeText }}</p>
    </v-row>
    <v-row no-gutters>
      <tx-pegin v-if="isPegIn" :txId="txId" :isFlyover="isFlyover" />
      <tx-pegout v-if="isPegOut" :txId="txId" :isFlyover="isFlyover"/>
      <status-progress-bar v-if="txWithErrorType" :isFlyover="isFlyover"/>
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
  PegoutStatusDataModel, TxStatus, TxStatusMessage,
} from '@/common/types';
import * as constants from '@/common/store/constants';
import { useAction, useGetter, useState } from '@/common/store/helper';
import StatusProgressBar from '@/common/components/status/StatusProgressBar.vue';

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

    const showStatus = computed(() => !loading.value
        && !activeMessage.value.error
        && !!activeMessage.value.statusMessage);

    const isRejected = computed(() => status.value.txDetails?.status === 'REJECTED');

    const isPegIn = computed((): boolean => status.value.type === TxStatusType.PEGIN);

    const isPegOut = computed((): boolean => status.value.type === TxStatusType.PEGOUT
      || status.value.type === TxStatusType.FLYOVER_PEGOUT);

    const isFlyover = computed((): boolean => status.value.type === TxStatusType.FLYOVER_PEGOUT);

    const txWithErrorType = computed((): boolean => status.value.type === TxStatusType.INVALID_DATA
      || status.value.type === TxStatusType.UNEXPECTED_ERROR);

    const showTimeLeft = computed((): boolean => {
      const txDetails = status.value.txDetails as PegoutStatusDataModel;
      return status.value.type === TxStatusType.PEGOUT
          && (txDetails.status === PegoutStatus.WAITING_FOR_CONFIRMATION
          || txDetails.status === PegoutStatus.RECEIVED
          || txDetails.status === PegoutStatus.WAITING_FOR_SIGNATURE);
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
    };
  },
});
</script>
