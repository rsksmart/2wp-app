<template>
  <v-container fluid class="px-md-0">
    <template v-if="!peginTxState.walletDataReady">
      <connect-device @continueToForm="startAskingForBalance"
                      @back="back"
                      :sendBitcoinState="sendBitcoinState"/>
    </template>
    <template v-if="peginTxState.walletDataReady">
      <component :is="currentComponent"
                 @createTx="toConfirmTx" @successConfirmation="toTrackingId"
                 :txBuilder="txBuilder"
                 :txId="txId" @back="back"
                 @toPegInForm="toPegInForm" :pegInFormData="pegInFormData"
                 :confirmTxState="confirmTxState"
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
import PegInForm from '@/components/create/PegInForm.vue';
import ConfirmTrezorTransaction from '@/components/trezor/ConfirmTrezorTransaction.vue';
import TrackingId from '@/components/exchange/TrackingId.vue';
import { WalletService } from '@/services';
import { PegInTxState } from '@/types/pegInTx';
import * as constants from '@/store/constants';
import {
  NormalizedTx, PegInFormValues, SendBitcoinState,
} from '@/types';
import TrezorTxBuilder from '@/middleware/TxBuilder/TrezorTxBuilder';
import BtcToRbtcDialog from '@/components/exchange/BtcToRbtcDialog.vue';
import DeviceErrorDialog from '@/components/exchange/DeviceErrorDialog.vue';
import ConnectDevice from '@/components/exchange/ConnectDevice.vue';
import TxErrorDialog from '@/components/exchange/TxErrorDialog.vue';
import SatoshiBig from '@/types/SatoshiBig';
import { Machine } from '@/services/utils';
import { EnvironmentAccessorService } from '@/services/enviroment-accessor.service';

@Component({
  components: {
    BtcToRbtcDialog,
    PegInForm,
    ConfirmTrezorTransaction,
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

  confirmTxState: Machine<
    'idle'
    | 'loading'
    | 'error'
    | 'goingHome'
    > = new Machine('idle');

  trezorConnected = false;

  currentComponent = 'PegInForm';

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

  @State('pegInTx') peginTxState!: PegInTxState;

  @Action(constants.PEGIN_TX_START_ASKING_FOR_BALANCE, { namespace: 'pegInTx' }) startAskingForBalanceStore !: () => Promise<void>;

  @Action(constants.IS_TREZOR_CONNECTED, { namespace: 'pegInTx' }) setTrezorConnected !: any;

  @Action(constants.PEGIN_TX_ADD_NORMALIZED_TX, { namespace: 'pegInTx' }) addNormalizedTx !: (tx: NormalizedTx) => void;

  @Action(constants.WEB3_SESSION_CLEAR_ACCOUNT, { namespace: 'web3Session' }) clearAccount !: any;

  @Getter(constants.PEGIN_TX_GET_CHANGE_ADDRESS, { namespace: 'pegInTx' }) getChangeAddress!: (accountType: string) => string;

  @Getter(constants.PEGIN_TX_GET_WALLET_SERVICE, { namespace: 'pegInTx' }) walletService!: WalletService;

  beforeMount() {
    this.showDialog = localStorage.getItem('BTRD_COOKIE_DISABLED') !== 'true';
  }

  get change() {
    return this.getChangeAddress;
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
        this.addNormalizedTx(tx);
        this.createdTx = tx;
        this.currentComponent = 'ConfirmTrezorTransaction';
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
    this.currentComponent = 'PegInForm';
  }

  @Emit()
  toTrackingId([txError, txId]: string[]) {
    if (txError !== '') {
      this.txError = txError;
      this.showTxErrorDialog = true;
    } else if (txId !== '') {
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
    this.confirmTxState.send('idle');
    this.sendBitcoinState = 'idle';
  }

  @Emit()
  startAskingForBalance() {
    this.sendBitcoinState = 'loading';
    this.startAskingForBalanceStore()
      .catch((e) => {
        this.deviceError = e.message;
        this.sendBitcoinState = 'error';
        this.showErrorDialog = true;
      });
  }

  @Emit('back')
  async back(currentComponent: 'ConnectDevice' | 'PegInForm') {
    await this.clear();
    this.clearAccount();
    return currentComponent;
  }

  @Emit()
  async clear(): Promise<void> {
    await this.walletService.stopAskingForBalance();
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
    this.currentComponent = 'PegInForm';
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
  }

  async beforeDestroy() {
    await this.walletService.stopAskingForBalance();
    this.clearAccount();
  }
}
</script>
