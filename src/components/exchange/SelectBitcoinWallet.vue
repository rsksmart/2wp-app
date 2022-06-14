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
            <v-col cols="3" class="d-flex justify-center">
              <v-btn outlined class="wallet-button-thin"
                     @click="setBitcoinWallet(storeConstants.WALLET_LEDGER)"
                     v-bind:class="{ selected: selectedWallet === storeConstants.WALLET_LEDGER }">
                <div class="mr-2 wallet-icon-ledger"></div>
                <span class="wallet-button-content">Ledger</span>
              </v-btn>
            </v-col>
            <v-col cols="3" class="d-flex justify-center">
              <v-btn outlined class="wallet-button-thin"
                     @click="setBitcoinWallet(storeConstants.WALLET_TREZOR)"
                     v-bind:class="{ selected: selectedWallet === storeConstants.WALLET_TREZOR }">
                <div class="mr-2 wallet-icon"></div>
                <span class="wallet-button-content">Trezor</span>
              </v-btn>
            </v-col>
            <v-col cols="3" class="d-flex justify-center">
              <div class="custom-tooltip">
                <div>
                  <v-btn outlined disabled class="wallet-button-thin-disabled">
                    <v-icon color="#B5CAB8" class="mx-2">fas fa-wallet</v-icon>
                    <span class="wallet-button-content">Others</span>
                  </v-btn>
                </div>
                <span class="tooltiptext" style="margin-left:23px;">Coming soon</span>
              </div>
            </v-col>
          </v-row>
        </template>
      </v-col>
    </v-row>
    <v-row class="mx-0">
      <v-col cols="2" class="d-flex justify-start ma-0 pa-0">
        <v-btn v-if="showBack" rounded outlined color="#00B520" width="110" @click="back">
          <span>Back</span>
        </v-btn>
      </v-col>
    </v-row>
  </v-container>
</template>

<script lang="ts">
import {
  Vue, Component, Emit,
} from 'vue-property-decorator';
import { Action, State } from 'vuex-class';
import * as constants from '@/store/constants';
import { BtcWallet, PegInTxState } from '@/types/pegInTx';
import EnvironmentContextProviderService from '@/providers/EnvironmentContextProvider';

@Component
export default class SelectBitcoinWallet extends Vue {
  selectedWallet = '';

  storeConstants = constants;

  environmentContext = EnvironmentContextProviderService.getEnvironmentContext();

  @State('pegInTx') peginTxState!: PegInTxState;

  @Action(constants.PEGIN_TX_ADD_BITCOIN_WALLET, { namespace: 'pegInTx' }) addBitcoinWallet !: (wallet: BtcWallet) => void;

  // eslint-disable-next-line class-methods-use-this
  get showBack() {
    return true;
  }

  @Emit()
  reset(): void {
    this.selectedWallet = '';
  }

  @Emit()
  setBitcoinWallet(wallet: BtcWallet): void {
    this.addBitcoinWallet(wallet);
    this.toSendBitcoin();
  }

  @Emit()
  back():void {
    this.reset();
    this.$router.push({ name: 'Home' });
  }

  @Emit()
  toSendBitcoin(): void {
    let wallet: string;
    switch (this.peginTxState.bitcoinWallet) {
      case 'WALLET_TREZOR':
        wallet = 'trezor';
        break;
      case 'WALLET_LEDGER':
        wallet = 'ledger';
        break;
      default:
        wallet = '';
        break;
    }
    if (wallet) {
      this.$router.push({ name: 'Create', params: { wallet } });
    } else {
      this.$router.push({ name: 'Home' });
    }
  }
}
</script>
