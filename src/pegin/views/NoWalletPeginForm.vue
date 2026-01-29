<template>
  <set-up-ibi v-model="showSetUpIBI" @close="getFireblocksData" />
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
        <v-row no-gutters>
          <v-col>
            <span class="text-body-sm mb-2">
              Fireblocks Vault
            </span>
            <v-select
              v-model="selectedVault"
              :items="vaultList"
              :menu-props="{ scrim: true, scrollStrategy: 'close' }"
              label="Vault"
              >
              <template #selection="{ item }">
                <v-icon :icon="mdiBank" />
                <span class="px-3 text-h7">{{ item.raw.name }}</span>
              </template>
              <template #item="{ props, item }">
                <v-list-item v-bind="props">
                  <template #title>
                    <span class="text-h6">{{ item.raw.name }}</span>
                  </template>
                  <template #subtitle>
                    <span class="text-body-2 text-medium-emphasis">
                      BTC Balance: {{ getVaultBtcBalance(item.raw) }}
                    </span>
                  </template>
                </v-list-item>
              </template>
            </v-select>
          </v-col>
        </v-row>
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
            v-model="amountModel"
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
          <rsk-destination-address class="mb-8 mt-8"
          :is-amount-filled="validAmount"
          @valid-address="handleValidAddress"/>
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
          <v-row no-gutters v-for="(quote, index) in peginQuotes" :key="index">
            <pegin-option-card
              :option-type="peginType.FLYOVER"
              @selected-option="changeSelectedOption"
              :selected="selected === peginType.FLYOVER"
              :quote="quote" />
          </v-row>
          <v-row no-gutters class="d-flex justify-end mt-5">
            <v-col class="d-flex justify-end">
              <v-btn-rsk v-if="!pegInFormState.matches(['loading'])"
                @click="sendTx()"
                :disabled="!isReadyToCreate || pegInFormState.matches(['goingHome'])"
                class="align-self-end text-body-1">
                <template #append>
                  <v-icon :icon="mdiArrowRight" />
                </template>
                Send Fireblocks Transaction
              </v-btn-rsk>
              <v-progress-circular class="align-self-end" v-else indeterminate />
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
  onBeforeMount,
} from 'vue';
import {
  mdiArrowLeft,
  mdiArrowRight,
  mdiBank,
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
import type { FireblocksTransactionParams, VaultAccount } from '@/common/types/Fireblocks';
import { TransferPeerPathType } from '@/common/types/Fireblocks';
import { appendRecaptcha, Machine, readFileAsText } from '@/common/utils';
import { useIndexedDB } from '@/common/composables/useIndexedDB';
import EnvironmentContextProviderService from '@/common/providers/EnvironmentContextProvider';
import { useAction, useState, useStateAttribute } from '@/common/store/helper';
import {
  FlyoverPeginState, PeginConfiguration,
  QuotePegIn2WP, TxStatusType,
} from '@/common/types';
import { FlyoverService } from '@/common/services';
import { useRouter } from 'vue-router';
import { AcceptedQuote } from '@rsksmart/flyover-sdk';
import SetUpIbi from './SetUpIBI.vue';

export default defineComponent({
  name: 'NoWalletPeginForm',
  components: {
    RskDestinationAddress,
    PeginOptionCard,
    FullTxErrorDialog,
    SetUpIbi,
  },
  emits: ['back', 'createTx'],
  setup(props, context) {
    const pegInFormState = ref<Machine<'loading' | 'goingHome' | 'fill'>>(new Machine('fill'));
    const { loadStringValue, loadFile } = useIndexedDB();
    const formState = ref<'fill' | 'loading'>('fill');
    const loadingQuotes = ref(false);
    const selected = ref<peginType>(constants.peginType.POWPEG);
    const selectedQuote = ref<PeginQuote | undefined>(undefined);
    const showErrorDialog = ref(false);
    const txError = ref(new ServiceError('', '', '', ''));
    const amount = ref('');
    const selectedVault = ref<VaultAccount | null>(null);
    const vaultList = ref<VaultAccount[]>([]);
    const { peginType } = constants;
    const router = useRouter();
    const peginConfiguration = useStateAttribute<PeginConfiguration>('pegInTx', 'peginConfiguration');
    const initFlyover = useAction('flyoverPegin', constants.FLYOVER_PEGIN_INIT);
    const getPeginQuotes = useAction('flyoverPegin', constants.FLYOVER_PEGIN_GET_QUOTES);
    const quotes = useStateAttribute<Record<number, QuotePegIn2WP[]>>('flyoverPegin', 'quotes');
    const setBtcAmountFlyover = useAction('flyoverPegin', constants.FLYOVER_PEGIN_ADD_AMOUNT);
    const flyoverPeginState = useState<FlyoverPeginState>('flyoverPegin');
    const flyoverService = useStateAttribute<FlyoverService>('flyoverPegin', 'flyoverService');
    const acceptQuote = useAction<AcceptedQuote>('flyoverPegin', constants.FLYOVER_PEGIN_ACCEPT_QUOTE);
    const setSelectedQuote = useAction('flyoverPegin', constants.FLYOVER_PEGIN_ADD_SELECTED_QUOTE);
    const fireblocksService = ref<FireblocksService>();
    const showSetUpIBI = ref(true);

    // UI logic
    const validAmount = computed(() => Number(amount.value) > 0);
    const showOptions = computed(
      () => !loadingQuotes.value && validAmount.value,
    );
    // TODO: Remove this to check if flyover is enabled
    const flyoverIsEnabled = computed(() => true);
    const isReadyToCreate = computed(() => {
      if (!showOptions.value) return false;
      if (selected.value === peginType.FLYOVER) {
        return validAmount.value && selectedQuote.value !== undefined;
      }
      return false;
    });
    const isFillState = computed(() => formState.value === 'fill');

    const peginQuotes = computed(() => {
      if (!flyoverIsEnabled.value) {
        return [];
      }
      const quoteList: QuotePegIn2WP[] = [];
      Object.values(quotes.value).forEach((providerQuotes) => {
        providerQuotes.forEach((quote) => {
          quoteList.push(quote);
        });
      });
      return quoteList;
    });

    function getQuotes() {
      if (!flyoverPeginState.value.rootstockRecipientAddress && Number(amount.value) === 0) return;
      selectedQuote.value = undefined;
      setSelectedQuote('');
      loadingQuotes.value = true;
      getPeginQuotes({
        rootstockRecipientAddress: flyoverPeginState.value.rootstockRecipientAddress,
      })
        .finally(() => {
          loadingQuotes.value = false;
        });
    }

    const timeOutId = ref(0);
    const amountModel = computed({
      get() {
        return amount.value;
      },
      set(amountInformed: string) {
        window.clearTimeout(timeOutId.value);
        amount.value = amountInformed;
        timeOutId.value = window.setTimeout(() => {
          setBtcAmountFlyover(new SatoshiBig(amount.value, 'btc'));
          getQuotes();
        }, 600);
      },
    });

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

    function changeSelectedOption(selectedType: peginType, quote?: PeginQuote) {
      selected.value = selectedType;
      selectedQuote.value = quote;
      setSelectedQuote(quote?.quoteHash);
    }

    function createTx(): Promise<void> {
      formState.value = 'loading';
      const params: FireblocksTransactionParams = {
        operation: 'TRANSFER',
        assetId: FireblocksService.btcAssetId,
        amount: amount.value,
        source: {
          type: TransferPeerPathType.VaultAccount,
          id: String(selectedVault.value?.id),
        },
        destination: {
          type: TransferPeerPathType.OneTimeAddress,
          subType: 'External',
          name: 'Flyover Peg-in BTC Address',
          oneTimeAddress: {
            address: flyoverPeginState.value.rootstockRecipientAddress,
            tag: '',
          },
        },
        note: 'PPA Fireblocks Peg-in',
      };
      return acceptQuote({
        quote: selectedQuote.value,
        amount: amount.value,
      })
        .then((acceptedQuote) => {
          if (!fireblocksService.value) return Promise.resolve();
          params.destination.oneTimeAddress.address = acceptedQuote.bitcoinDepositAddressHash;
          return fireblocksService.value.sendTransaction(params);
        })
        .then((res) => {
          router.push({
            name: 'SuccessTx',
            params: {
              txId: res.id,
              type: TxStatusType.FLYOVER_PEGIN,
              amount: amount.value,
              confirmations: 0,
            },
          });
        })
        .catch((e) => {
          handleError(e);
        })
        .finally(() => {
          formState.value = 'fill';
        });
    }

    function sendTx() {
      if (flyoverIsEnabled.value && selected.value === constants.peginType.FLYOVER) {
        window.grecaptcha.execute();
      } else {
        createTx();
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
        vaultId: selectedVault.value?.id ?? 0,
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
      amountModel.value = minValue.toBTCTrimmedString();
    }

    async function getUserInfo() {
      fireblocksService.value?.getVaultAccounts()
        .then((vaults) => {
          console.log('vaults', vaults);
          vaultList.value = vaults;
        })
        .catch((e) => {
          showErrorDialog.value = true;
          txError.value = new ServiceError(
            'FireblocksService',
            'getVaultAccounts',
            'The credentials are invalid or expired, please check them and try again',
            `Failed to fetch vaults or no vaults returned error: ${e}`,
          );
        });
      try {
        const res = await fireblocksService.value?.getApiUsers();
        if (res && res.statusCode !== 403) {
          showErrorDialog.value = true;
          txError.value = new ServiceError(
            'FireblocksService',
            'getApiUsers',
            'The credentials used has wrong permissions',
            'User has management privileges',
          );
        }
      } catch (e) {
        showErrorDialog.value = true;
        txError.value = new ServiceError(
          'FireblocksService',
          'getApiUsers',
          'Something is wrong with the credentials used',
          'User may not have any privileges',
        );
      }
    }

    function getVaultBtcBalance(vault: VaultAccount): string {
      const btcAsset = vault.assets.find((asset) => asset.id === FireblocksService.btcAssetId);
      if (!btcAsset) return '0.0';
      return btcAsset.total.toString();
    }

    function getFireblocksData() {
      setupService()
        .then(() => getUserInfo());
    }

    watch(isComposing, () => {
      const timeout = setTimeout(() => { isComposing.value = false; }, 200);
      return () => clearTimeout(timeout);
    });

    function handleValidAddress(isValid: boolean) {
      if (isValid && validAmount.value) {
        getQuotes();
      }
    }

    onBeforeMount(() => {
      initFlyover()
        .then(() => {
          appendRecaptcha(flyoverService.value.siteKey);
        });
      window.onRecaptchaSuccess = createTx;
    });

    return {
      formState,
      back,
      isReadyToCreate,
      validAmount,
      sendTx,
      changeSelectedOption,
      selected,
      showOptions,
      loadingQuotes,
      peginQuotes,
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
      amountModel,
      pegInFormState,
      flyoverService,
      getUserInfo,
      getFireblocksData,
      vaultList,
      getVaultBtcBalance,
      mdiBank,
      selectedVault,
      handleValidAddress,
    };
  },
});
</script>
