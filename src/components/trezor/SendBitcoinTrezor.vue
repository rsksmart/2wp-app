<template>
  <div class="container">
    <template v-if="!trezorDataReady">
      <v-row class="mx-0 mb-5 mt-10 d-flex justify-center">
        <v-progress-circular indeterminate :size="60" :width="8" color="#00B520"/>
      </v-row>
      <v-row class="mx-0 d-flex justify-center">
        <h2>Connect your Trezor</h2>
      </v-row>
      <v-row class="ma-0 mt-5 d-flex justify-center">
        <p class="ma-0">Plug in your Trezor device to your computer</p>
      </v-row>
      <v-row class="ma-0 mb-8 d-flex justify-center">
        <p class="ma-0">Keep your Trezor close so you can authorize access</p>
      </v-row>
      <v-row class="mx-0 d-flex justify-center">
        <v-img src="@/assets/exchange/trezor/connect_trezor.png" height="410" contain/>
      </v-row>
    </template>
    <template v-if="trezorDataReady">
      <component :is="currentComponent" :bitcoinWallet="bitcoinWallet" :balances="balances"
                 @confirmTx="toConfirmTx" @successConfirmation="toTrackingId"
                 @unused="getUnusedAddresses" :unusedAddresses="unusedAddresses"/>
    </template>
    <template v-if="showDialog">
      <v-dialog v-model="showDialog" width="600" persistent>
        <v-card class="container dialog">
          <v-row class="mx-0 mt-10 mb-3 d-flex justify-center">
            <h2>BTC TO RBTC CONVERSION REQUIRES THESE STEPS</h2>
          </v-row>
          <v-row class="mx-0 d-flex justify-center">
            <v-col cols="10">
              <p>Remember that the conversion process from BTC to RBTC must have 100 confirmations.
                This means the conversion will take 17 hours.</p>
            </v-col>
          </v-row>
          <v-row class="mx-0 mb-3 mt-1">
            <v-img src="@/assets/exchange/trezor/btc_conversion.png" height="135" contain/>
          </v-row>
          <v-row class="mx-0 mt-8 mb-10 d-flex justify-center">
            <v-btn width="142" height="50" dense rounded color="#00B520" @click="closeDialog">
              <span class="whiteish">Continue</span>
            </v-btn>
          </v-row>
        </v-card>
      </v-dialog>
    </template>
  </div>
</template>

<script lang="ts">
import {
  Component, Prop, Emit,
  Vue,
} from 'vue-property-decorator';
import SendBitcoinForm from '@/components/exchange/SendBitcoinForm.vue';
import ConfirmTransaction from '@/components/trezor/ConfirmTransaction.vue';
import TrackingId from '@/components/exchange/TrackingId.vue';
import TrezorService from '@/services/TrezorService';
import ApiService from '@/services/ApiService';
import { PegInTxState } from '@/store/peginTx/types';
import * as constants from '@/store/constants';
import { Action, State } from 'vuex-class';
import TrezorConnect, { DEVICE, DEVICE_EVENT } from 'trezor-connect';
import { AccountBalance } from '@/services/types';

@Component({
  components: {
    SendBitcoinForm,
    ConfirmTransaction,
    TrackingId,
  },
})
export default class SendBitcoinTrezor extends Vue {
  showDialog = true;

  trezorConnected = false;

  currentComponent = 'SendBitcoinForm';

  unusedAddresses: string[] = [];

  txId = '';

  balances: AccountBalance = {
    legacy: 0,
    segwit: 0,
    nativeSegwit: 0,
  };

  trezorDataReady = false;

  trezorService: TrezorService = new TrezorService('test');

  @State('pegInTx') peginTxState!: PegInTxState;

  @Action(constants.IS_TREZOR_CONNECTED, { namespace: 'pegInTx' }) setTrezorConnected !: any;

  @Action(constants.PEGIN_TX_ADD_ADDRESSES, { namespace: 'pegInTx' }) setPeginTxAddresses !: any;

  @Prop(String) bitcoinWallet!: string;

  @Emit()
  toConfirmTx() {
    this.currentComponent = 'ConfirmTransaction';
  }

  @Emit()
  toTrackingId(txId: string) {
    this.txId = txId;
    this.currentComponent = 'TrackingId';
  }

  @Emit()
  closeDialog() {
    this.showDialog = false;
    this.getAccountAddresses();
    TrezorConnect.on(DEVICE_EVENT, (event) => {
      if (event.type === DEVICE.CONNECT) {
        console.log('Trezor connected :D');
        this.setTrezorConnected(true);
        this.showDialog = false;
        this.trezorConnected = this.peginTxState.trezorConnected;
      } else if (event.type === DEVICE.DISCONNECT) {
        console.log('Trezor disconnected :(');
        this.setTrezorConnected(false);
        this.showDialog = false;
        this.trezorConnected = this.peginTxState.trezorConnected;
      }
    });
  }

  @Emit()
  getAccountAddresses() {
    this.trezorService.getAddressList(2)
      .then((addresses) => {
        this.setPeginTxAddresses(addresses);
      })
      .then(() => ApiService
        .getBalances(this.peginTxState.sessionId, this.peginTxState.addressList))
      .then((balances: AccountBalance) => {
        this.balances = balances;
        this.trezorDataReady = true;
        // return ApiService.getTxFee(
        //   this.peginTxState.sessionId, 10000, constants.BITCOIN_SEGWIT_ADDRESS,
        // );
      })
      // .then((txFee) => {
      //   console.log(txFee);
      //   return ApiService.createPeginTx(
      //     10000,
      //     '2NFSRVejz7d24pZHFY6uqZVbEEgUC3PHCqD',
      //     '0x90F8bf6A479f320ead074411a4B0e7944Ea8c9C1',
      //     this.peginTxState.sessionId,
      //     constants.BITCOIN_FAST_FEE_LEVEL,
      //     '2NCJbWCHMmVRre7xNT6hbocCgEFpQxWtZVC',
      //   );
      // })
      // .then(console.log)
      .catch(console.error);
  }

  @Emit()
  getUnusedAddresses({ flag, accountType }: {flag: boolean; accountType: string}) {
    if (flag) {
      this.trezorService.getAccountUnusedAddresses(accountType)
        .then((ua) => {
          this.unusedAddresses = ua;
        })
        .catch(console.error);
    }
  }
}
</script>
