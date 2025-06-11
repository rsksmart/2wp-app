<template>
  <div class="transactions">
    <v-col offset="2" cols="8">
      <v-row v-if="isSftwWallet" justify="center" class="mx-0 mb-1">
        <h1>Enable {{ walletName }}</h1>
      </v-row>
      <v-row v-else justify="center" class="mx-0 mb-1">
        <h1>Connect your {{ walletName }}</h1>
      </v-row>
      <v-row v-if="isHdWallet" justify="center" class="ma-0 mb-6">
        <p>(Keep your {{ walletName }} close so you can authorize access)</p>
      </v-row>
      <v-row justify="center">
        <v-col id="connect-device-steps" class="mb-10" cols="12">
          <v-row class="ma-0">
            <v-col cols="1">
              <div class="number">1</div>
            </v-col>
            <v-col cols="11">
              <p v-if="isSftwWallet"
              class="ma-0">
                Make sure {{ walletName }} is installed and enabled in your browser.
              </p>
              <p v-if="isHdWallet"
              class="ma-0">
                Plug your {{ walletName }} device into your computer
              </p>
            </v-col>
          </v-row>
          <v-row class="ma-0">
            <v-col cols="1">
              <div class="number">2</div>
            </v-col>
            <v-col v-if="isHdWallet" cols="11">
              <p class="ma-0">Insert {{ walletName }} device PIN code</p>
            </v-col>
            <v-col v-if="isSftwWallet" cols="11">
              <p class="ma-0">Unlock your wallet.</p>
            </v-col>
          </v-row>
          <v-row v-if="isLedgerWallet" class="ma-0">
            <v-col cols="1">
              <div class="number">3</div>
            </v-col>
            <v-col cols="11">

              <p class="ma-0">
                Select the {{environmentContext.getBtcLedgerAppName()}} app in your device
              </p>
            </v-col>
          </v-row>
        </v-col>
      </v-row>
      <v-row class="mx-0 d-flex justify-center">
        <v-img :src="deviceImagePath" height="300" contain />
      </v-row>

      <v-row class="mx-0 mt-5">
        <v-col cols="2" class="d-flex justify-start ma-0 pa-0">
          <v-btn-rsk width="110"
              :disabled="sendBitcoinState === 'error' || sendBitcoinState === 'loading'"
              @click="back">
            <span>Back</span>
          </v-btn-rsk>
        </v-col>
        <v-col cols="10" class="d-flex justify-end ma-0 py-0 pl-0">
          <v-btn-rsk
            v-if="(sendBitcoinState === 'idle' || sendBitcoinState === 'error') && isHdWallet"
            :disabled="sendBitcoinState === 'error'"
            @click="continueToForm">
            <span>Continue</span>
          </v-btn-rsk>
          <v-progress-circular v-if="sendBitcoinState === 'loading'"
            indeterminate :size="36" :width="4"/>
        </v-col>
      </v-row>
    </v-col>
  </div>
</template>

<script lang="ts">
import {
  computed, onBeforeMount, PropType, defineComponent,
} from 'vue';
import { useRouter } from 'vue-router';
import * as constants from '@/common/store/constants';
import { SendBitcoinState } from '@/common/types';
import EnvironmentContextProviderService from '@/common/providers/EnvironmentContextProvider';
import { useAction, useGetter, useStateAttribute } from '@/common/store/helper';
import { useWalletInfo } from '@reown/appkit/vue';

export default defineComponent({
  name: 'ConnectDevice',
  props: {
    device: String,
    sendBitcoinState: String as PropType<SendBitcoinState>,
    showDialog: Boolean,
  },
  setup(props, context) {
    const router = useRouter();
    const environmentContext = EnvironmentContextProviderService.getEnvironmentContext();

    const bitcoinWallet = useStateAttribute('pegInTx', 'bitcoinWallet');
    const getWalletName = useGetter<string>('pegInTx', constants.WALLET_NAME);
    const isHdWallet = useGetter<boolean>('pegInTx', constants.PEGIN_TX_IS_HD_WALLET);
    const isSftwWallet = useGetter<boolean>('pegInTx', constants.PEGIN_TX_IS_SF_WALLET);
    const clearStore = useAction('pegInTx', constants.PEGIN_TX_CLEAR_STATE);

    const deviceImagePath = computed(() => {
      if (bitcoinWallet.value === constants.WALLET_NAMES.LEDGER.long_name) {
        // eslint-disable-next-line global-require, import/no-dynamic-require
        return require('@/assets/exchange/connect/connect_ledger.png');
      }
      if (bitcoinWallet.value === constants.WALLET_NAMES.TREZOR.long_name) {
        // eslint-disable-next-line global-require, import/no-dynamic-require
        return require('@/assets/exchange/connect/connect_trezor.png');
      }
      if (bitcoinWallet.value === constants.WALLET_NAMES.LEATHER.long_name) {
        // eslint-disable-next-line global-require, import/no-dynamic-require
        return require('@/assets/exchange/connect/connect_leather.png');
      }
      if (bitcoinWallet.value === constants.WALLET_NAMES.ENKRYPT.long_name) {
        // eslint-disable-next-line global-require, import/no-dynamic-require
        return require('@/assets/exchange/connect/connect_enkrypt.png');
      }
      if (bitcoinWallet.value === constants.WALLET_NAMES.XVERSE.long_name) {
        // eslint-disable-next-line global-require, import/no-dynamic-require
        return require('@/assets/exchange/connect/connect_xverse.png');
      }
      if (bitcoinWallet.value === constants.WALLET_NAMES.REOWN.long_name) {
        // eslint-disable-next-line global-require, import/no-dynamic-require
        return require('@/assets/exchange/connect/connect_reown.png');
      }
      // eslint-disable-next-line global-require, import/no-dynamic-require
      return require('@/assets/exchange/connect/wallet.png');
    });

    const isLedgerWallet = computed(() => bitcoinWallet.value
      === constants.WALLET_NAMES.LEDGER.long_name);

    const walletName = computed(() => {
      if (bitcoinWallet.value === constants.WALLET_NAMES.REOWN.long_name) {
        const { walletInfo } = useWalletInfo();
        return walletInfo?.name;
      }
      return `${getWalletName.value} wallet`;
    });

    function continueToForm() {
      context.emit('continueToForm', bitcoinWallet);
    }

    function back() {
      clearStore();
      router.push({ name: 'Home' });
    }

    function tryConnect() {
      continueToForm();
    }

    onBeforeMount(() => {
      if (!props.showDialog) {
        tryConnect();
      }
    });

    return {
      environmentContext,
      walletName,
      isHdWallet,
      isSftwWallet,
      clearStore,
      deviceImagePath,
      isLedgerWallet,
      continueToForm,
      back,
    };
  },
});
</script>
