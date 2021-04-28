<template>
  <div class="container">
    <template v-if="!ledgerDataReady">
      <connect-device/>
    </template>
    <template v-if="ledgerDataReady">
      <component :is="currentComponent" :balances="balances"
                 @createTx="toConfirmTx" @successConfirmation="toTrackingId"
                 @txFee="getTxFee" :fees="calculatedFees" :tx="createdTx"
                 :txBuilder="txBuilder" :txData="txData" :price="bitcoinPrice"
                 :txId="txId"/>
    </template>
    <template v-if="showDialog">
      <btc-to-rbtc-dialog :showDialog="showDialog" @closeDialog="closeDialog"/>
    </template>
  </div>
</template>

<script lang="ts">
import {
  Component, Emit,
  Vue,
} from 'vue-property-decorator';
import SendBitcoinForm from '@/components/exchange/SendBitcoinForm.vue';
import ConfirmTransaction from '@/components/trezor/ConfirmTransaction.vue';
import TrackingId from '@/components/exchange/TrackingId.vue';
import LedgerService from '@/services/LedgerService';
import ApiService from '@/services/ApiService';
import { PegInTxState } from '@/store/peginTx/types';
import * as constants from '@/store/constants';
import { Action, State } from 'vuex-class';
import {
  AccountBalance, FeeAmountData, TrezorTx,
} from '@/services/types';
import TrezorTxBuilder from '@/services/TrezorTxBuilder';
import BtcToRbtcDialog from '@/components/exchange/BtcToRbtcDialog.vue';
import ConnectDevice from '@/components/exchange/ConnectDevice.vue';

@Component({
  components: {
    BtcToRbtcDialog,
    SendBitcoinForm,
    ConfirmTransaction,
    TrackingId,
    ConnectDevice,
  },
})
export default class SendBitcoinLedger extends Vue {
  showDialog = true;

  trezorConnected = false;

  currentComponent = 'SendBitcoinForm';

  unusedAddresses: string[] = [];

  txId = '';

  createdTx: TrezorTx = {
    coin: process.env.VUE_APP_COIN ?? 'test',
    inputs: [],
    outputs: [],
  };

  amount = 0;

  refundAddress = '';

  recipient = '';

  feeBTC = 0;

  txBuilder: TrezorTxBuilder = new TrezorTxBuilder();

  balances: AccountBalance = {
    legacy: 0,
    segwit: 0,
    nativeSegwit: 0,
  };

  calculatedFees: FeeAmountData = {
    slow: 0,
    average: 0,
    fast: 0,
  };

  ledgerDataReady = false;

  ledgerService: LedgerService = new LedgerService(process.env.VUE_APP_COIN ?? 'test');

  bitcoinPrice = 52179.73; // https://www.coindesk.com/price/bitcoin

  @State('pegInTx') peginTxState!: PegInTxState;

  @Action(constants.PEGIN_TX_ADD_ADDRESSES, { namespace: 'pegInTx' }) setPeginTxAddresses !: any;

  get txData() {
    return {
      amount: this.amount,
      refundAddress: this.refundAddress,
      recipient: this.recipient,
      feeBTC: this.feeBTC,
      change: this.change,
    };
  }

  get change() {
    return this.unusedAddresses[5];
  }

  @Emit()
  toConfirmTx({
    amountToTransferInSatoshi, refundAddress, recipient, feeLevel, feeBTC,
  }: {
    amountToTransferInSatoshi: number;
    refundAddress: string;
    recipient: string;
    feeLevel: string;
    feeBTC: number;
  }) {
    this.amount = amountToTransferInSatoshi;
    this.refundAddress = refundAddress;
    this.recipient = recipient;
    this.feeBTC = feeBTC;
    this.txBuilder.buildTx({
      amountToTransferInSatoshi,
      refundAddress,
      recipient,
      feeLevel,
      changeAddress: this.change,
      sessionId: this.peginTxState.sessionId,
    })
      .then((tx: TrezorTx) => {
        this.createdTx = tx;
        this.currentComponent = 'ConfirmTransaction';
        return tx;
      })
      .catch(console.error);
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
  }

  @Emit()
  getAccountAddresses() {
    this.ledgerService.getAddressList(2)
      .then((addresses) => {
        this.setPeginTxAddresses(addresses);
      })
      .then(() => ApiService
        .getBalances(this.peginTxState.sessionId, this.peginTxState.addressList))
      .then((balances: AccountBalance) => {
        this.balances = balances;
        this.ledgerDataReady = true;
      })
      .catch(console.error);
  }

  @Emit()
  getTxFee({ amount, accountType }: {amount: number; accountType: string}) {
    ApiService.getTxFee(this.peginTxState.sessionId, amount, accountType)
      .then((txFee) => {
        this.calculatedFees = txFee;
      })
      .catch(console.error);
  }
}
</script>
