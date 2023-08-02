<template>
  <v-container fluid class="exchange">
    <v-row justify="center" class="mx-0">
      <v-col>
        <v-row class="mx-0 mb-5 d-flex justify-center">
          <h2>Bridging {{environmentContext.getBtcTicker()}}
          and {{environmentContext.getRbtcTicker()}}</h2>
        </v-row>
        <template>
          <v-row class="mx-0 mt-10 d-flex justify-center">
            <p class="text-center">Select your {{environmentContext.getBtcText()}} wallet</p>
          </v-row>
          <v-row justify="center" class="ma-0">
            <v-col cols="4" class="d-flex justify-center">
              <v-btn outlined class="wallet-button-thin"
                     @click="setBitcoinWallet(storeConstants.WALLET_LEDGER)"
                     v-bind:class="{ selected: selectedWallet === storeConstants.WALLET_LEDGER }">
                <div class="mr-2 wallet-icon-ledger"></div>
                <span class="wallet-button-content">Ledger</span>
              </v-btn>
            </v-col>
            <v-col cols="4" class="d-flex justify-center">
              <v-btn outlined class="wallet-button-thin"
                     @click="setBitcoinWallet(storeConstants.WALLET_TREZOR)"
                     v-bind:class="{ selected: selectedWallet === storeConstants.WALLET_TREZOR }">
                <div class="mr-2 wallet-icon"></div>
                <span class="wallet-button-content">Trezor</span>
              </v-btn>
            </v-col>
            <v-col cols="4" class="d-flex justify-center">
              <v-btn outlined class="wallet-button-thin"
                @click="setBitcoinWallet(storeConstants.WALLET_LIQUALITY)"
                v-bind:class="{ selected: selectedWallet === storeConstants.WALLET_LIQUALITY }">
                <div class="wallet-icon-liquality"></div>
                <span class="wallet-button-content">Liquality</span>
              </v-btn>
            </v-col>
          </v-row>
        </template>
      </v-col>
    </v-row>
    <v-row class="mx-0">
      <v-col cols="2" class="d-flex justify-start ma-0 pa-0">
        <v-btn v-if="showBack" rounded outlined color="#000000" width="110" @click="back">
          <span>Back</span>
        </v-btn>
      </v-col>
    </v-row>
  </v-container>
</template>

<script lang="ts">
import * as constants from '@/common/store/constants';
import { BtcWallet } from '@/common/types/pegInTx';
import EnvironmentContextProviderService from '@/common/providers/EnvironmentContextProvider';
import { ref } from 'vue';
import { useAction, useStateAttribute } from '@/common/store/helper';
import { useRouter } from 'vue-router';

export default {
  name: 'SelectBitcoinWallet',
  setup() {
    const selectedWallet = ref('');
    const showBack = ref(true);
    const router = useRouter();
    const storeConstants = constants;
    const environmentContext = EnvironmentContextProviderService.getEnvironmentContext();

    const { bitcoinWallet } = useStateAttribute('pegInTx', ['bitcoinWallet']);
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
      const TYPES_WALLETS = { WALLET_TREZOR: 'WALLET_TREZOR', WALLET_LEDGER: 'WALLET_LEDGER', WALLET_LIQUALITY: 'WALLET_LIQUALITY' };
      switch (bitcoinWallet) {
        case TYPES_WALLETS.WALLET_TREZOR:
          wallet = 'trezor';
          break;
        case TYPES_WALLETS.WALLET_LEDGER:
          wallet = 'ledger';
          break;
        case TYPES_WALLETS.WALLET_LIQUALITY:
          wallet = 'liquality';
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
    };
  }
}

// @Component
// class SelectBitcoinWallet extends Vue {
//   selectedWallet = '';
//
//   storeConstants = constants;
//
//   environmentContext = EnvironmentContextProviderService.getEnvironmentContext();
//
//   @State('pegInTx') peginTxState!: PegInTxState;
//
//   @Action(constants.PEGIN_TX_ADD_BITCOIN_WALLET, { namespace: 'pegInTx' }) addBitcoinWallet !: (wallet: BtcWallet) => void;
//
//   // eslint-disable-next-line class-methods-use-this
//   get showBack() {
//     return true;
//   }
//
//   @Emit()
//   reset(): void {
//     this.selectedWallet = '';
//   }
//
//   @Emit()
//   setBitcoinWallet(wallet: BtcWallet): void {
//     this.addBitcoinWallet(wallet);
//     this.toSendBitcoin();
//   }
//
//   @Emit()
//   back():void {
//     this.reset();
//     this.$router.push({ name: 'Home' });
//   }
//
//   @Emit()
//   toSendBitcoin(): void {
//     let wallet: string;
//     const TYPES_WALLETS = { WALLET_TREZOR: 'WALLET_TREZOR', WALLET_LEDGER: 'WALLET_LEDGER', WALLET_LIQUALITY: 'WALLET_LIQUALITY' };
//     switch (this.peginTxState.bitcoinWallet) {
//       case TYPES_WALLETS.WALLET_TREZOR:
//         wallet = 'trezor';
//         break;
//       case TYPES_WALLETS.WALLET_LEDGER:
//         wallet = 'ledger';
//         break;
//       case TYPES_WALLETS.WALLET_LIQUALITY:
//         wallet = 'liquality';
//         break;
//       default:
//         wallet = '';
//         break;
//     }
//     if (wallet) {
//       this.$router.push({ name: 'Create', params: { wallet } });
//     } else {
//       this.$router.push({ name: 'Home' });
//     }
//   }
// }
</script>
