<template>
  <v-container fluid class="exchange">
    <v-row justify="center" class="mx-0">
      <v-col>
        <v-row class="mx-0 mb-5 d-flex justify-center">
          <h2>Bridging {{environmentContext.getBtcTicker()}}
          and {{environmentContext.getRbtcTicker()}}</h2>
        </v-row>
          <v-row class="mx-0 mt-10 d-flex justify-center">
            <p class="text-center">Select your {{environmentContext.getBtcText()}} wallet</p>
          </v-row>
          <v-row justify="center" class="ma-0 mt-6">
            <v-col v-for="wallet in wallets" :key="wallet.name"
                    class="d-flex justify-center" >
                    <v-btn variant="outlined" class="wallet-button-thin"
                    @click="setBitcoinWallet(wallet.constant as BtcWallet)"
                    @mouseover="wallet.hover = true" @mouseleave="wallet.hover = false">
                <v-row>
                  <v-col cols="4" class="ma-0 pa-0 wallet-icon d-flex align-center"
                      :class="[wallet.btnClass]">
                    <v-img :src="wallet.hover ?
                    require('@/assets/' + wallet.iconWhite) :
                    require('@/assets/' + wallet.icon) " cover ></v-img>
                  </v-col>
                  <v-col cols="8" class="ma-0 pl-3 d-flex justify-center align-center">
                    <span class="wallet-button-content">{{ wallet.name }}</span>
                  </v-col>
                </v-row>
              </v-btn>
            </v-col>
          </v-row>
      </v-col>
    </v-row>
    <v-row class="mx-0">
      <v-col cols="2" class="d-flex justify-start ma-0 pa-0">
        <v-btn v-if="showBack" rounded variant="outlined" color="#000000" width="110" @click="back">
          <span>Back</span>
        </v-btn>
      </v-col>
    </v-row>
  </v-container>
</template>

<script lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import * as constants from '@/common/store/constants';
import { BtcWallet } from '@/common/types/pegInTx';
import EnvironmentContextProviderService from '@/common/providers/EnvironmentContextProvider';
import { useAction, useStateAttribute } from '@/common/store/helper';
import walletConf from '@/common/walletConf.json';

export default {
  name: 'SelectBitcoinWallet',
  setup() {
    const selectedWallet = ref('');
    const showBack = ref(true);
    const router = useRouter();
    const storeConstants = constants;
    const environmentContext = EnvironmentContextProviderService.getEnvironmentContext();

    const wallets = ref(walletConf.wallets);

    const bitcoinWallet = useStateAttribute<BtcWallet>('pegInTx', 'bitcoinWallet');
    const addBitcoinWallet = useAction('pegInTx', constants.PEGIN_TX_ADD_BITCOIN_WALLET);

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
        case constants.WALLET_TREZOR:
          wallet = constants.WALLET_NAMES.TREZOR;
          break;
        case constants.WALLET_LEDGER:
          wallet = constants.WALLET_NAMES.LEDGER;
          break;
        case constants.WALLET_LIQUALITY:
          wallet = constants.WALLET_NAMES.LIQUALITY;
          break;
        case constants.WALLET_XVERSE:
          wallet = constants.WALLET_NAMES.XVERSE;
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
    };
  },
};
</script>
