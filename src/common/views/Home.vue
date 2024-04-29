<template>
  <v-container fluid>
    <v-alert v-if="!isAllowedBrowser" variant="outlined" type="warning" prominent>
      Only Chrome and Brave browsers are allowed
    </v-alert>
    <v-row v-else no-gutters justify="space-around">
      <v-col lg="4" xl="3" xxl="2">
        <div class="d-flex text-h1 flex-wrap">
          <span class="mx-1 my-2 pa-4 bg-purple">Bridging</span>
          <span class="mx-1 my-2 pa-4 bg-orange">{{ environmentContext.getBtcTicker() }}</span>
          <span class="mx-1 my-2 pa-4 bg-off-white">and</span>
          <span class="mx-1 my-2 pa-4 bg-green">{{ environmentContext.getRbtcTicker() }}</span>
        </div>
      </v-col>
      <v-col lg="4" xl="3" xxl="2" class="d-flex flex-column ga-6">
        <v-btn @click="selectPegIn"
          :disabled="!isAllowedBrowser || (!areTermsAccepted && !!termsAndConditionsEnabled)"
          class="d-block pa-6 rounded-lg h-auto border-sm">
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
        <v-btn @click="selectPegOut" :disabled="!areTermsAccepted && !!termsAndConditionsEnabled"
          class="d-block pa-6 rounded-lg h-auto border-sm">
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
        <div class="d-flex justify-center gc-2 align-baseline flex-wrap">
          <span>Already made a transaction?</span>
          <v-btn variant="text" color="orange" density="compact" class="pa-0 text-body-1"
            @click="toStatusSearch">
            Transaction Status
          </v-btn>
        </div>
      </v-col>
    </v-row>
  </v-container>
  <v-row v-if="termsAndConditionsEnabled" class="d-flex justify-center">
    <label for="termscheck" class="pa-0 d-flex align-center mx-3">
      <input id="termscheck" type="checkbox" :checked="areTermsAccepted" @click="updateCookie">
    </label>
    <span>
      I acknowledge and accept the
      <a href="#" rel="noopener" @key-press="toggleCheck" class="px-1"
        @click.prevent="$emit('update:showDialog', true)">
        terms and conditions
      </a>
    </span>
  </v-row>
</template>

<script lang="ts">
import { ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import * as constants from '@/common/store/constants';
import EnvironmentContextProviderService from '@/common/providers/EnvironmentContextProvider';
import { isAllowedCurrentBrowser } from '@/common/utils';
import { Feature } from '@/common/types';
import { useAction, useStateAttribute } from '@/common/store/helper';

export default {
  name: 'HomeView',
  setup() {
    const router = useRouter();
    const environmentContext = EnvironmentContextProviderService.getEnvironmentContext();
    const isAllowedBrowser = isAllowedCurrentBrowser();
    const showTermsAndConditions = ref(false);
    const areTermsAccepted = useStateAttribute<boolean>('web3Session', 'acceptedTerms');
    const termsAndConditionsEnabled = useStateAttribute<Feature>('web3Session', 'termsAndConditionsEnabled');
    const clear = useAction('pegInTx', constants.PEGIN_TX_CLEAR_STATE);
    const clearPegOut = useAction('pegOutTx', constants.PEGOUT_TX_CLEAR);
    const clearSession = useAction('web3Session', constants.SESSION_CLEAR);
    const addPeg = useAction('web3Session', constants.SESSION_ADD_TX_TYPE);
    const setTerms = useAction('web3Session', constants.SESSION_ADD_TERMS_VALUE);
    const getBtcPrice = useAction('web3Session', constants.SESSION_ADD_BITCOIN_PRICE);
    const clearFlyoverPegout = useAction('flyoverPegout', constants.FLYOVER_PEGOUT_CLEAR_STATE);

    function selectPegIn(): void {
      addPeg(constants.PEG_IN_TRANSACTION_TYPE);
      router.push({ name: 'PegIn' });
    }

    function selectPegOut(): void {
      router.push({ name: 'PegOut' });
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

    function updateCookie() {
      setTerms(!areTermsAccepted.value);
    }

    const route = useRoute();
    function toStatusSearch(): void {
      if (route.path !== '/status') router.push('/status');
    }

    clearSession()
      .then(() => getBtcPrice());
    clear();
    clearPegOut();
    clearFlyoverPegout();
    clearSession();
    addPeg();

    return {
      environmentContext,
      selectPegIn,
      isAllowedBrowser,
      selectPegOut,
      toStatusSearch,
      showTermsAndConditions,
      closeTermsDialog,
      areTermsAccepted,
      termsAndConditionsEnabled,
      showDialog,
      toggleCheck,
      updateCookie,
    };
  },
};
</script>
