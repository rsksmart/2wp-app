<template>
  <v-container fluid class="home">
    <v-alert v-if="!isAllowedBrowser" variant="outlined" type="warning" prominent>
      Only Chrome, Firefox and Brave browsers are allowed
    </v-alert>
    <v-row v-else no-gutters justify="space-around">
      <v-col lg="4" xl="3" xxl="2">
        <div class="d-flex text-h1 flex-wrap">
          <span class="mx-1 my-2 pa-4 bg-purple">{{ $t('home.title.bridging') }}</span>
          <span class="mx-1 my-2 pa-4 bg-orange">Bitcoin</span>
          <span class="mx-1 my-2 pa-4 bg-off-white">{{ $t('home.title.and') }}</span>
          <span class="mx-1 my-2 pa-4 bg-green">Rootstock</span>
        </div>
      </v-col>
      <v-col lg="4" xl="3" xxl="2" class="d-flex flex-column">
        <template v-if="termsAndConditionsEnabled">
          <v-row class="d-flex justify-center mb-6">
            <label for="termscheck" class="pa-0 d-flex align-center mx-3">
              {{ '' }}
              <input id="termscheck" type="checkbox"
                     :checked="areTermsAccepted" @click="setTermsAccepted">
            </label>
            <span>I acknowledge and accept
              <a href="#" rel="noopener" @key-press="toggleCheck" class="px-1 text-orange"
                 @click.prevent="$emit('update:showDialog', true)">
                Terms and conditions
              </a>
            </span>
          </v-row>
        </template>
        <v-btn @click="selectConversion(constants.PEG_IN_TRANSACTION_TYPE)"
          :disabled="!isAllowedBrowser || (!areTermsAccepted && !!termsAndConditionsEnabled)"
          class="border-box d-block pa-6 rounded-lg h-auto mb-6">
          <v-row no-gutters align="center" justify="space-between">
            <v-col cols="4">
              <div class="d-flex text-h3 ga-1 flex-wrap">
                <span class="pa-1 bg-orange">{{ environmentContext.getBtcTicker() }}</span>
                <span class="pa-1 bg-purple">TO</span>
                <span class="pa-1 bg-green">{{ environmentContext.getRbtcTicker() }}</span>
              </div>
            </v-col>
            <v-col cols="4" xl="3">
              <v-img :src="require('@/assets/arrows-in.svg')"></v-img>
            </v-col>
          </v-row>
        </v-btn>
        <v-btn @click="selectConversion(constants.PEG_OUT_TRANSACTION_TYPE)"
          :disabled="!areTermsAccepted && !!termsAndConditionsEnabled"
          class="border-box d-block pa-6 rounded-lg h-auto mb-6">
          <v-row no-gutters align="center" justify="space-between">
            <v-col cols="4">
              <div class="d-flex text-h3 ga-1 flex-wrap">
                <span class="pa-1 bg-green">{{ environmentContext.getRbtcTicker() }}</span>
                <span class="pa-1 bg-purple">TO</span>
                <span class="pa-1 bg-orange">{{ environmentContext.getBtcTicker() }}</span>
              </div>
            </v-col>
            <v-col cols="4" xl="3">
              <v-img :src="require('@/assets/arrows-out.svg')"></v-img>
            </v-col>
          </v-row>
        </v-btn>
        <div class="d-flex justify-start align-baseline flex-wrap ml-6">
          <span class="text-body-1">Already made a transaction?</span>
          <v-btn variant="text" color="orange" density="compact"
            class="pa-0 text-body-1 ml-2"
            @click="toStatusSearch">
            Transaction Status
          </v-btn>
        </div>
        <div class="d-flex justify-start align-baseline flex-wrap ml-6">
          <span class="text-body-1 mr-2 mt-4">
            To learn about the various RBTC access methods, visit
            <a target='_blank' href="https://rootstock.io/rbtc/" class="pa-0 text-body-1 text-orange">
              <span >RBTC Webpage</span>
            </a>
          </span>
        </div>
      </v-col>
    </v-row>
  </v-container>
  <v-btn @click="connectReown = true">
    Reown
  </v-btn>
  <v-btn @click="disconnect = true">
    disconnect
  </v-btn>
  <reown-wallet-service
    :connectTrigger="connectReown"
    :disconnect="disconnect"
    @error="handleReowError"/>
  <web3-wallet-dialog v-model="showWeb3Modal"
    @cancel="connectError" @selected-wallet="selectWeb3WalletType" />
  <btc-wallet-dialog v-model="showBtcModal"
    @cancel="connectError" @loaded-wallet="continueToForm" />
  <v-dialog v-model="show" width="500">
    <v-card class="d-flex pa-6" rounded="lg">
      <div class="d-flex justify-space-between">
        <div class="d-flex text-h3 ga-1 flex-wrap">
            <span class='pa-2 bg-purple'>
              Connect your wallet
            </span>
      </div>
        <v-btn variant="plain" density="compact" width="24" height="24"
          @click="show = false" :icon="mdiCloseCircleOutline" />
      </div>
      <p class="py-2 mt-3">Please start by connecting the wallet of your choice.</p>
      <div class="d-flex justify-space-between pt-8">
        <v-btn-rsk @click="show = false">Cancel</v-btn-rsk>
        <v-btn-rsk variant="flat" @click="reconnect">Connect your wallet</v-btn-rsk>
      </div>
    </v-card>
  </v-dialog>
</template>

<script lang="ts">
import { computed, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import * as constants from '@/common/store/constants';
import EnvironmentContextProviderService from '@/common/providers/EnvironmentContextProvider';
import { isAllowedCurrentBrowser } from '@/common/utils';
import { Feature, FeatureNames, TransactionType } from '@/common/types';
import { useAction, useGetter, useStateAttribute } from '@/common/store/helper';
import { mdiCloseCircleOutline } from '@mdi/js';
import Web3WalletDialog from '@/common/components/exchange/Web3WalletDialog.vue';
import BtcWalletDialog from '@/common/components/exchange/BtcWalletDialog.vue';
import ReownWalletService from '@/pegin/services/ReownWalletService.vue';
import { useWallet } from '../composables/useWallet';

export default {
  name: 'HomeView',
  components: {
    Web3WalletDialog,
    BtcWalletDialog,
    ReownWalletService,
  },
  setup() {
    const router = useRouter();
    const environmentContext = EnvironmentContextProviderService.getEnvironmentContext();
    const isAllowedBrowser = isAllowedCurrentBrowser();
    const showTermsAndConditions = ref(false);
    const areTermsAccepted = useStateAttribute<boolean>('web3Session', 'acceptedTerms');
    const clearPegin = useAction('pegInTx', constants.PEGIN_TX_CLEAR_STATE);
    const clearPegOut = useAction('pegOutTx', constants.PEGOUT_TX_CLEAR);
    const addPeg = useAction('web3Session', constants.SESSION_ADD_TX_TYPE);
    const stateTxType = useStateAttribute<string>('web3Session', 'txType');
    const setTerms = useAction('web3Session', constants.SESSION_ADD_TERMS_VALUE);
    const getBtcPrice = useAction('web3Session', constants.SESSION_ADD_BITCOIN_PRICE);
    const clearFlyoverPegout = useAction('flyoverPegout', constants.FLYOVER_PEGOUT_CLEAR_STATE);
    const rskAccount = useStateAttribute('web3Session', 'account');
    const connectWeb3 = useAction('web3Session', constants.SESSION_CONNECT_WEB3);
    const show = ref(false);
    const showWeb3Modal = ref(false);
    const showBtcModal = ref(false);
    const COMPONENTS = {
      [constants.PEG_IN_TRANSACTION_TYPE]: 'PegIn',
      [constants.PEG_OUT_TRANSACTION_TYPE]: 'PegOut',
    };

    const getFeature = useGetter<(name: FeatureNames) => Feature>('web3Session', constants.SESSION_GET_FEATURE);
    const termsAndConditionsEnabled = computed(() => {
      const feature = getFeature.value(FeatureNames.TERMS_AND_CONDITIONS);
      return feature?.value;
    });

    async function selectConversion(txType: NonNullable<TransactionType>) {
      addPeg(txType);
      if (txType === constants.PEG_OUT_TRANSACTION_TYPE) {
        showWeb3Modal.value = true;
      } else {
        showBtcModal.value = true;
      }
    }

    async function reconnect() {
      show.value = false;
      try {
        await connectWeb3();
      } catch (e) {
        show.value = true;
        return;
      }
      router.push({ name: COMPONENTS[stateTxType.value as NonNullable<TransactionType>] });
    }

    function closeTermsDialog() {
      showTermsAndConditions.value = false;
    }

    function showDialog() {
      showTermsAndConditions.value = true;
    }

    function toggleCheck(e: KeyboardEvent) {
      if (e.key === 'Backspace' || e.key === 'enter') {
        showTermsAndConditions.value = !showTermsAndConditions.value;
      }
    }

    function setTermsAccepted() {
      setTerms(!areTermsAccepted.value);
    }

    const route = useRoute();
    function toStatusSearch(): void {
      if (route.path !== '/status') router.push('/status');
    }

    function connectError() {
      showWeb3Modal.value = false;
      show.value = true;
    }

    function checkRskConnection() {
      if (rskAccount.value) {
        router.push({ name: COMPONENTS[stateTxType.value as NonNullable<TransactionType>] });
      }
    }

    const { connect } = useWallet();

    function selectWeb3WalletType(walletType: constants.WalletTypes) {
      switch (walletType) {
        case constants.WalletTypes.SOFTWARE:
          connect()
            .then(checkRskConnection)
            .catch(connectError);
          break;
        case constants.WalletTypes.HARDWARE:
          connectWeb3()
            .then(checkRskConnection)
            .catch(connectError);
          break;
        default:
          showWeb3Modal.value = true;
          break;
      }
    }
    function continueToForm() {
      showBtcModal.value = false;
    }

    const connectReown = ref(false);
    function handleReowError(e: Error) {
      console.error('Reown error', e);
    }

    getBtcPrice();
    clearPegin();
    clearPegOut();
    clearFlyoverPegout();
    addPeg();

    return {
      environmentContext,
      isAllowedBrowser,
      toStatusSearch,
      showTermsAndConditions,
      closeTermsDialog,
      areTermsAccepted,
      termsAndConditionsEnabled,
      showDialog,
      toggleCheck,
      setTermsAccepted,
      show,
      mdiCloseCircleOutline,
      constants,
      selectConversion,
      reconnect,
      showWeb3Modal,
      showBtcModal,
      connectError,
      selectWeb3WalletType,
      continueToForm,
      connectReown,
      handleReowError,
      disconnect: ref(false),
    };
  },
};
</script>
