<template>
  <v-container fluid class="px-md-0">
    <template v-if="!trezorDataReady">
      <connect-device @continueToForm="startAskingForBalance"
                      @back="back"
                      :sendBitcoinState="sendBitcoinState"/>
    </template>
    <template v-if="trezorDataReady">
      <component :is="currentComponent" :balances="balances"
                 @createTx="toConfirmTx" @successConfirmation="toTrackingId"
                 @unused="getUnusedAddresses" :unusedAddresses="unusedAddresses"
                 :tx="createdTx" :txBuilder="txBuilder" :txData="txData"
                 :price="peginTxState.bitcoinPrice" :walletService="trezorService"
                 :txId="txId" @back="back" :loadingBalances="loadingBalances"
                 @toPegInForm="toPegInForm" :pegInFormData="pegInFormData"
                 :isBackFromConfirm="isBackFromConfirm"/>
    </template>
    <template v-if="showDialog">
      <btc-to-rbtc-dialog :showDialog="showDialog" @closeDialog="closeDialog"/>
    </template>
    <template v-if="showErrorDialog">
      <device-error-dialog :showErrorDialog="showErrorDialog" :errorMessage="deviceError"
                           @closeErrorDialog="closeErrorDialog"/>
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
import TrezorConnect, { DEVICE, DEVICE_EVENT } from 'trezor-connect';
import SendBitcoinForm from '@/components/exchange/SendBitcoinForm.vue';
import ConfirmTransaction from '@/components/trezor/ConfirmTransaction.vue';
import TrackingId from '@/components/exchange/TrackingId.vue';
import TrezorService from '@/services/TrezorService';
import { PegInTxState } from '@/store/peginTx/types';
import * as constants from '@/store/constants';
import {
  AccountBalance, NormalizedTx, PegInFormValues, SendBitcoinState, TxData,
} from '@/types';
import TrezorTxBuilder from '@/middleware/TxBuilder/TrezorTxBuilder';
import BtcToRbtcDialog from '@/components/exchange/BtcToRbtcDialog.vue';
import DeviceErrorDialog from '@/components/exchange/DeviceErrorDialog.vue';
import ConnectDevice from '@/components/exchange/ConnectDevice.vue';
import TxErrorDialog from '@/components/exchange/TxErrorDialog.vue';
import SatoshiBig from '@/types/SatoshiBig';
import { EnvironmentAccessorService } from '@/services/enviroment-accessor.service';

@Component({
  components: {
    BtcToRbtcDialog,
    SendBitcoinForm,
    ConfirmTransaction,
    TrackingId,
    ConnectDevice,
    DeviceErrorDialog,
    TxErrorDialog,
  },
})

export default class SendBitcoinTrezor extends Vue {
  pegInFormData: PegInFormValues ={
    accountType: '',
    amount: new SatoshiBig('0', 'satoshi'),
    rskAddress: '',
    txFeeIndex: 1.0,
  };

  showDialog = false;

  showErrorDialog = false;

  showTxErrorDialog = false;

  deviceError = 'test';

  sendBitcoinState: SendBitcoinState = 'idle';

  trezorConnected = false;

  currentComponent = 'SendBitcoinForm';

  unusedAddresses: string[] = [];

  txId = '';

  txError = '';

  isBackFromConfirm = false;

  createdTx: NormalizedTx = {
    coin: EnvironmentAccessorService.getEnvironmentVariables().vueAppCoin,
    inputs: [],
    outputs: [],
  };

  amount: SatoshiBig = new SatoshiBig('0', 'satoshi');

  refundAddress = '';

  recipient = '';

  feeBTC: SatoshiBig = new SatoshiBig('0', 'satoshi');

  txBuilder: TrezorTxBuilder = new TrezorTxBuilder();

  balances: AccountBalance = {
    legacy: new SatoshiBig(0, 'satoshi'),
    segwit: new SatoshiBig(0, 'satoshi'),
    nativeSegwit: new SatoshiBig(0, 'satoshi'),
  };

  trezorDataReady = false;

  trezorService: TrezorService = new TrezorService(
    EnvironmentAccessorService.getEnvironmentVariables().vueAppCoin,
  );

  trezorServiceSubscriber = (balance: AccountBalance) => this.addBalance(balance);

  @State('pegInTx') peginTxState!: PegInTxState;

  @Action(constants.IS_TREZOR_CONNECTED, { namespace: 'pegInTx' }) setTrezorConnected !: any;

  @Action(constants.PEGIN_TX_ADD_ADDRESSES, { namespace: 'pegInTx' }) setPeginTxAddresses !: any;

  @Action(constants.WEB3_SESSION_CLEAR_ACCOUNT, { namespace: 'web3Session' }) clearAccount !: any;

  @Getter(constants.PEGIN_TX_GET_CHANGE_ADDRESS, { namespace: 'pegInTx' }) getChangeAddress!: (accountType: string) => string;

  beforeMount() {
    this.showDialog = localStorage.getItem('BTRD_COOKIE_DISABLED') !== 'true';
  }

  get txData(): TxData {
    return {
      amount: this.amount,
      refundAddress: this.refundAddress,
      recipient: this.recipient,
      feeBTC: this.feeBTC,
      change: '',
    };
  }

  get change() {
    return this.getChangeAddress;
  }

  get loadingBalances(): boolean {
    return this.trezorService.isLoadingBalances();
  }

  @Emit()
  async toConfirmTx({
    amountToTransferInSatoshi,
    refundAddress,
    recipient,
    feeLevel,
    feeBTC,
    accountType,
    pegInFormData,
  }: {
    amountToTransferInSatoshi: SatoshiBig;
    refundAddress: string;
    recipient: string;
    feeLevel: string;
    feeBTC: SatoshiBig;
    accountType: string;
    pegInFormData: PegInFormValues;
  }) {
    this.pegInFormData = pegInFormData;
    this.amount = amountToTransferInSatoshi;
    this.refundAddress = refundAddress;
    this.recipient = recipient;
    this.feeBTC = feeBTC;
    this.txBuilder.accountType = accountType;
    this.txBuilder.getNormalizedTx({
      amountToTransferInSatoshi: Number(amountToTransferInSatoshi.toString()),
      refundAddress,
      recipient,
      feeLevel,
      changeAddress: await this.getChangeAddress(accountType),
      sessionId: this.peginTxState.sessionId,
    })
      .then((tx: NormalizedTx) => {
        this.createdTx = tx;
        this.currentComponent = 'ConfirmTransaction';
        return tx;
      })
      .catch((error) => {
        this.txError = error.message;
        this.showTxErrorDialog = true;
      });
  }

  @Emit()
  toPegInForm() {
    this.isBackFromConfirm = true;
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
    TrezorConnect.on(DEVICE_EVENT, (event) => {
      if (event.type === DEVICE.CONNECT) {
        this.setTrezorConnected(true);
        this.showDialog = false;
        this.trezorConnected = this.peginTxState.trezorConnected;
      } else if (event.type === DEVICE.DISCONNECT) {
        this.setTrezorConnected(false);
        this.showDialog = false;
        this.trezorConnected = this.peginTxState.trezorConnected;
      }
    });
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
  startAskingForBalance() {
    this.sendBitcoinState = 'loading';
    this.trezorService.subscribe(this.trezorServiceSubscriber);
    this.trezorService.startAskingForBalance(
      this.peginTxState.sessionId,
      this.peginTxState.peginConfiguration.maxValue,
    )
      .catch((e) => {
        this.deviceError = e.message;
        this.sendBitcoinState = 'error';
        this.trezorService.unsubscribe(this.trezorServiceSubscriber);
        this.showErrorDialog = true;
      });
  }

  addBalance(balanceInformed: AccountBalance) {
    this.setInformedBalance(balanceInformed);
    if (!this.trezorDataReady) {
      this.trezorDataReady = true;
    }
  }

  @Emit()
  setInformedBalance(balanceInformed: AccountBalance) {
    if (balanceInformed === undefined) {
      this.deviceError = 'Balance was not found.';
      this.sendBitcoinState = 'error';
      this.trezorService.unsubscribe(this.trezorServiceSubscriber);
      this.showErrorDialog = true;
    }
    this.balances = balanceInformed;
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

  @Emit('back')
  async back(currentComponent: 'ConnectDevice' | 'PegInForm') {
    await this.clear();
    this.clearAccount();
    return currentComponent;
  }

  @Emit()
  async clear(): Promise<void> {
    await this.trezorService.stopAskingForBalance();
    this.pegInFormData = {
      accountType: '',
      amount: new SatoshiBig('0', 'satoshi'),
      rskAddress: '',
      txFeeIndex: 1.0,
    };
    this.showDialog = false;
    this.showErrorDialog = false;
    this.showTxErrorDialog = false;
    this.deviceError = 'test';
    this.sendBitcoinState = 'idle';
    this.trezorConnected = false;
    this.currentComponent = 'SendBitcoinForm';
    this.unusedAddresses = [];
    this.txId = '';
    this.txError = '';
    this.createdTx = {
      coin: EnvironmentAccessorService.getEnvironmentVariables().vueAppCoin,
      inputs: [],
      outputs: [],
    };
    this.amount = new SatoshiBig('0', 'satoshi');
    this.refundAddress = '';
    this.recipient = '';
    this.feeBTC = new SatoshiBig('0', 'satoshi');
    this.txBuilder = new TrezorTxBuilder();
    this.balances = {
      legacy: new SatoshiBig(0, 'satoshi'),
      segwit: new SatoshiBig(0, 'satoshi'),
      nativeSegwit: new SatoshiBig(0, 'satoshi'),
    };
    this.trezorDataReady = false;
    this.trezorService = new TrezorService(
      EnvironmentAccessorService.getEnvironmentVariables().vueAppCoin,
    );
  }

  async beforeDestroy() {
    await this.trezorService.stopAskingForBalance();
    this.clearAccount();
  }
}
</script>
