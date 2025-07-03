<template>
  <set-up-ibi v-model="showSetUpIBI" />
  <v-container class="form">
    <v-row no-gutters class="d-flex justify-start">
      <v-btn variant="text"
      class="px-0"
      :prepend-icon="mdiArrowLeft"
      @click="back"
      :disabled="formState === 'loading'">
        Go Back
      </v-btn>
    </v-row>
    <v-row no-gutters class="d-flex justify-center">
      <v-col />
      <v-col xs="10" sm="8" md="7" lg="5" xl="5" class="d-flex space-between flex-column">
        <v-row no-gutters class="d-flex flex-column pa-0">
          <span class="text-body-sm mb-2">
            Amount to send
          </span>
          <v-text-field
            hide-details
            hide-spin-buttons
            flat
            variant="solo"
            density="comfortable"
            rounded="lg"
            class="text-h4 flex-grow-0 amount-input"
            v-model="amount"
            type="text"
            :readonly="isComposing"
            @compositionstart="isComposing = true"
            @keydown="blockLetterKeyDown"
            @wheel.prevent
            @focus="focus = true"
            @blur="focus = false">
              <template #prepend-inner>
                <v-icon density="comfortable" :icon="mdiBitcoin" color="orange"
                  class="ml-n1 opacity-100" />
              </template>
              <template #append-inner>
                <span class="text-bw-500">{{ environmentContext.getBtcTicker() }}</span>
                <div class="d-flex pl-2 ga-1">
                  <v-chip variant="outlined" density="compact" @click="setMin">
                    {{ boundaries.minValue.toBTCString().slice(0,5) }} MIN
                  </v-chip>
                </div>
              </template>
          </v-text-field>
        </v-row>
        <rsk-destination-address class="mb-8" @valid-address="checkValidAddress"
          :is-amount-filled="validAmount"/>
      </v-col>
      <v-col />
    </v-row>
    <v-row no-gutters class="d-flex justify-center">
      <v-col />
      <v-col xs="10" sm="8" md="7" lg="5" xl="5" class="d-flex space-between flex-column">
        <template v-if="showOptions">
          <v-row no-gutters class="my-4">
            <span class="text-body-sm">Select mode to see exact amounts</span>
          </v-row>
          <v-row no-gutters v-if="!flyoverIsEnabled && peginQuotes.length === 0">
            <pegin-option-card :option-type="peginType.FLYOVER" flyover-not-available>
              <template v-slot>
                <h4>
                  <span class="text-orange">Fast Mode</span> is unavailable at this time.
                </h4>
              </template>
            </pegin-option-card>
          </v-row>
          <v-row no-gutters v-if="flyoverIsEnabled && peginQuotes.length === 0">
            <pegin-option-card :option-type="peginType.FLYOVER" flyover-not-available>
              <template v-slot>
                <h4>
                  <span class="text-orange">Fast Mode</span> no quotes available for this amount.
                </h4>
              </template>
            </pegin-option-card>
          </v-row>
          <v-row no-gutters v-else v-for="(quote, index) in peginQuotes" :key="index">
            <pegin-option-card
              :option-type="peginType.FLYOVER"
              @selected-option="changeSelectedOption"
              :selected="selected === peginType.FLYOVER"
              :quote="quote" />
          </v-row>
          <v-row no-gutters class="mt-4">
            <pegin-option-card
              :option-type="peginType.POWPEG"
              @selected-option="changeSelectedOption"
              :selected="selected === peginType.POWPEG"
            />
          </v-row>
          <v-row no-gutters class="d-flex justify-end mt-5">
            <v-col v-if="selected === peginType.FLYOVER">
              <v-btn-rsk
                @click="sendTx"
                :disabled="!isReadyToCreate || formState === 'loading'"
                class="align-self-start text-body-1"
                >
                <template #append>
                  <v-icon :icon="mdiQrcode" />
                </template>
                  Send with
              </v-btn-rsk>
            </v-col>
            <v-col class="d-flex justify-end">
              <v-btn-rsk v-if="isFillState"
                @click="sendTx"
                :disabled="!isReadyToCreate || formState === 'loading'"
                class="align-self-end text-body-1">
                <template #append>
                  <v-icon :icon="mdiArrowRight" />
                </template>
                Send to Fireblocks
              </v-btn-rsk>
              <v-progress-circular v-else class="align-self-end" indeterminate />
            </v-col>
          </v-row>
        </template>
        <v-row no-gutters v-else-if="loadingQuotes" class="justify-center">
          <v-progress-circular
            :size="250"
            :width="18"
            color="warning"
            indeterminate>
            Searching Options...
          </v-progress-circular>
        </v-row>
      </v-col>
      <v-col />
    </v-row>
    <template v-if="showErrorDialog">
      <full-tx-error-dialog
      :showTxErrorDialog="showErrorDialog"
      :error="txError"
      @closeErrorDialog="showErrorDialog = false"
      />
    </template>
  </v-container>
</template>

<script lang="ts">
import {
  computed, ref, defineComponent,
  watch,
} from 'vue';
import {
  mdiArrowLeft,
  mdiArrowRight,
  mdiQrcode,
  mdiBitcoin,
} from '@mdi/js';
import PeginOptionCard from '@/pegin/components/create/PeginOptionCard.vue';
import * as constants from '@/common/store/constants';
import FullTxErrorDialog from '@/common/components/exchange/FullTxErrorDialog.vue';
import RskDestinationAddress from '@/pegin/components/create/RskDestinationAddress.vue';
import SatoshiBig from '@/common/types/SatoshiBig';
import ServiceError from '@/common/utils/ServiceError';
import type { peginType } from '@/common/store/constants';
import type PeginQuote from '@/common/types/Flyover/PeginQuote';
import FireblocksService from '@/common/services/FireblocksService';
import type { FireblocksTransactionParams } from '@/common/types/Fireblocks';
import { TransferPeerPathType } from '@/common/types/Fireblocks';
import { readFileAsText } from '@/common/utils';
import { useIndexedDB } from '@/common/composables/useIndexdedDB';
import EnvironmentContextProviderService from '@/common/providers/EnvironmentContextProvider';
import { useStateAttribute } from '@/common/store/helper';
import { PeginConfiguration } from '@/common/types';
import SetUpIbi from './SetUpIBI.vue';

export default defineComponent({
  name: 'NoWalletPeginForm',
  props: {
    isFlyoverAvailable: {
      type: Boolean,
      required: true,
    },
  },
  components: {
    RskDestinationAddress,
    PeginOptionCard,
    FullTxErrorDialog,
    SetUpIbi,
  },
  emits: ['back', 'createTx'],
  setup(props, context) {
    const { loadStringValue, loadFile } = useIndexedDB();
    const formState = ref<'fill' | 'loading'>('fill');
    const loadingQuotes = ref(false);
    const selected = ref<peginType>(constants.peginType.POWPEG);
    const selectedQuote = ref<PeginQuote | undefined>(undefined);
    const showErrorDialog = ref(false);
    const txError = ref(new ServiceError('', '', '', ''));
    const validAmount = ref(false);
    const amount = ref('');
    const validAddress = ref(false);
    const address = ref('');
    const vaultId = ref(0);
    const { peginType } = constants;
    const peginConfiguration = useStateAttribute<PeginConfiguration>('pegInTx', 'peginConfiguration');
    const peginQuotes = ref<PeginQuote[]>([ // Mock quotes
      {
        quoteHash: 'mock-quote-1',
        getTotalTxAmount: (fee: SatoshiBig) => new SatoshiBig(0.01, 'btc').plus(fee),
        valueToTransfer: new SatoshiBig(0.01, 'btc'),
        providerFee: new SatoshiBig(0.0002, 'btc'),
        getTotalQuoteFee: (fee: SatoshiBig) => new SatoshiBig(0.0002, 'btc').plus(fee),
        quote: {
          value: new SatoshiBig(0.01, 'btc'),
          confirmations: 6,
        },
      } as unknown as PeginQuote,
    ]);
    const fireblocksService = ref<FireblocksService>();
    const showSetUpIBI = ref(true);

    // UI logic
    const showOptions = computed(
      () => !loadingQuotes.value && validAddress.value && validAmount.value,
    );
    const flyoverIsEnabled = computed(() => props.isFlyoverAvailable);
    const isReadyToCreate = computed(() => {
      if (!showOptions.value) return false;
      if (selected.value === peginType.POWPEG) {
        return validAmount.value && validAddress.value;
      }
      if (selected.value === peginType.FLYOVER) {
        return validAmount.value && validAddress.value && selectedQuote.value;
      }
      return false;
    });
    const isFillState = computed(() => formState.value === 'fill');

    // Methods
    function back() {
      formState.value = 'loading';
      context.emit('back');
    }

    function handleError(error: Error) {
      if (error instanceof ServiceError) {
        txError.value = error;
        showErrorDialog.value = true;
      }
    }

    function checkValidAddress(isValid: boolean, addressInformed: string) {
      validAddress.value = isValid;
      if (isValid && addressInformed !== address.value) {
        address.value = addressInformed;
      }
    }

    function checkValidAmount(isValid: boolean, amountInformed: string) {
      validAmount.value = isValid;
      if (isValid && amountInformed !== amount.value) {
        amount.value = amountInformed;
      }
    }

    function changeSelectedOption(selectedType: peginType, quote?: PeginQuote) {
      selected.value = selectedType;
      selectedQuote.value = quote;
    }

    function sendTx() {
      formState.value = 'loading';
      try {
        const params: FireblocksTransactionParams = {
          assetId: 'BTC',
          amount: amount.value,
          source: {
            type: TransferPeerPathType.VaultAccount,
            id: String(vaultId.value),
          },
          destination: {
            type: TransferPeerPathType.OneTimeAddress,
            subType: '',
            name: 'User BTC Address',
            oneTimeAddress: {
              address: address.value,
              tag: '',
            },
          },
          note: '2WP Fireblocks Peg-in',
        };
        fireblocksService.value?.sendTransaction(params)
          .then((res) => {
            context.emit('createTx', res);
          })
          .catch((e) => {
            handleError(e);
          })
          .finally(() => {
            formState.value = 'fill';
          });
      } catch (e) {
        handleError(e as Error);
        formState.value = 'fill';
      }
    }

    async function setupService() {
      const apiKey = await loadStringValue('apiKey');
      const keyBlob = await loadFile('secret.key');
      if (!keyBlob || !apiKey) {
        throw new Error('Key file not found in IndexedDB');
      }
      const file = new File([keyBlob], 'secret.key', {
        type: keyBlob.type,
        lastModified: Date.now(),
      });
      const key = await readFileAsText(file);
      fireblocksService.value = new FireblocksService({
        apiKey,
        cert: key,
        vaultId: vaultId.value,
      });
      console.log('Fireblocks service setup complete');
    }

    const isComposing = ref(false);
    const focus = ref(false);
    const environmentContext = EnvironmentContextProviderService.getEnvironmentContext();
    const boundaries = computed(() => {
      const minValue: SatoshiBig = new SatoshiBig(peginConfiguration.value.minValue, 'btc');
      return {
        minValue,
      };
    });

    function blockLetterKeyDown(e: KeyboardEvent) {
      const allowedKeys = ['Backspace', 'Delete', 'Home', 'End', 'ArrowRight', 'ArrowLeft'];
      if (allowedKeys.includes(e.key)) return;
      if (e.key === '.' && (amount.value && !amount.value.includes('.'))) return;
      const decimals = amount.value.split('.').pop() ?? '';
      if (decimals.length >= 8 || Number.isNaN(Number(e.key)) || e.key === ' ') {
        e.preventDefault();
      }
    }

    function setMin() {
      const { minValue } = boundaries.value;
      amount.value = minValue.toBTCTrimmedString();
    }

    watch(isComposing, () => {
      const timeout = setTimeout(() => { isComposing.value = false; }, 200);
      return () => clearTimeout(timeout);
    });

    setupService();

    return {
      formState,
      back,
      isReadyToCreate,
      checkValidAmount,
      checkValidAddress,
      validAmount,
      validAddress,
      sendTx,
      changeSelectedOption,
      selected,
      showOptions,
      loadingQuotes,
      peginQuotes: peginQuotes.value,
      peginType,
      showErrorDialog,
      txError,
      flyoverIsEnabled,
      mdiArrowLeft,
      mdiArrowRight,
      mdiQrcode,
      isFillState,
      blockLetterKeyDown,
      isComposing,
      amount,
      focus,
      mdiBitcoin,
      environmentContext,
      setMin,
      boundaries,
      showSetUpIBI,
    };
  },
});
</script>
