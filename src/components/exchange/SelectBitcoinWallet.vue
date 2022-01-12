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
  Vue, Component, Emit, Prop,
} from 'vue-property-decorator';
import { Action, State } from 'vuex-class';
import * as constants from '@/store/constants';
import { TransactionType } from '@/store/session/types';
import { PegInTxState } from '@/store/peginTx/types';
import EnvironmentContextProviderService from '@/providers/EnvironmentContextProvider';

@Component
export default class SelectBitcoinWallet extends Vue {
  selectedWallet = '';

  storeConstants = constants;

  environmentContext = EnvironmentContextProviderService.getEnvironmentContext();

  @Prop({ default: '' }) peg!: string;

  @State('pegInTx') peginTxState!: PegInTxState;

  @Action(constants.SESSION_ADD_TX_TYPE, { namespace: 'web3Session' }) addPeg!: (peg: TransactionType) => void;

  @Action(constants.PEGIN_TX_ADD_BITCOIN_WALLET, { namespace: 'pegInTx' }) addBitcoinWallet !: any;

  // eslint-disable-next-line class-methods-use-this
  get showBack() {
    return true;
  }

  @Emit()
  reset(): void {
    this.selectedWallet = '';
  }

  @Emit()
  setBitcoinWallet(wallet: string): void {
    this.addBitcoinWallet(wallet);
    this.toSendBitcoin();
  }

  @Emit()
  // eslint-disable-next-line class-methods-use-this
  back():void {
    this.reset();
    this.addBitcoinWallet('');
    this.$router.push({ name: 'Home' });
  }

  @Emit()
  toSendBitcoin(): void {
    this.addPeg('PEG_IN');
    if (this.peginTxState.bitcoinWallet === constants
      .WALLET_LEDGER) this.$router.push({ name: 'Exchange', params: { selectedWallet: 'SendBitcoinLedger' } });
    if (this.peginTxState.bitcoinWallet === constants
      .WALLET_TREZOR) this.$router.push({ name: 'Exchange', params: { selectedWallet: 'SendBitcoinTrezor' } });
  }
}
</script>
