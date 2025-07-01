<template>
  <v-dialog :model-value="modelValue" @update:model-value="emitClose" max-width="900"
    min-height="500" z-index="4">
    <v-row no-gutters>
      <v-col no-gutters cols="5" class="ma-0 pa-0">
        <v-card class="pt-5 rounded-s-lg" min-height="500">
          <v-card-title class="d-flex align-center mt-6">
            <v-row class="d-flex justify-center align-center">
              <span class="font-weight-bold the-text-h5 bg-purple">
                Select your wallet
              </span>
            </v-row>
          </v-card-title>

          <v-card-text class="d-flex align-center mt-12">
            <v-col class="my-4">
              <v-row class ="d-flex justify-center pa-6">
                <v-btn variant="text" class="border-box d-block h-auto pa-5"
                  @click="selectWalletType(constants.WalletTypes.SOFTWARE)">
                  <v-row class="d-flex align-center justify-start wallet-btn">
                    <v-col class="bg-bw-400 w-100 h-100 pa-4" style="border-radius: 16px;">
                      <v-icon color="off-white" :icon="mdiCellphoneLink" size="40"></v-icon>
                    </v-col>
                    <v-col>
                      <span class="wallet-btn-label mx-4
                      text-body-1 font-weight-bold text-w-500 bg-orange">
                      Software Wallet
                      </span>
                    </v-col>
                  </v-row>
                </v-btn>
              </v-row>
              <v-row class ="d-flex justify-center pa-6">
                <v-btn variant="text" class="border-box d-block h-auto pa-5"
                  @click="selectWalletType(constants.WalletTypes.HARDWARE)">
                  <v-row class="d-flex align-center wallet-btn justify-start">
                    <v-col class="bg-bw-400 w-100 h-100 pa-4" style="border-radius: 16px;">
                      <v-icon color="off-white" :icon="mdiUsbFlashDriveOutline" size="40"></v-icon>
                    </v-col>
                    <v-col>
                      <span class="wallet-btn-label mx-4 text-body-1
                      font-weight-bold text-w-500 bg-green">
                      Hardware Wallet
                      </span>
                    </v-col>
                  </v-row>
                </v-btn>
              </v-row>
              <v-row class="mt-12 d-flex justify-center">
                <span>
                  <a href="https://www.rsk.co/rbtc/" target="_blank" class="text-bw-400">Dont't have a wallet? </a>
                </span>
              </v-row>
            </v-col>
          </v-card-text>
        </v-card>
      </v-col>
      <v-col cols="7" class="ma-0 pa-0">
        <v-card class="border-box h-100 w-100 d-flex align-center rounded-e-lg bg-bw-600 px-6">
          <v-col v-if="walletType === walletTypes.HARDWARE" class="px-10">
            <v-row v-for="wallet in hardwareWallets" :key="wallet.name"
                class="w-100 h-100 d-flex justify-center align-center my-2 wallet-btn">
              <v-btn variant="text" class="border-box d-block h-auto w-100 ma-0 pa-0"
                @click="selectBitcoinWallet(wallet.constant as BtcWallet)">
                <v-row class="d-flex align-center justify-start bg-bw-800 ma-0
                    border-sm border-background rounded-lg">
                  <v-col cols="10" class="d-flex justify-start align-center">
                    <span class="mx-4 text-subtitle-1 wallet-btn-label
                      justify-start text-w-500">
                    {{ wallet.name }}
                    </span>
                  </v-col>
                  <v-col cols="2" class="w-100 h-100 d-flex justify-center align-center">
                    <v-row class="square-ratio ma-0 pa-0
                          align-center justify-center rounded-lg"
                          :class="[themeIsDark ? 'bg-off-white': 'bg-bw-600']">
                      <v-img class="d-flex justify-center"
                        :class="[themeIsDark ? 'bg-off-white': 'bg-bw-600']"
                        justify="center" :height="30" :width="30"
                        :src="themeIsDark ?
                        require('@/assets/' + wallet.icon) :
                        require('@/assets/' + wallet.iconWhite) " />
                    </v-row>
                  </v-col>
                </v-row>
              </v-btn>
            </v-row>
          </v-col>
          <v-col v-if="walletType === walletTypes.SOFTWARE" class="px-10">
            <v-row v-for="wallet in softwareWallets" :key="wallet.name"
                class="w-100 h-100 d-flex justify-center align-center my-2 wallet-btn">
              <v-btn variant="text" class="border-box d-block h-auto w-100 ma-0 pa-0"
                  @click="selectBitcoinWallet(wallet.constant as BtcWallet)">
                <v-row class="d-flex align-center justify-start bg-bw-800 ma-0
                    border-sm border-background rounded-lg">
                  <v-col cols="10" class="d-flex justify-start align-center">
                      <span class="mx-4 text-subtitle-1 wallet-btn-label
                        justify-start text-w-500">
                      {{ wallet.name }}
                      </span>
                  </v-col>
                  <v-col cols="2" class="w-100 h-100 d-flex justify-center align-center">
                    <v-row class="square-ratio ma-0 pa-0
                            align-center justify-center rounded-lg"
                            :class="[themeIsDark ? 'bg-off-white': 'bg-bw-600']">
                        <v-img class="flex-grow-0"
                        :class="[themeIsDark ? 'bg-off-white': 'bg-bw-600']"
                        justify="center" :height="30" :width="30"
                        :src="themeIsDark ?
                        require('@/assets/' + wallet.icon) :
                        require('@/assets/' + wallet.iconWhite) " />
                    </v-row>
                  </v-col>
                </v-row>
              </v-btn>
            </v-row>
          </v-col>
          <v-col v-if="loadingAddresses">
            Loading addresses...
          </v-col>
        </v-card>
      </v-col>
    </v-row>
  </v-dialog>
</template>

<script lang="ts">
import {
  computed, defineComponent, ref, watch,
} from 'vue';
import EnvironmentContextProviderService from '@/common/providers/EnvironmentContextProvider';
import * as constants from '@/common/store/constants';
import { mdiCellphoneLink, mdiUsbFlashDriveOutline } from '@mdi/js';
import walletConf from '@/common/walletConf.json';
import { useTheme } from 'vuetify';
import {
  Browser, BtcWallet, Feature, FeatureNames, SupportedBrowsers,
  WalletAddress,
} from '@/common/types';
import { useAction, useGetter, useStateAttribute } from '@/common/store/helper';
import { getBrowserName } from '@/common/utils';
import { useRouter } from 'vue-router';
import {
  useAppKit, useAppKitAccount, useAppKitProvider,
} from '@reown/appkit/vue';
import { BitcoinConnector } from '@reown/appkit-adapter-bitcoin';

export default defineComponent({
  name: 'BtcWalletDialog',
  props: {
    modelValue: {
      type: Boolean,
      required: true,
    },
  },
  setup(props, { emit }) {
    const getFeature = useGetter<(name: FeatureNames) => Feature>('web3Session', constants.SESSION_GET_FEATURE);
    const environmentContext = EnvironmentContextProviderService.getEnvironmentContext();
    const currentBrowser = getBrowserName() as Browser;
    const accountInfo = useAppKitAccount();
    const { global: { name } } = useTheme();
    const router = useRouter();
    const walletType = ref<constants.WalletTypes>(constants.WalletTypes.SOFTWARE);
    const loadingAddresses = ref<boolean>(false);
    const selectedWallet = ref<BtcWallet | null>(null);
    const initPegin = useAction('pegInTx', constants.PEGIN_TX_INIT);
    const addBitcoinWallet = useAction('pegInTx', constants.PEGIN_TX_ADD_BITCOIN_WALLET);
    const bitcoinWallet = useStateAttribute<BtcWallet>('pegInTx', 'bitcoinWallet');

    const wallets = computed(() => walletConf.wallets.filter((wallet) => {
      const walletConfJsonConstant = wallet.constant as BtcWallet;
      const flag = getFeature.value(FeatureNames[walletConfJsonConstant]);
      if (!flag) {
        return false;
      }
      const browserFlag = Object.keys(flag).includes('supportedBrowsers') ? flag.supportedBrowsers[currentBrowser.toLowerCase() as keyof SupportedBrowsers] : false;
      return (flag?.value === constants.ENABLED) && browserFlag;
    }));

    const hardwareWallets = computed(() => wallets.value.filter((wallet) => wallet.kind === 'Hardware Wallet'));
    const softwareWallets = computed(() => wallets.value.filter((wallet) => wallet.kind === 'Software Wallet'));
    const { global: { current } } = useTheme();
    const themeIsDark = computed(() => (current.value.dark));

    function emitClose() {
      emit('update:modelValue', false);
    }
    function toSendBitcoin(): void {
      let wallet: string;
      switch (bitcoinWallet.value) {
        case constants.WALLET_NAMES.TREZOR.long_name:
          wallet = constants.WALLET_NAMES.TREZOR.short_name;
          break;
        case constants.WALLET_NAMES.LEDGER.long_name:
          wallet = constants.WALLET_NAMES.LEDGER.short_name;
          break;
        case constants.WALLET_NAMES.LEATHER.long_name:
          wallet = constants.WALLET_NAMES.LEATHER.short_name;
          break;
        case constants.WALLET_NAMES.XVERSE.long_name:
          wallet = constants.WALLET_NAMES.XVERSE.short_name;
          break;
        case constants.WALLET_NAMES.ENKRYPT.long_name:
          wallet = constants.WALLET_NAMES.ENKRYPT.short_name;
          break;
        case constants.WALLET_NAMES.REOWN.long_name:
          wallet = constants.WALLET_NAMES.REOWN.short_name;
          break;
        default:
          wallet = '';
          break;
      }
      if (wallet) {
        router.push({ name: 'Create', params: { wallet } });
      } else {
        router.push({ name: 'Home' });
      }
      emitClose();
    }

    function selectWalletType(wallet: constants.WalletTypes) {
      walletType.value = wallet;
    }

    function connectReown(): Promise<void> {
      const { walletProvider } = useAppKitProvider<BitcoinConnector>('bip122');
      const { open: openModal } = useAppKit();
      return new Promise((resolve, reject) => {
        if (!walletProvider) {
          openModal(
            {
              namespace: 'bip122',
            },
          )
            .then(resolve)
            .catch(reject);
        } else {
          reject(new Error('Reown aleready connected'));
        }
      });
    }

    function selectBitcoinWallet(wallet: BtcWallet) {
      selectedWallet.value = wallet;
      if (wallet === constants.WALLET_NAMES.REOWN.long_name) {
        connectReown()
          .catch((e: Error) => {
            console.error('Error connecting Reown wallet:', e);
          });
        return;
      }
      addBitcoinWallet({
        bitcoinWallet: wallet,
      })
        .then(toSendBitcoin);
    }

    function setReownWallet(): void {
      if (accountInfo.value.isConnected && accountInfo.value.allAccounts.length) {
        addBitcoinWallet({
          bitcoinWallet: selectedWallet.value,
          connectedAddress: {
            address: accountInfo.value.address,
            derivationPath: '',
            unused: true,
            publicKey: accountInfo.value.allAccounts[0].publicKey,
          } as WalletAddress,
        })
          .then(toSendBitcoin);
      }
    }

    watch(() => accountInfo.value.isConnected, () => {
      setReownWallet();
    }, { immediate: true });

    watch(() => accountInfo.value.allAccounts, () => {
      setReownWallet();
    }, { immediate: true });

    initPegin();

    return {
      environmentContext,
      emitClose,
      selectWalletType,
      constants,
      mdiCellphoneLink,
      mdiUsbFlashDriveOutline,
      hardwareWallets,
      softwareWallets,
      name,
      walletType,
      walletTypes: constants.WalletTypes,
      loadingAddresses,
      selectBitcoinWallet,
      themeIsDark,
    };
  },
});
</script>
