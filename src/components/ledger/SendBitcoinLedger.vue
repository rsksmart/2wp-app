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
import ConfirmLedgerTransaction from '@/components/ledger/ConfirmLedgerTransaction.vue';
import TrackingId from '@/components/exchange/TrackingId.vue';
import LedgerService from '@/services/LedgerService';
import ApiService from '@/services/ApiService';
import { PegInTxState } from '@/store/peginTx/types';
import * as constants from '@/store/constants';
import { Action, Getter, State } from 'vuex-class';
import {
  AccountBalance, FeeAmountData, LedgerTx,
} from '@/services/types';
import LedgerTxBuilder from '@/services/LedgerTxBuilder';
import BtcToRbtcDialog from '@/components/exchange/BtcToRbtcDialog.vue';
import ConnectDevice from '@/components/exchange/ConnectDevice.vue';

@Component({
  components: {
    BtcToRbtcDialog,
    SendBitcoinForm,
    ConfirmLedgerTransaction,
    TrackingId,
    ConnectDevice,
  },
})
export default class SendBitcoinLedger extends Vue {
  showDialog = true;

  currentComponent = 'SendBitcoinForm';

  txId = '';

  createdTx: LedgerTx = {
    coin: process.env.VUE_APP_COIN ?? 'test',
    inputs: [],
    outputs: [],
    outputScriptHex: '',
    changePath: '',
    associatedKeysets: [],
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

  ledgerService: LedgerService = new LedgerService(process.env.VUE_APP_COIN ?? 'test');

  bitcoinPrice = 52179.73; // https://www.coindesk.com/price/bitcoin

  @State('pegInTx') peginTxState!: PegInTxState;

  @Action(constants.PEGIN_TX_ADD_ADDRESSES, { namespace: 'pegInTx' }) setPeginTxAddresses !: any;

  @Getter(constants.PEGIN_TX_GET_CHANGE_ADDRESS, { namespace: 'pegInTx' }) getChangeAddress!: string;

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
      changeAddress: this.getChangeAddress,
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
