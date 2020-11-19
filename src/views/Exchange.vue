<template>
  <div class="exchange">
    <div class="container">
      <v-row class="mx-0 my-5 d-flex justify-center">
        <h1>Bridging BTC & RBTC</h1>
      </v-row>
      <v-row class="mx-0 mt-10 d-flex justify-center">
        <p>Select your token conversion</p>
      </v-row>
      <v-row class="ma-0">
        <v-col/>
        <v-col cols="3" class="d-flex justify-end">
          <v-btn outlined class="wallet-button" @click="showBitcoinWallets"
                 v-bind:class="{ selected: BTC2RBTC }">
            <span v-bind:class="{ whiteish: BTC2RBTC }">BTC to RBTC</span>
          </v-btn>
        </v-col>
        <v-col cols="3" class="d-flex justify-start">
          <v-btn outlined class="wallet-button">
            <span>RBTC to BTC</span>
          </v-btn>
        </v-col>
        <v-col/>
      </v-row>
    </div>
    <template v-if="showWallet" class="container">
      <v-row class="mx-0 mt-10 d-flex justify-center">
        <p class="text-center">Select your Bitcoin wallet</p>
      </v-row>
      <v-row class="ma-0">
        <v-col/>
        <v-col cols="3" class="d-flex justify-end">
          <v-btn outlined class="wallet-button"
                 @click="setBitcoinWallet(storeConstants.WALLET_LEDGER)"
                 v-bind:class="{ selected: selectedWallet === storeConstants.WALLET_LEDGER }">
            <v-img class="mr-2" :src="ledgerImage" contain max-width="25"/>
            <span v-bind:class="{ whiteish: selectedWallet === storeConstants.WALLET_LEDGER }">
              Ledger
            </span>
          </v-btn>
        </v-col>
        <v-col cols="3" class="d-flex justify-start">
          <v-btn outlined class="wallet-button"
                 @click="setBitcoinWallet(storeConstants.WALLET_ELECTRUM)"
                 v-bind:class="{ selected: selectedWallet === storeConstants.WALLET_ELECTRUM }">
            <v-img class="mr-2" :src="electrumImage" contain max-width="25"/>
            <span v-bind:class="{ whiteish: selectedWallet === storeConstants.WALLET_ELECTRUM }">
              Electrum
            </span>
          </v-btn>
        </v-col>
        <v-col/>
      </v-row>
      <v-row class="ma-0">
        <v-col/>
        <v-col cols="3" class="d-flex justify-end">
          <v-btn outlined class="wallet-button"
                 @click="setBitcoinWallet(storeConstants.WALLET_TREZOR)"
                 v-bind:class="{ selected: selectedWallet === storeConstants.WALLET_TREZOR }">
            <v-img class="mr-2" :src="trezorImage" contain max-width="17"/>
            <span v-bind:class="{ whiteish: selectedWallet === storeConstants.WALLET_TREZOR }">
              Trezor
            </span>
          </v-btn>
        </v-col>
        <v-col cols="3"/>
        <v-col/>
      </v-row>
      <v-row class="mx-0 d-flex justify-center">
        <v-col cols="3" class="d-flex justify-center">
          <v-btn outlined color="#1732A4" rounded @click="showMoreBitcoinWallets">
            {{ moreWalletsBtn }}
          </v-btn>
        </v-col>
      </v-row>
      <template v-if="showMoreWallets">
        <v-row class="ma-0">
          <v-col/>
          <v-col cols="3" class="d-flex justify-end">
            <v-btn outlined class="wallet-button"
                   @click="setBitcoinWallet(storeConstants.WALLET_RWALLET)"
                   v-bind:class="{ selected: selectedWallet === storeConstants.WALLET_RWALLET }">
              <v-img class="mr-2" :src="rWalletImage" contain max-width="26"/>
              <span v-bind:class="{ whiteish: selectedWallet === storeConstants.WALLET_RWALLET }">
                rWallet
              </span>
            </v-btn>
          </v-col>
          <v-col cols="3" class="d-flex justify-start">
            <v-btn outlined class="wallet-button"
                   @click="setBitcoinWallet(storeConstants.WALLET_DEFIANT)"
                   v-bind:class="{ selected: selectedWallet === storeConstants.WALLET_DEFIANT }">
              <v-img class="mr-2" :src="defiantImage" contain max-width="31"/>
              <span v-bind:class="{ whiteish: selectedWallet === storeConstants.WALLET_DEFIANT }">
                Defiant
              </span>
            </v-btn>
          </v-col>
          <v-col/>
        </v-row>
      </template>
      <v-row class="mx-0">
        <v-col cols="3">
          <v-btn outlined rounded color="#1732A4" @click="reset">
            <v-icon class="mr-2">mdi-arrow-left</v-icon>
            PREVIOUS STEP
          </v-btn>
        </v-col>
        <v-col/>
        <v-col cols="3" class="d-flex justify-end">
          <v-btn :disabled="!selectedWallet" outlined rounded @click="toSendBitcoin"
                 v-bind:class="{ selected: selectedWallet }">
            <span v-bind:class="{ whiteish: selectedWallet }">
              NEXT
            </span>
            <v-icon v-bind:class="{ whiteish: selectedWallet }" class="ml-2">
              mdi-arrow-right
            </v-icon>
          </v-btn>
        </v-col>
      </v-row>
    </template>
  </div>
</template>

<script lang="ts">
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
import { Vue, Component, Emit } from 'vue-property-decorator';
import * as constants from '@/store/constants';

@Component
export default class Exchange extends Vue {
  showWallet = false;

  showMoreWallets = false;

  selectedWallet = '';

  BTC2RBTC = false;

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
  showMoreBitcoinWallets(): string {
    this.showMoreWallets = !this.showMoreWallets;
    if (this.showMoreWallets) this.$vuetify.goTo(document.body.scrollHeight);
  }

  @Emit()
  showBitcoinWallets(): void {
    this.BTC2RBTC = true;
    this.showWallet = true;
  }

  @Emit('bitcoinWalletSelected')
  toSendBitcoin(): void {
    console.log(this.selectedWallet);
  }

  @Emit()
  setBitcoinWallet(wallet: string): void {
    switch (wallet) {
      case constants.WALLET_LEDGER: {
        this.selectedWallet = constants.WALLET_LEDGER;
        break;
      }
      case constants.WALLET_ELECTRUM: {
        this.selectedWallet = constants.WALLET_ELECTRUM;
        break;
      }
      case constants.WALLET_TREZOR: {
        this.selectedWallet = constants.WALLET_TREZOR;
        break;
      }
      case constants.WALLET_RWALLET: {
        this.selectedWallet = constants.WALLET_RWALLET;
        break;
      }
      case constants.WALLET_DEFIANT: {
        this.selectedWallet = constants.WALLET_DEFIANT;
        break;
      }
      default: {
        break;
      }
    }
  }
}
</script>
