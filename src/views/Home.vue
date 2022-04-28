<template>
  <v-container fluid class="exchange normalized-height container
  max-width mx-6">
    <v-container fluid class="exchange">
      <v-row justify="center" class="mx-0">
        <v-col>
          <v-row class="mx-0 mb-5 d-flex justify-center">
            <h2>Bridging {{environmentContext.getBtcTicker()}} and
            {{environmentContext.getRbtcTicker()}}</h2>
          </v-row>
          <template>
            <v-row class="mx-0 mt-10 d-flex justify-center">
              <p>Select your token conversion</p>
            </v-row>
            <v-row justify="center" class="ma-0">
              <v-col cols="4" class="d-flex justify-end pb-0">
                <v-btn @click="selectPegIn" :disabled="!isAllowedBrowser" outlined
                       v-bind:class="[ this.btnWalletClass, btcToRbtc ? 'selected' : '' ]">
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
                      <span class="wallet-button-content">{{environmentContext.getBtcTicker()}} to
                      {{environmentContext.getRbtcTicker()}}</span>
                    </v-row>
                  </div>
                </v-btn>
              </v-col>
              <v-col cols="4" class="d-flex justify-start pb-0">
                <v-tooltip bottom>
                  <template v-slot:activator="{ on, attrs }">
                    <v-col  v-bind="attrs" v-on="on" class="ma-0 pa-0" cols="auto">
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
                          {{environmentContext.getRbtcTicker()}} to
                          {{environmentContext.getBtcTicker()}}
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
    <v-container>
      <v-row>
        <v-btn @click="getAddress">GetAddress batch</v-btn>
        <v-col>
          {{addresses}}
        </v-col>
      </v-row>
    </v-container>
  </v-container>
</template>

<script lang="ts">
import {
  Vue, Component, Emit,
} from 'vue-property-decorator';
import * as Bowser from 'bowser';
import { Action, State } from 'vuex-class';
import SelectBitcoinWallet from '@/components/exchange/SelectBitcoinWallet.vue';
import * as constants from '@/store/constants';
import { PegInTxState, WalletAddress } from '@/types/pegInTx';
import EnvironmentContextProviderService from '@/providers/EnvironmentContextProvider';
import { SessionState, TransactionType } from '@/types/session';
import LiqualityService from '@/services/LiqualityService';

@Component({
  components: {
    SelectBitcoinWallet,
  },
})
export default class Home extends Vue {
  STATUS = false;

  browser = Bowser.getParser(window.navigator.userAgent);

  environmentContext = EnvironmentContextProviderService.getEnvironmentContext();

  addresses: WalletAddress[] = [];

  liqualityService: LiqualityService = new LiqualityService();

  @State('pegInTx') peginTxState!: PegInTxState;

  @State('web3Session') sessionState!: SessionState;

  @Action(constants.PEGIN_TX_CLEAR_STATE, { namespace: 'pegInTx' }) clear !: () => void;

  @Action(constants.PEGIN_TX_INIT, { namespace: 'pegInTx' }) init !: () => Promise<void>;

  @Action(constants.SESSION_ADD_TX_TYPE, { namespace: 'web3Session' }) addPeg!: (peg: TransactionType) => void;

  get btcToRbtc(): boolean {
    return this.sessionState.txType === constants.PEG_IN_TRANSACTION_TYPE;
  }

  get rbtcToBtc(): boolean {
    return this.sessionState.txType === constants.PEG_OUT_TRANSACTION_TYPE;
  }

  @Emit()
  selectPegIn(): void {
    this.addPeg(constants.PEG_IN_TRANSACTION_TYPE);
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
  }

  get isAllowedBrowser() {
    return this.browser.getBrowserName() === 'Chrome' || window.navigator.brave;
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

  getAddress() {
    this.liqualityService.getAccountAddresses(10, 0)
      .then((addr) => {
        this.addresses = addr;
      })
      .catch(console.error);
  }
}
</script>
