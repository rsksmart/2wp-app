<template>
  <v-container fluid class="exchange">
    <v-row no-gutters>
      <v-btn variant="text"
       :prepend-icon="mdiArrowLeft"
       @click="back">
        Go Back
      </v-btn>
    </v-row>
    <v-row class="mx-0">
      <v-col cols="auto" v-for="wallet in wallets" :key="wallet.name" class="d-flex justify-start" >
        <v-btn-square @click="setBitcoinWallet(wallet.constant as BtcWallet)"
          @mouseover="wallet.hover = true" @mouseleave="wallet.hover = false">
          <v-container>
            <v-row justify="start">
              <v-img class="flex-grow-0" justify="start" :height="64" :width="64"
                     :src="name === 'dark' ?
                      require('@/assets/' + wallet.iconWhite) :
                      require('@/assets/' + wallet.icon) " />
            </v-row>
            <v-row justify="start" class="pt-16">
              <v-col>
                <v-row justify="start">
                  <span class="text-body-1 font-weight-bold">{{ wallet.name }}</span>
                </v-row>
                <v-row justify="start">
                  <span class="text-body-2">{{ wallet.kind }}</span>
                </v-row>
                <v-row justify="start">
                  <a @click.stop class="text-body-2 text-orange"
                     target='_blank' :href='wallet.installation'>
                    Install here
                  </a>
                </v-row>
              </v-col>
            </v-row>
          </v-container>
        </v-btn-square>
      </v-col>
    </v-row>
  </v-container>
</template>

<script lang="ts">
import { computed, ref } from 'vue';
import { useRouter } from 'vue-router';
import * as constants from '@/common/store/constants';
import { BtcWallet } from '@/common/types/pegInTx';
import EnvironmentContextProviderService from '@/common/providers/EnvironmentContextProvider';
import { useAction, useGetter, useStateAttribute } from '@/common/store/helper';
import walletConf from '@/common/walletConf.json';
import { mdiArrowLeft } from '@mdi/js';
import { useTheme } from 'vuetify';
import { Feature, FeatureNames } from '@/common/types';

export default {
  name: 'SelectBitcoinWallet',
  setup() {
    const selectedWallet = ref('');
    const showBack = ref(true);
    const router = useRouter();
    const storeConstants = constants;
    const environmentContext = EnvironmentContextProviderService.getEnvironmentContext();
    const getFeature = useGetter<(name: FeatureNames) => Feature>('web3Session', constants.SESSION_GET_FEATURE);

    const wallets = computed(() => walletConf.wallets.filter((wallet) => {
      const walletConfJsonConstant = wallet.constant as BtcWallet;
      const flag = getFeature.value(FeatureNames[walletConfJsonConstant]);
      return flag?.value === constants.ENABLED;
    }));

    const bitcoinWallet = useStateAttribute<BtcWallet>('pegInTx', 'bitcoinWallet');
    const addBitcoinWallet = useAction('pegInTx', constants.PEGIN_TX_ADD_BITCOIN_WALLET);

    const { global: { name } } = useTheme();

    function reset(): void {
      selectedWallet.value = '';
    }

    function back():void {
      reset();
      router.push({ name: 'Home' });
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
        default:
          wallet = '';
          break;
      }
      if (wallet) {
        router.push({ name: 'Create', params: { wallet } });
      } else {
        router.push({ name: 'Home' });
      }
    }

    function setBitcoinWallet(wallet: BtcWallet): void {
      addBitcoinWallet(wallet);
      toSendBitcoin();
    }

    return {
      selectedWallet,
      storeConstants,
      environmentContext,
      showBack,
      back,
      setBitcoinWallet,
      wallets,
      name,
      mdiArrowLeft,
    };
  },
};
</script>
