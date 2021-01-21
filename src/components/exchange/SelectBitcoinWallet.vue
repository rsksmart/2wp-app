<template>
  <div class="exchange">
    <div class="container">
      <v-row class="mx-0 mb-5 d-flex justify-center">
        <h1>Bridging BTC and RBTC</h1>
      </v-row>
      <template v-if="!BTC2RBTC">
        <v-row class="mx-0 mt-10 d-flex justify-center">
          <p>Select your token conversion</p>
        </v-row>
        <v-row class="ma-0">
          <v-col cols="6">
            <v-btn class="wallet-button" @click="showBitcoinWallets"
                   v-bind:class="{ selected: BTC2RBTC }">
              <div>
                <v-row class="mx-0 d-flex justify-center">
                  <v-col/>
                  <v-col class="pa-0 d-flex align-center">
                    <v-img src="@/assets/exchange/btc.png" height="30" contain/>
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
          <v-col cols="6">
            <v-btn class="wallet-button"
                   v-bind:class="{ selected: RBTC2BTC }">
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
                    <v-img src="@/assets/exchange/btc.png" height="30" contain/>
                  </v-col>
                  <v-col/>
                </v-row>
                <v-row class="mx-0 d-flex justify-center">
                  <span class="wallet-button-content">RBTC to BTC</span>
                </v-row>
              </div>
            </v-btn>
          </v-col>
        </v-row>
      </template>
      <template v-if="showWallet">
        <v-row class="mx-0 mt-10 d-flex justify-center">
          <p class="text-center">Select your Bitcoin wallet</p>
        </v-row>
        <v-row class="ma-0">
          <v-col cols="4" class="d-flex justify-end">
            <v-btn class="wallet-button"
                   @click="setBitcoinWallet(storeConstants.WALLET_LEDGER)"
                   v-bind:class="{ selected: selectedWallet === storeConstants.WALLET_LEDGER }">
              <v-img class="mr-2" :src="ledgerImage" contain max-width="25"/>
              <span class="wallet-button-content">
                Ledger
              </span>
            </v-btn>
          </v-col>
          <v-col cols="4" class="d-flex justify-start">
            <v-btn outlined class="wallet-button"
                   @click="setBitcoinWallet(storeConstants.WALLET_ELECTRUM)"
                   v-bind:class="{ selected: selectedWallet === storeConstants.WALLET_ELECTRUM }">
              <v-img class="mr-2" :src="electrumImage" contain max-width="25"/>
              <span class="wallet-button-content">Electrum</span>
            </v-btn>
          </v-col>
          <v-col cols="4" class="d-flex justify-end">
            <v-btn outlined class="wallet-button"
                   @click="setBitcoinWallet(storeConstants.WALLET_TREZOR)"
                   v-bind:class="{ selected: selectedWallet === storeConstants.WALLET_TREZOR }">
              <v-img class="mr-2" :src="trezorImage" contain max-width="17"/>
              <span class="wallet-button-content">Trezor</span>
            </v-btn>
          </v-col>
        </v-row>
        <v-row class="mx-0 mt-15 d-flex justify-center">
          <v-col cols="3" class="d-flex justify-center">
            <v-btn outlined color="#00B520" rounded @click="showMoreBitcoinWallets">
              {{ moreWalletsBtn }}
            </v-btn>
          </v-col>
        </v-row>
        <template v-if="showMoreWallets">
          <v-row class="ma-0 d-flex justify-center">
            <v-col cols="4" class="d-flex justify-end">
              <v-btn outlined class="wallet-button"
                     @click="setBitcoinWallet(storeConstants.WALLET_RWALLET)"
                     v-bind:class="{ selected: selectedWallet === storeConstants.WALLET_RWALLET }">
                <v-img class="mr-2" :src="rWalletImage" contain max-width="26"/>
                <span class="wallet-button-content">rWallet</span>
              </v-btn>
            </v-col>
            <v-col cols="4" class="d-flex justify-start">
              <v-btn outlined class="wallet-button"
                     @click="setBitcoinWallet(storeConstants.WALLET_DEFIANT)"
                     v-bind:class="{ selected: selectedWallet === storeConstants.WALLET_DEFIANT }">
                <v-img class="mr-2" :src="defiantImage" contain max-width="31"/>
                <span class="wallet-button-content">Defiant</span>
              </v-btn>
            </v-col>
          </v-row>
        </template>
      </template>
    </div>
  </div>
</template>

<script lang="ts">
import { Vue, Component, Emit } from 'vue-property-decorator';
import * as constants from '@/store/constants';
import Ledger from '@/assets/icons/ledger.png';
import LedgerWhite from '@/assets/icons/ledger-white.png';
import Electrum from '@/assets/icons/electrum.png';
import ElectrumWhite from '@/assets/icons/electrum-white.png';
import Trezor from '@/assets/icons/trezor.png';
import TrezorWhite from '@/assets/icons/trezor-white.png';
import RWallet from '@/assets/icons/rWallet.png';
import RWalletWhite from '@/assets/icons/rWallet-white.png';
import Defiant from '@/assets/icons/defiant.png';
import DefiantWhite from '@/assets/icons/defiant-white.png';

@Component
export default class SelectBitcoinWallet extends Vue {
  showWallet = false;

  showMoreWallets = false;

  selectedWallet = '';

  BTC2RBTC = false;

  RBTC2BTC = false;

  storeConstants = constants;

  get moreWalletsBtn() {
    return this.showMoreWallets ? 'Show less' : 'Show more';
  }

  get ledgerImage() {
    return this.selectedWallet === constants.WALLET_LEDGER ? LedgerWhite : Ledger;
  }

  get electrumImage() {
    return this.selectedWallet === constants.WALLET_ELECTRUM ? ElectrumWhite : Electrum;
  }

  get trezorImage() {
    return this.selectedWallet === constants.WALLET_TREZOR ? TrezorWhite : Trezor;
  }

  get rWalletImage() {
    return this.selectedWallet === constants.WALLET_RWALLET ? RWalletWhite : RWallet;
  }

  get defiantImage() {
    return this.selectedWallet === constants.WALLET_DEFIANT ? DefiantWhite : Defiant;
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
