<template>
  <v-container fluid class="exchange normalized-height container
  max-width mx-6">
    <v-container fluid class="exchange">
      <v-row justify="center" class="mx-0">
        <v-col>
          <v-row class="mx-0 mb-5 d-flex justify-center">
            <h2>Bridging BTC and RBTC</h2>
          </v-row>
          <template>
            <v-row class="mx-0 mt-10 d-flex justify-center">
              <p>Select your token conversion</p>
            </v-row>
            <v-row justify="center" class="ma-0">
              <v-col cols="4" class="d-flex justify-end pb-0">
                <v-btn @click="selectPegIn" :disabled="!isAllowedBrowser" outlined
                       v-bind:class="[ this.btnWalletClass, BTC2RBTC ? 'selected' : '' ]">
                  <div>
                    <v-row class="mx-0 d-flex justify-center">
                      <v-col/>
                      <v-col class="pa-0 d-flex align-center">
                        <v-img :src="btcIcon" height="40" contain/>
                      </v-col>
                      <v-col class="pa-0 d-flex align-center">
                        <v-icon class="wallet-button-content">mdi-arrow-right</v-icon>
                      </v-col>
                      <v-col class="pa-0 d-flex align-center">
                        <v-img :src="rbtcIcon" height="40" contain/>
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
                <div class="custom-tooltip">
                  <v-col class="ma-0 pa-0" cols="auto">
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
                  <span class="tooltiptext">Coming soon</span>
                </div>
              </v-col>
            </v-row>
            <v-row class="mx-0 mt-10 d-flex justify-center">
              <p>Or check the status of your transaction</p>
            </v-row>
            <v-row class="d-flex justify-center pt-4">
              <v-btn @click="toPegInStatus" outlined
                     v-bind:class="[ this.btnWalletClass, STATUS ? 'selected' : '' ]"
                     :disabled="!isAllowedBrowser">
                <div>
                  <v-row class="mx-0 d-flex justify-center">
                    <v-col/>
                    <v-col class="pa-0 d-flex align-center mx-3">
                      <v-img :src="statusIcon" width="60" contain/>
                    </v-col>
                    <v-col/>
                  </v-row>
                  <v-row class="mx-0 d-flex justify-center mt-2">
                    <span class="wallet-button-content">Transaction status</span>
                  </v-row>
                </div>
              </v-btn>
            </v-row>
            <v-row v-if="!isAllowedBrowser" class="mx-0 mt-10 d-flex justify-center">
              <v-alert
              outlined
              type="warning"
              prominent
              border="left"
              >
                Only Chrome browser is allowed
              </v-alert>
            </v-row>
          </template>
        </v-col>
      </v-row>
    </v-container>
  </v-container>
</template>

<script lang="ts">
import {
  Vue, Component, Emit, Prop,
} from 'vue-property-decorator';
import * as Bowser from 'bowser';
import { Action, State } from 'vuex-class';
import SelectBitcoinWallet from '@/components/exchange/SelectBitcoinWallet.vue';
import * as constants from '@/store/constants';
import { PegInTxState } from '@/store/peginTx/types';

@Component({
  components: {
    SelectBitcoinWallet,
  },
})
export default class Home extends Vue {
  @Prop({ default: '' }) peg!: string;

  BTC2RBTC = false;

  RBTC2BTC = false;

  STATUS = false;

  browser = Bowser.getParser(window.navigator.userAgent);

  @State('pegInTx') peginTxState!: PegInTxState;

  @Action(constants.PEGIN_TX_CLEAR_STATE, { namespace: 'pegInTx' }) clear !: () => void;

  @Action(constants.PEGIN_TX_INIT, { namespace: 'pegInTx' }) init !: () => Promise<void>;

  get showWallet(): boolean {
    return this.RBTC2BTC || this.BTC2RBTC;
  }

  @Emit()
  reset(): void {
    this.BTC2RBTC = false;
    this.RBTC2BTC = false;
  }

  @Emit()
  selectPegIn(): void {
    this.BTC2RBTC = true;
    this.$router.push({ name: 'PegIn' });
  }

  @Emit()
  toPegInStatus(): void {
    this.STATUS = true;
    if (this.$route.path !== '/status') this.$router.push('/status');
  }

  async created() {
    this.clear();
    await this.init();
    this.STATUS = false;
    this.BTC2RBTC = this.peg === 'BTC2RBTC';
    this.RBTC2BTC = this.peg === 'RBTC2BTC';
  }

  get isAllowedBrowser() {
    return this.browser.getBrowserName() === 'Chrome';
  }

  get btnWalletClass() {
    return this.isAllowedBrowser ? 'wallet-button mb-0' : 'wallet-button-disabled mb-0';
  }

  get btcIcon() {
    const btcIcon = this.isAllowedBrowser ? 'btc.png' : 'btc-disable.png';
    // eslint-disable-next-line global-require, import/no-dynamic-require
    return require(`@/assets/exchange/${btcIcon}`);
  }

  get rbtcIcon() {
    const rbtcIcon = this.isAllowedBrowser ? 'rbtc.png' : 'rbtc-disable';
    // eslint-disable-next-line global-require, import/no-dynamic-require
    return require(`@/assets/exchange/${rbtcIcon}`);
  }

  get statusIcon() {
    const statusIcon = this.isAllowedBrowser ? 'status-icon.svg' : 'status-icon-disabled.svg';
    // eslint-disable-next-line global-require, import/no-dynamic-require
    return require(`@/assets/status/${statusIcon}`);
  }
}
</script>
