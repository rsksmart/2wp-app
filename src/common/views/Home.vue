<template>
  <v-container fluid class="exchange normalized-height container
  max-width mx-6">
    <v-container fluid class="exchange">
      <v-row justify="center" class="mx-0">
        <v-col>
          <v-row class="mx-0 mb-5 d-flex justify-center">
            <h1 class="title-landing">2-Way Peg App</h1>
          </v-row>
        </v-col>
      </v-row>
      <v-row justify="center" class="mx-0">
        <v-col>
          <v-row class="mx-0 mb-5 d-flex justify-center">
            <h2>Bridging {{environmentContext.getBtcTicker()}} and
            {{environmentContext.getRbtcTicker()}}</h2>
          </v-row>
          <v-row class="mx-0 mt-10 d-flex justify-center" v-if="termsFlag">
            <v-col class="d-flex justify-center terms-label">
              <v-col class="d-flex justify-center terms-label">
              <v-row class="d-flex justify-center">
                  <v-row class="ma-0 pa-0 d-flex justify-center">
                    <label for="termscheck" class="pa-0 d-flex align-center mx-3">
                    <input id="termscheck" type="checkbox" :checked="areTermsAccepted"
                            @click="updateCookie" >
                    </label>
                    I acknowledge and accept the
                    <a href="#" rel="noopener" @key-press="toggleCheck"
                    class="px-1" @click="showDialog"> terms and conditions</a>
                  </v-row>
              </v-row>
            </v-col>
            </v-col>
          </v-row>
            <v-row class="mx-0 mt-10 d-flex justify-center">
              <p>Select your token conversion</p>
            </v-row>
            <v-row justify="center" class="mt-6">
              <v-col cols="4" class="d-flex justify-end pb-0">
                <v-btn @click="selectPegIn" :disabled="!isAllowedBrowser
                || (!areTermsAccepted && !!termsFlag)" outlined
                       v-bind:class="btnWalletClass">
                  <div>
                    <v-row class="mx-0 d-flex justify-center">
                      <v-col/>
                      <v-col class="pa-0 d-flex align-center">
                        <v-img :src="btcIcon" width="40" height="40" contain/>
                      </v-col>
                      <v-col class="pa-0 d-flex align-center">
                        <v-icon :icon="mdiArrowRight" class="wallet-button-content" size="x-large">
                        </v-icon>
                      </v-col>
                      <v-col class="pa-0 d-flex align-center">
                        <v-img :src="rbtcIcon" width="40" height="40" contain/>
                      </v-col>
                      <v-col/>
                    </v-row>
                    <v-row class="mx-0 d-flex justify-center">
                      <span class="wallet-button-content">{{environmentContext.getBtcTicker()}} to
                      {{environmentContext.getRbtcTicker()}}</span>
                    </v-row>
                  </div>
                </v-btn>
              </v-col>
              <v-col cols="4" class="d-flex justify-start pb-0">
                <v-col class="ma-0 pa-0" cols="auto">
                  <v-btn @click="selectPegOut" :disabled="!areTermsAccepted && !!termsFlag"
                          class="wallet-button mb-0" outlined>
                    <div>
                      <v-row class="mx-0 d-flex justify-center">
                        <v-col/>
                        <v-col class="pa-0 d-flex align-center">
                          <v-img :src="require('@/assets/exchange/rbtc.png')"
                                  width="40" height="40" contain/>
                        </v-col>
                        <v-col class="pa-0 d-flex align-center">
                          <v-icon :icon="mdiArrowRight" class="wallet-button-content"
                                  size="x-large">
                          </v-icon>
                        </v-col>
                        <v-col class="pa-0 d-flex align-center">
                          <v-img :src="require('@/assets/exchange/btc.png')"
                                  width="40" height="40" contain/>
                        </v-col>
                        <v-col/>
                      </v-row>
                      <v-row class="mx-0 d-flex justify-center">
                        <span class="wallet-button-content">
                          {{environmentContext.getRbtcTicker()}} to
                          {{environmentContext.getBtcTicker()}}
                        </span>
                      </v-row>
                    </div>
                  </v-btn>
                </v-col>
              </v-col>
            </v-row>
            <v-row class="mx-0 mt-12 d-flex justify-center">
              <p>Or check the status of your transaction</p>
            </v-row>
            <v-row class="d-flex justify-center pt-6">
              <v-btn @click="toPegInStatus" outlined
                     v-bind:class="[ btnWalletClass, STATUS ? 'selected' : '' ]"
                     :disabled="!isAllowedBrowser">
                <div>
                  <v-row class="mx-0 d-flex justify-center">
                    <v-col/>
                    <v-col class="pa-0 d-flex align-center mx-3">
                      <v-img :src="statusIcon" width="60" contain/>
                    </v-col>
                    <v-col/>
                  </v-row>
                  <v-row class="mx-0 d-flex justify-center mt-2">
                    <span class="wallet-button-content">Transaction status</span>
                  </v-row>
                </div>
              </v-btn>
            </v-row>
            <v-row v-if="!isAllowedBrowser" class="mx-0 mt-10 d-flex justify-center">
              <v-alert
              outlined
              type="warning"
              prominent
              >
                Only Chrome and Brave browsers are allowed
              </v-alert>
            </v-row>
        </v-col>
      </v-row>
    <terms-dialog :show-dialog="showTermsAndConditions"
    @closeDialog="closeTermsDialog" :text="dialogText"/>
    </v-container>
  </v-container>
</template>

<script lang="ts">
import { computed, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { mdiArrowRight } from '@mdi/js';
import * as constants from '@/common/store/constants';
import EnvironmentContextProviderService from '@/common/providers/EnvironmentContextProvider';
import { isAllowedCurrentBrowser } from '@/common/utils';
import {
  Feature,
  TransactionType,
} from '@/common/types';
import { useAction, useStateAttribute } from '@/common/store/helper';
import TermsDialog from '@/common/components/common/TermsDialog.vue';

export default {
  name: 'HomeView',
  components: {
    TermsDialog,
  },
  setup() {
    const router = useRouter();
    const STATUS = ref(false);
    const environmentContext = EnvironmentContextProviderService.getEnvironmentContext();
    const isAllowedBrowser = isAllowedCurrentBrowser();
    const showTermsAndConditions = ref(false);

    const txType = useStateAttribute<TransactionType>('web3Session', 'txType');
    const areTermsAccepted = useStateAttribute<boolean>('web3Session', 'acceptedTerms');
    const termsFlag = useStateAttribute<Feature>('web3Session', 'termsFlag');

    const clear = useAction('pegInTx', constants.PEGIN_TX_CLEAR_STATE);
    const clearPegOut = useAction('pegOutTx', constants.PEGOUT_TX_CLEAR);
    const clearSession = useAction('web3Session', constants.SESSION_CLEAR);
    const addPeg = useAction('web3Session', constants.SESSION_ADD_TX_TYPE);
    const setTerms = useAction('web3Session', constants.SESSION_ADD_TERMS_VALUE);

    const dialogText = computed(() => termsFlag.value?.value ?? '');

    const btcToRbtc = computed((): boolean => txType.value === constants.PEG_IN_TRANSACTION_TYPE);

    const btnWalletClass = computed(() => (isAllowedBrowser ? 'wallet-button mb-0' : 'wallet-button-disabled mb-0'));

    const btcIcon = computed(() => {
      const btcIconName = isAllowedBrowser ? 'btc.png' : 'btc-disable.png';
      // eslint-disable-next-line global-require, import/no-dynamic-require
      return require(`@/assets/exchange/${btcIconName}`);
    });

    const rbtcIcon = computed(() => {
      const rbtcIconName = isAllowedBrowser ? 'rbtc.png' : 'rbtc-disable';
      // eslint-disable-next-line global-require, import/no-dynamic-require
      return require(`@/assets/exchange/${rbtcIconName}`);
    });

    const statusIcon = computed(() => {
      const statusIconName = isAllowedBrowser ? 'status-icon.svg' : 'status-icon-disabled.svg';
      // eslint-disable-next-line global-require, import/no-dynamic-require
      return require(`@/assets/status/${statusIconName}`);
    });

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
    function toPegInStatus(): void {
      STATUS.value = true;
      if (route.path !== '/status') router.push('/status');
    }

    clear();
    clearPegOut();
    clearSession();
    addPeg();

    return {
      environmentContext,
      selectPegIn,
      isAllowedBrowser,
      btnWalletClass,
      btcToRbtc,
      btcIcon,
      rbtcIcon,
      selectPegOut,
      toPegInStatus,
      STATUS,
      statusIcon,
      mdiArrowRight,
      showTermsAndConditions,
      closeTermsDialog,
      areTermsAccepted,
      termsFlag,
      dialogText,
      showDialog,
      toggleCheck,
      updateCookie,
    };
  },
};
</script>
