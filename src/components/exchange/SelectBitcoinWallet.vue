<template>
  <v-container fluid class="exchange">
    <v-row justify="center" class="mx-0">
      <v-col>
        <v-row class="mx-0 mb-5 d-flex justify-center">
          <h2>Bridging BTC and RBTC</h2>
        </v-row>
        <template v-if="!BTC2RBTC">
          <v-row class="mx-0 mt-10 d-flex justify-center">
            <p>Select your token conversion</p>
          </v-row>
          <v-row justify="center" class="ma-0">
            <v-col cols="4" class="d-flex justify-end pb-0">
              <v-btn class="wallet-button mb-0" @click="showBitcoinWallets"
                     v-bind:class="{ selected: BTC2RBTC }">
                <div>
                  <v-row class="mx-0 d-flex justify-center">
                    <v-col/>
                    <v-col class="pa-0 d-flex align-center">
                      <v-img src="@/assets/exchange/btc.png" height="40" contain/>
                    </v-col>
                    <v-col class="pa-0 d-flex align-center">
                      <v-icon class="wallet-button-content">mdi-arrow-right</v-icon>
                    </v-col>
                    <v-col class="pa-0 d-flex align-center">
                      <v-img src="@/assets/exchange/rbtc.png" height="40" contain/>
                    </v-col>
                    <v-col/>
                  </v-row>
                  <v-row class="mx-0 d-flex justify-center">
                    <span class="wallet-button-content">BTC to RBTC</span>
                  </v-row>
                </div>
              </v-btn>
            </v-col>
            <v-col cols="4" class="d-flex justify-start pb-0">
              <v-btn class="wallet-button-disabled mb-0" disabled outlined>
                <div>
                  <v-row class="mx-0 d-flex justify-center">
                    <v-col/>
                    <v-col class="pa-0 d-flex align-center">
                      <v-img src="@/assets/exchange/rbtc-disable.png" height="40" contain/>
                    </v-col>
                    <v-col class="pa-0 d-flex align-center">
                      <v-icon color="#B5CAB8">mdi-arrow-right</v-icon>
                    </v-col>
                    <v-col class="pa-0 d-flex align-center">
                      <v-img src="@/assets/exchange/btc-disable.png" height="40" contain/>
                    </v-col>
                    <v-col/>
                  </v-row>
                  <v-row class="mx-0 d-flex justify-center">
                  <span class="gray-greenish">
                    RBTC to BTC (soon)
                  </span>
                  </v-row>
                </div>
              </v-btn>
            </v-col>
          </v-row>
          <v-row class="mx-0 mt-10 d-flex justify-center">
            <p>Or check the status of your transaction</p>
          </v-row>
          <v-row class="d-flex justify-center pt-4">
            <v-btn class="wallet-button" @click="toPegInStatus"
                   v-bind:class="{ selected: BTC2RBTC }">
              <div>
                <v-row class="mx-0 d-flex justify-center">
                  <v-col/>
                  <v-col class="pa-0 d-flex align-center mx-3">
                    <v-img src="@/assets/status/status-icon.svg" width="60" contain/>
                  </v-col>
                  <v-col/>
                </v-row>
                <v-row class="mx-0 d-flex justify-center mt-2">
                  <span class="wallet-button-content">Transaction status</span>
                </v-row>
              </div>
            </v-btn>
          </v-row>
        </template>
        <template v-if="showWallet">
          <v-row class="mx-0 mt-10 d-flex justify-center">
            <p class="text-center">Select your Bitcoin wallet</p>
          </v-row>
          <v-row justify="center" class="ma-0">
            <v-col cols="4" class="d-flex justify-end px-12">
              <v-btn outlined class="wallet-button-thin"
                     @click="setBitcoinWallet(storeConstants.WALLET_LEDGER)"
                     v-bind:class="{ selected: selectedWallet === storeConstants.WALLET_LEDGER }">
                <div class="mr-2 wallet-icon-ledger"></div>
                <span class="wallet-button-content">Ledger</span>
              </v-btn>
            </v-col>
            <v-col cols="4" class="d-flex justify-start px-12">
              <v-btn outlined class="wallet-button-thin"
                     @click="setBitcoinWallet(storeConstants.WALLET_TREZOR)"
                     v-bind:class="{ selected: selectedWallet === storeConstants.WALLET_TREZOR }">
                <div class="mr-2 wallet-icon"></div>
                <span class="wallet-button-content">Trezor</span>
              </v-btn>
            </v-col>
            <v-col v-if="false" cols="2" class="d-flex justify-start">
              <v-btn outlined disabled class="wallet-button-thin-disabled"
                     @click="setBitcoinWallet(storeConstants.WALLET_ELECTRUM)">
                <v-img class="mr-2" src="@/assets/wallet-icons/electrum-gray.png"
                       contain max-width="25"/>
                <v-col class="d-flex flex-column pa-0">
                  <span class="gray-greenish">More</span>
                  <span class="gray-greenish">(Coming soon)</span>
                </v-col>
              </v-btn>
            </v-col>
          </v-row>
          <v-row class="mx-0 mt-15 d-flex justify-center">
            <v-col cols="3" class="d-flex justify-center">
              <v-btn class="px-5" width="150" height="40" outlined color="#B5CAB8" rounded
                     @click="showMoreBitcoinWallets" disabled>
                <h3>
                  {{ moreWalletsBtn }}
                  <v-row class="d-flex justify-center">More</v-row>
                  <v-row class="d-flex justify-center">(Coming soon)</v-row>
                </h3>
              </v-btn>
            </v-col>
          </v-row>
          <template v-if="showMoreWallets">
            <v-row class="ma-0 d-flex justify-center">
              <v-col/>
              <v-col cols="3" class="d-flex justify-end">
                <v-btn outlined class="wallet-button-thin"
                       @click="setBitcoinWallet(storeConstants.WALLET_RWALLET)"
                 v-bind:class="{ selected: selectedWallet === storeConstants.WALLET_RWALLET }">
                  <v-img class="mr-2" :src="rWalletImage" contain max-width="20"/>
                  <span class="wallet-button-content">rWallet</span>
                </v-btn>
              </v-col>
              <v-col cols="3" class="d-flex justify-start">
                <v-btn outlined class="wallet-button-thin"
                       @click="setBitcoinWallet(storeConstants.WALLET_DEFIANT)"
                   v-bind:class="{ selected: selectedWallet === storeConstants.WALLET_DEFIANT }">
                  <v-img class="mr-2" :src="defiantImage" contain max-width="31"/>
                  <span class="wallet-button-content">Defiant</span>
                </v-btn>
              </v-col>
              <v-col/>
            </v-row>
          </template>
        </template>
      </v-col>
    </v-row>
  </v-container>
</template>

<script lang="ts">
import { Vue, Component, Emit } from 'vue-property-decorator';
import * as constants from '@/store/constants';
import Trezor from '@/assets/wallet-icons/trezor.png';
import TrezorWhite from '@/assets/wallet-icons/trezor-white.png';

@Component
export default class SelectBitcoinWallet extends Vue {
  showWallet = false;

  showMoreWallets = false;

  selectedWallet = '';

  BTC2RBTC = false;

  RBTC2BTC = false;

  storeConstants = constants;

  get moreWalletsBtn() {
    return this.showMoreWallets ? 'Show less' : '';
  }

  get trezorImage() {
    return this.selectedWallet === constants.WALLET_TREZOR ? TrezorWhite : Trezor;
  }

  @Emit()
  reset(): void {
    this.BTC2RBTC = false;
    this.showWallet = false;
    this.showMoreWallets = false;
    this.selectedWallet = '';
  }

  @Emit()
  showMoreBitcoinWallets(): void {
    this.showMoreWallets = !this.showMoreWallets;
    if (this.showMoreWallets) this.$vuetify.goTo(document.body.scrollHeight);
  }

  @Emit()
  toPegInStatus(): void {
    if (this.$route.path !== '/status') this.$router.push('/status');
  }

  @Emit()
  showBitcoinWallets(): void {
    this.BTC2RBTC = true;
    this.showWallet = true;
  }

  @Emit('bitcoinWalletSelected')
  toSendBitcoin(): string {
    return this.selectedWallet;
  }

  @Emit()
  setBitcoinWallet(wallet: string): void {
    switch (wallet) {
      case constants.WALLET_LEDGER: {
        this.selectedWallet = constants.WALLET_LEDGER;
        this.toSendBitcoin();
        break;
      }
      case constants.WALLET_ELECTRUM: {
        this.selectedWallet = constants.WALLET_ELECTRUM;
        this.toSendBitcoin();
        break;
      }
      case constants.WALLET_TREZOR: {
        this.selectedWallet = constants.WALLET_TREZOR;
        this.toSendBitcoin();
        break;
      }
      case constants.WALLET_RWALLET: {
        this.selectedWallet = constants.WALLET_RWALLET;
        this.toSendBitcoin();
        break;
      }
      case constants.WALLET_DEFIANT: {
        this.selectedWallet = constants.WALLET_DEFIANT;
        this.toSendBitcoin();
        break;
      }
      default: {
        break;
      }
    }
  }
}
</script>
