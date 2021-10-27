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
              <v-tooltip bottom>
                <template v-slot:activator="{ on, attrs }">
                  <v-col  v-bind="attrs" v-on="on" class="ma-0 pa-0">
                    <v-btn class="wallet-button-disabled mb-0" outlined disabled>
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
                          RBTC to BTC
                        </span>
                        </v-row>
                      </div>
                    </v-btn>
                  </v-col>
                </template>
                <span>Coming soon</span>
              </v-tooltip>
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
              <v-tooltip bottom>
                <template v-slot:activator="{ on, attrs }">
                  <div v-bind="attrs" v-on="on">
                    <v-btn outlined disabled class="wallet-button-thin-disabled">
                      <v-icon color="#B5CAB8" class="mx-2">fas fa-wallet</v-icon>
                      <span class="wallet-button-content">Others</span>
                    </v-btn>
                  </div>
                </template>
                <span>Coming soon</span>
              </v-tooltip>
            </v-col>
          </v-row>
        </template>
      </v-col>
    </v-row>
    <v-row>
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
import * as constants from '@/store/constants';

@Component
export default class SelectBitcoinWallet extends Vue {
  selectedWallet = '';

  BTC2RBTC = false;

  RBTC2BTC = false;

  storeConstants = constants;

  @Prop({ default: '' }) peg!: string;

  get showBack() {
    return this.BTC2RBTC || this.RBTC2BTC;
  }

  get showWallet(): boolean {
    return this.RBTC2BTC || this.BTC2RBTC;
  }

  @Emit()
  reset(): void {
    this.BTC2RBTC = false;
    this.RBTC2BTC = false;
    this.selectedWallet = '';
  }

  @Emit()
  toPegInStatus(): void {
    if (this.$route.path !== '/status') this.$router.push('/status');
  }

  @Emit()
  showBitcoinWallets(): void {
    this.BTC2RBTC = true;
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

  @Emit()
  // eslint-disable-next-line class-methods-use-this
  back():void {
    this.reset();
  }

  created() {
    this.BTC2RBTC = this.peg === 'BTC2RBTC';
    this.RBTC2BTC = this.peg === 'RBTC2BTC';
  }
}
</script>
