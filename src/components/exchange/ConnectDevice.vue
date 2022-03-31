<template>
  <div class="transactions">
    <v-col offset="2" cols="8">
      <v-row justify="center" class="mx-0">
        <h1>Connect your {{ walletName }}</h1>
      </v-row>
      <v-row justify="center" class="ma-0 mb-10">
        <p class="ma-0">(Keep your {{ walletName }} close so you can authorize access)</p>
      </v-row>
      <v-row justify="center">
        <v-col id="connect-device-steps" class="mb-10" cols="12">
          <v-row class="ma-0">
            <v-col cols="1">
              <div class="number">1</div>
            </v-col>
            <v-col cols="11">
              <p class="ma-0">Plug your {{ walletName }} device into your computer</p>
            </v-col>
          </v-row>
          <v-row class="ma-0">
            <v-col cols="1">
              <div class="number">2</div>
            </v-col>
            <v-col cols="11">
              <p class="ma-0">Insert {{ walletName }} device PIN code</p>
            </v-col>
          </v-row>
          <v-row v-if="isLedgerWallet" class="ma-0">
            <v-col cols="1">
              <div class="number">3</div>
            </v-col>
            <v-col cols="11">

              <p class="ma-0">
                Select the {{environmentContext.getBtcLedgerAppName()}} app in your device
              </p>
            </v-col>
          </v-row>
        </v-col>
      </v-row>
      <v-row class="mx-0 d-flex justify-center">
        <v-img :src="deviceImagePath" height="300" contain />
      </v-row>

      <v-row class="mx-0 mt-5">
        <v-col cols="2" class="d-flex justify-start ma-0 pa-0">
          <v-btn rounded outlined color="#00B520" width="110"
                 :disabled="sendBitcoinState === 'error' || sendBitcoinState === 'loading'"
                 @click="back">
            <span>Back</span>
          </v-btn>
        </v-col>
        <v-col cols="10" class="d-flex justify-end ma-0 py-0 pl-0">
          <v-btn v-if="sendBitcoinState === 'idle' || sendBitcoinState === 'error'"
                 rounded color="#00B520" width="110"
                 :disabled="sendBitcoinState === 'error'"
                 @click="continueToForm">
            <span class="whiteish">Continue</span>
          </v-btn>
          <v-progress-circular v-if="sendBitcoinState === 'loading'"
                               indeterminate :size="36" :width="4" color="#00B520" />
        </v-col>
      </v-row>
    </v-col>
  </div>
</template>

<script lang="ts">
import {
  Component, Prop, Vue, Emit,
} from 'vue-property-decorator';
import { Getter, State, Action } from 'vuex-class';
import * as constants from '@/store/constants';
import { PegInTxState } from '@/types/pegInTx';
import LedgerConnect from '@/assets/exchange/ledger/connect_ledger.png';
import TrezorConnect from '@/assets/exchange/trezor/connect_trezor.png';
import Connect from '@/assets/exchange/wallet.png';
import { SendBitcoinState } from '@/types';
import EnvironmentContextProviderService from '@/providers/EnvironmentContextProvider';

@Component
export default class ConnectDevice extends Vue {
  @Prop() device!: string;

  @Prop() sendBitcoinState!: SendBitcoinState;

  @State('pegInTx') peginTxState!: PegInTxState;

  @Getter(constants.WALLET_NAME, { namespace: 'pegInTx' }) walletName!: string;

  @Action(constants.PEGIN_TX_CLEAR_STATE, { namespace: 'pegInTx' }) clearStore !: () => void;

  environmentContext = EnvironmentContextProviderService.getEnvironmentContext();

  get deviceImagePath() {
    if (this.peginTxState.bitcoinWallet === constants.WALLET_LEDGER) return LedgerConnect;
    if (this.peginTxState.bitcoinWallet === constants.WALLET_TREZOR) return TrezorConnect;
    return Connect;
  }

  get isLedgerWallet() {
    return this.peginTxState.bitcoinWallet === constants.WALLET_LEDGER;
  }

  @Emit('continueToForm')
  continueToForm() {
    return this.peginTxState.bitcoinWallet;
  }

  @Emit()
  // eslint-disable-next-line class-methods-use-this
  back() {
    // TODO: Point to Home route
    this.clearStore();
    this.$router.push({ name: 'PegIn' });
  }
}
</script>
