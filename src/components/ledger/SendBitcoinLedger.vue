<template>
  <div class="container">
    <template v-if="!ledgerDataReady">
      <connect-device @continueToForm="getAccountAddresses" :loadingState="loadingState"/>
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
    <template v-if="showErrorDialog">
      <device-error-dialog :showErrorDialog="showErrorDialog"
                           :errorMessage="deviceError" @closeErrorDialog="closeErrorDialog"/>
    </template>
    <template v-if="showTxErrorDialog">
      <tx-error-dialog :showTxErrorDialog="showTxErrorDialog"
                           :errorMessage="txError" @closeErrorDialog="closeTxErrorDialog"/>
    </template>
  </div>
</template>

<script lang="ts">
import {
  Component, Emit,
  Vue,
} from 'vue-property-decorator';
import SendBitcoinForm from '@/components/exchange/SendBitcoinForm.vue';
import ConfirmLedgerTransaction from '@/components/ledger/ConfirmLedgerTransaction.vue';
import TrackingId from '@/components/exchange/TrackingId.vue';
import LedgerService from '@/services/LedgerService';
import ApiService from '@/services/ApiService';
import { PegInTxState } from '@/store/peginTx/types';
import * as constants from '@/store/constants';
import { Action, Getter, State } from 'vuex-class';
import {
  AccountBalance, FeeAmountData, LedgerTx,
} from '@/types';
import LedgerTxBuilder from '@/middleware/TxBuilder/LedgerTxBuilder';
import BtcToRbtcDialog from '@/components/exchange/BtcToRbtcDialog.vue';
import DeviceErrorDialog from '@/components/exchange/DeviceErrorDialog.vue';
import ConnectDevice from '@/components/exchange/ConnectDevice.vue';
import TxErrorDialog from '@/components/exchange/TxErrorDialog.vue';

@Component({
  components: {
    BtcToRbtcDialog,
    SendBitcoinForm,
    ConfirmLedgerTransaction,
    TrackingId,
    ConnectDevice,
    DeviceErrorDialog,
    TxErrorDialog,
  },
})
export default class SendBitcoinLedger extends Vue {
  showDialog = true;

  showErrorDialog = false;

  showTxErrorDialog = false;

  deviceError = 'test';

  loadingState = false;

  currentComponent = 'SendBitcoinForm';

  txId = '';

  txError = '';

  createdTx: LedgerTx = {
    coin: process.env.VUE_APP_COIN ?? 'test',
    inputs: [],
    outputs: [],
    outputScriptHex: '',
    changePath: '',
    associatedKeysets: [],
    accountType: '',
  };

  amount = 0;

  refundAddress = '';

  recipient = '';

  feeBTC = 0;

  txBuilder: LedgerTxBuilder = new LedgerTxBuilder();

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

  ledgerService: LedgerService = new LedgerService(
    process.env.VUE_APP_COIN ?? constants.BTC_NETWORK_TESTNET,
  );

  bitcoinPrice = 52179.73; // https://www.coindesk.com/price/bitcoin TODO get the price globally

  @State('pegInTx') peginTxState!: PegInTxState;

  @Action(constants.PEGIN_TX_ADD_ADDRESSES, { namespace: 'pegInTx' }) setPeginTxAddresses !: any;

  @Getter(constants.PEGIN_TX_GET_CHANGE_ADDRESS, { namespace: 'pegInTx' }) getChangeAddress!: (accountType: string) => string;

  beforeMount() {
    this.showDialog = localStorage.getItem('BTRD_COOKIE_DISABLED') !== 'true';
  }

  get txData() {
    return {
      amount: this.amount,
      refundAddress: this.refundAddress,
      recipient: this.recipient,
      feeBTC: this.feeBTC,
      change: this.getChangeAddress,
    };
  }

  @Emit()
  toConfirmTx({
    amountToTransferInSatoshi, refundAddress, recipient, feeLevel, feeBTC, accountType,
  }: {
    amountToTransferInSatoshi: number;
    refundAddress: string;
    recipient: string;
    feeLevel: string;
    feeBTC: number;
    accountType: string;
  }) {
    this.amount = amountToTransferInSatoshi;
    this.refundAddress = refundAddress;
    this.recipient = recipient;
    this.feeBTC = feeBTC;
    this.txBuilder.accountType = accountType;
    this.txBuilder.buildTx({
      amountToTransferInSatoshi,
      refundAddress,
      recipient,
      feeLevel,
      changeAddress: this.getChangeAddress(accountType),
      sessionId: this.peginTxState.sessionId,
    })
      .then((tx: LedgerTx) => {
        this.createdTx = tx;
        this.currentComponent = 'ConfirmLedgerTransaction';
        return tx;
      })
      .catch(console.error);
  }

  @Emit()
  toTrackingId([txError, txId]: string[]) {
    if (txError !== '') {
      this.txError = txError;
      this.showTxErrorDialog = true;
    } else {
      this.currentComponent = 'TrackingId';
    }
    this.txId = txId;
  }

  @Emit()
  closeDialog() {
    this.showDialog = false;
  }

  @Emit()
  closeErrorDialog() {
    this.showErrorDialog = false;
    this.loadingState = false;
  }

  @Emit()
  closeTxErrorDialog() {
    this.showTxErrorDialog = false;
  }

  @Emit()
  getAccountAddresses() {
    this.loadingState = true;
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
      .catch((e) => {
        this.deviceError = e.message;
        this.showErrorDialog = true;
      });
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
