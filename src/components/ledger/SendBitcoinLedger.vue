<template>
  <v-container fluid class="px-md-0">
    <template v-if="!ledgerDataReady">
      <connect-device @continueToForm="getAccountAddresses"
                      :sendBitcoinState="sendBitcoinState"/>
    </template>
    <template v-if="ledgerDataReady">
      <component :is="currentComponent" :balances="balances"
                 @createTx="toConfirmTx" @successConfirmation="toTrackingId"
                 @txFee="getTxFee" :fees="calculatedFees" :tx="createdTx"
                 :txBuilder="txBuilder" :txData="txData" :price="peginTxState.bitcoinPrice"
                 :txId="txId"
                 @toPegInForm="toPegInForm" :pegInFormData="pegInFormData"/>
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
  </v-container>
</template>

<script lang="ts">
import {
  Component, Emit,
  Vue,
} from 'vue-property-decorator';
import { Action, Getter, State } from 'vuex-class';
import SendBitcoinForm from '@/components/exchange/SendBitcoinForm.vue';
import ConfirmLedgerTransaction from '@/components/ledger/ConfirmLedgerTransaction.vue';
import TrackingId from '@/components/exchange/TrackingId.vue';
import LedgerService from '@/services/LedgerService';
import ApiService from '@/services/ApiService';
import { PegInTxState } from '@/store/peginTx/types';
import * as constants from '@/store/constants';
import {
  AccountBalance, FeeAmountData, LedgerTx, PegInFormValues, SendBitcoinState, TxData,
} from '@/types';
import LedgerTxBuilder from '@/middleware/TxBuilder/LedgerTxBuilder';
import BtcToRbtcDialog from '@/components/exchange/BtcToRbtcDialog.vue';
import DeviceErrorDialog from '@/components/exchange/DeviceErrorDialog.vue';
import ConnectDevice from '@/components/exchange/ConnectDevice.vue';
import TxErrorDialog from '@/components/exchange/TxErrorDialog.vue';
import SatoshiBig from '@/types/SatoshiBig';

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
  pegInFormData: PegInFormValues ={
    accountType: '',
    amount: 0.0,
    rskAddress: '',
    txFeeIndex: 1.0,
  };

  showDialog = true;

  showErrorDialog = false;

  showTxErrorDialog = false;

  deviceError = 'test';

  sendBitcoinState: SendBitcoinState = 'idle';

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

  amount = 0; // SatoshiBN

  refundAddress = '';

  recipient = '';

  feeBTC = 0; // SatoshiBN

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

  @State('pegInTx') peginTxState!: PegInTxState;

  @Action(constants.PEGIN_TX_ADD_ADDRESSES, { namespace: 'pegInTx' }) setPeginTxAddresses !: any;

  @Getter(constants.PEGIN_TX_GET_CHANGE_ADDRESS, { namespace: 'pegInTx' }) getChangeAddress!: (accountType: string) => string;

  beforeMount() {
    this.showDialog = localStorage.getItem('BTRD_COOKIE_DISABLED') !== 'true';
  }

  get txData(): TxData {
    return {
      amount: new SatoshiBig(this.amount, 'satoshi'),
      refundAddress: this.refundAddress,
      recipient: this.recipient,
      feeBTC: new SatoshiBig(this.feeBTC, 'btc'),
      change: '',
    };
  }

  @Emit()
  toConfirmTx({
    amountToTransferInSatoshi,
    refundAddress,
    recipient,
    feeLevel,
    feeBTC,
    accountType,
    pegInFormData,
  }: {
    amountToTransferInSatoshi: number;
    refundAddress: string;
    recipient: string;
    feeLevel: string;
    feeBTC: number;
    accountType: string;
    pegInFormData: PegInFormValues;
  }) {
    this.pegInFormData = pegInFormData;
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
  toPegInForm() {
    this.currentComponent = 'SendBitcoinForm';
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
    this.sendBitcoinState = 'idle';
  }

  @Emit()
  closeTxErrorDialog() {
    this.showTxErrorDialog = false;
  }

  @Emit()
  getAccountAddresses() {
    this.sendBitcoinState = 'loading';
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
        if (e.statusCode === 27010) {
          this.deviceError = 'Please unlock your Ledger device.';
        } else {
          this.deviceError = e.message;
        }
        this.sendBitcoinState = 'error';
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
