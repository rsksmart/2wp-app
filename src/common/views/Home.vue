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
          <template>
            <v-row class="mx-0 mt-10 d-flex justify-center">
              <p>Select your token conversion</p>
            </v-row>
            <v-row justify="center" class="ma-0">
              <v-col cols="4" class="d-flex justify-end pb-0">
                <v-btn @click="selectPegIn" :disabled="!isAllowedBrowser" outlined
                       v-bind:class="[ btnWalletClass, btcToRbtc ? 'selected' : '' ]">
                  <div>
                    <v-row class="mx-0 d-flex justify-center">
                      <v-col/>
                      <v-col class="pa-0 d-flex align-center">
                        <v-img :src="btcIcon" height="40" contain/>
                      </v-col>
                      <v-col class="pa-0 d-flex align-center">
                        <v-icon class="wallet-button-content">mdi-arrow-right</v-icon>
                      </v-col>
                      <v-col class="pa-0 d-flex align-center">
                        <v-img :src="rbtcIcon" height="40" contain/>
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
                  <v-btn @click="selectPegOut" class="wallet-button mb-0" outlined>
                    <div>
                      <v-row class="mx-0 d-flex justify-center">
                        <v-col/>
                        <v-col class="pa-0 d-flex align-center">
                          <v-img src="@/assets/exchange/rbtc.png" height="40" contain/>
                        </v-col>
                        <v-col class="pa-0 d-flex align-center">
                          <v-icon class="wallet-button-content">mdi-arrow-right</v-icon>
                        </v-col>
                        <v-col class="pa-0 d-flex align-center">
                          <v-img src="@/assets/exchange/btc.png" height="40" contain/>
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
            <v-row class="mx-0 mt-10 d-flex justify-center">
              <p>Or check the status of your transaction</p>
            </v-row>
            <v-row class="d-flex justify-center pt-4">
              <v-btn @click="toPegInStatus" outlined
                     v-bind:class="[ this.btnWalletClass, STATUS ? 'selected' : '' ]"
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
              border="left"
              >
                Only Chrome and Brave browsers are allowed
              </v-alert>
            </v-row>
          </template>
        </v-col>
      </v-row>
    </v-container>
  </v-container>
</template>

<script lang="ts">
import SelectBitcoinWallet from '@/common/components/exchange/SelectBitcoinWallet.vue';
import * as constants from '@/common/store/constants';
import EnvironmentContextProviderService from '@/common/providers/EnvironmentContextProvider';
import { isAllowedCurrentBrowser } from '@/common/utils';
import {
  TransactionType,
} from '@/common/types';
import { computed, ref } from 'vue';
import { useAction, useStateAttribute } from '@/common/store/helper';
import { useRoute, useRouter } from 'vue-router';

export default {
  name: 'Home',
  components: {
    SelectBitcoinWallet,
  },
  setup() {
    const router = useRouter();
    const STATUS = ref(false);
    const environmentContext = EnvironmentContextProviderService.getEnvironmentContext();
    const isAllowedBrowser = isAllowedCurrentBrowser();

    const txType = useStateAttribute<TransactionType>('web3Session', 'txType');

    const clear = useAction('pegInTx', constants.PEGIN_TX_CLEAR_STATE);
    const clearPegOut = useAction('pegOutTx', constants.PEGOUT_TX_CLEAR);
    const clearSession = useAction('web3Session', constants.SESSION_CLEAR);
    const initPegin = useAction('pegInTx', constants.PEGIN_TX_INIT);
    const init = useAction('pegOutTx', constants.PEGOUT_TX_INIT);
    const addPeg = useAction('web3Session', constants.SESSION_ADD_TX_TYPE);

    const btcToRbtc = computed((): boolean => {
      return txType.value === constants.PEG_IN_TRANSACTION_TYPE;
    });

    const btnWalletClass = computed(() => {
      return isAllowedBrowser ? 'wallet-button mb-0' : 'wallet-button-disabled mb-0';
    });

    const btcIcon = computed(() => {
      const btcIcon = isAllowedBrowser ? 'btc.png' : 'btc-disable.png';
      // eslint-disable-next-line global-require, import/no-dynamic-require
      return require(`@/assets/exchange/${btcIcon}`);
    });

    const rbtcIcon = computed(() => {
      const rbtcIcon = isAllowedBrowser ? 'rbtc.png' : 'rbtc-disable';
      // eslint-disable-next-line global-require, import/no-dynamic-require
      return require(`@/assets/exchange/${rbtcIcon}`);
    });

    const statusIcon = computed(() => {
      const statusIcon = isAllowedBrowser ? 'status-icon.svg' : 'status-icon-disabled.svg';
      // eslint-disable-next-line global-require, import/no-dynamic-require
      return require(`@/assets/status/${statusIcon}`);
    });

    function selectPegIn(): void {
      addPeg(constants.PEG_IN_TRANSACTION_TYPE);
      router.push({ name: 'PegIn' });
    }

    function selectPegOut(): void {
      router.push({ name: 'PegOut' });
    }

    function toPegInStatus(): void {
      STATUS.value = true;
      const route = useRoute();
      if (route.path !== '/status') router.push('/status');
    }


    clear();
    clearPegOut();
    clearSession();
    addPeg(undefined);
    init();
    initPegin();

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
    };
  }
}
</script>