<template>
  <v-container fluid class="px-md-0">
    <template v-if="!peginTxState.walletDataReady">
      <connect-device @continueToForm="startAskingForBalance"
                      :sendBitcoinState="sendBitcoinState"/>
    </template>
    <template v-if="peginTxState.walletDataReady">
      <component :is="currentComponent"
                 @createTx="toConfirmTx" @successConfirmation="toTrackingId"
                 :txBuilder="txBuilder"
                 :txId="txId" @back="backToConnectDevice"
                 @toPegInForm="toPegInForm"
                 :confirmTxState="confirmTxState"/>
    </template>
    <template v-if="showErrorDialog">
      <device-error-dialog :showErrorDialog="showErrorDialog"
                           :errorMessage="deviceError"
                           :errorType="errorType"
                           :urlToMoreInformation="urlToMoreInformation"
                           :messageToUserOnLink="messageToUserOnLink"
                           :installationLink="installationLink"
                           :messageInstallationToUser="messageInstallationToUser"
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
import PegInForm from '@/pegin/components/create/PegInForm.vue';
import ConfirmTrezorTransaction from '@/pegin/components/trezor/ConfirmTrezorTransaction.vue';
import ConfirmLedgerTransaction from '@/pegin/components/ledger/ConfirmLedgerTransaction.vue';
import * as constants from '@/common/store/constants';
import {
  NormalizedTx, SendBitcoinState, SatoshiBig, PegInTxState, BtcWallet, LiqualityError,
} from '@/common/types';
import TrezorTxBuilder from '@/pegin/middleware/TxBuilder/TrezorTxBuilder';
import DeviceErrorDialog from '@/common/components/exchange/DeviceErrorDialog.vue';
import ConnectDevice from '@/common/components/exchange/ConnectDevice.vue';
import TxErrorDialog from '@/common/components/exchange/TxErrorDialog.vue';
import { Machine, getClearPeginTxState } from '@/common/utils';
import LedgerTxBuilder from '@/pegin/middleware/TxBuilder/LedgerTxBuilder';
import LiqualityTxBuilder from '@/pegin/middleware/TxBuilder/LiqualityTxBuilder';
import TxBuilder from '@/pegin/middleware/TxBuilder/TxBuilder';
import ConfirmLiqualityTransaction from '@/pegin/components/liquality/ConfirmLiqualityTransaction.vue';

@Component({
  components: {
    PegInForm,
    ConfirmTrezorTransaction,
    ConfirmLedgerTransaction,
    ConfirmLiqualityTransaction,
    ConnectDevice,
    DeviceErrorDialog,
    TxErrorDialog,
  },
})

export default class SendBitcoin extends Vue {
  showErrorDialog = false;

  showTxErrorDialog = false;

  deviceError = 'test';

  errorType = '';

  urlToMoreInformation = '';

  messageToUserOnLink = '';

  installationLink = '';

  messageInstallationToUser = '';

  sendBitcoinState: SendBitcoinState = 'idle';

  currentComponent = 'PegInForm';

  txId = '';

  txError = '';

  confirmTxState: Machine<
    'idle'
    | 'loading'
    | 'error'
    | 'goingHome'
    > = new Machine('idle');

  rawTx = '';

  txBuilder!: TxBuilder;

  @State('pegInTx') peginTxState!: PegInTxState;

  @Action(constants.PEGIN_TX_START_ASKING_FOR_BALANCE, { namespace: 'pegInTx' }) startAskingForBalanceStore !: () => Promise<void>;

  @Action(constants.PEGIN_TX_STOP_ASKING_FOR_BALANCE, { namespace: 'pegInTx' }) stopAskingForBalance !: () => Promise<void>;

  @Action(constants.PEGIN_TX_ADD_NORMALIZED_TX, { namespace: 'pegInTx' }) addNormalizedTx !: (tx: NormalizedTx) => void;

  @Action(constants.WEB3_SESSION_CLEAR_ACCOUNT, { namespace: 'web3Session' }) clearAccount !: () => void;

  @Action(constants.PEGIN_TX_CLEAR_STATE, { namespace: 'pegInTx' }) clearStore !: () => void;

  @Action(constants.PEGIN_TX_INIT, { namespace: 'pegInTx' }) init !: () => Promise<void>;

  @Action(constants.PEGIN_TX_ADD_BITCOIN_WALLET, { namespace: 'pegInTx' }) setBtcWallet !: (wallet: BtcWallet) => Promise<void>;

  @Getter(constants.PEGIN_TX_GET_CHANGE_ADDRESS, { namespace: 'pegInTx' }) getChangeAddress!: (accountType: string) => string;

  get change() {
    return this.getChangeAddress;
  }

  @Emit()
  async toConfirmTx({
    amountToTransferInSatoshi,
    refundAddress,
    recipient,
    feeLevel,
    accountType,
  }: {
    amountToTransferInSatoshi: SatoshiBig;
    refundAddress: string;
    recipient: string;
    feeLevel: string;
    accountType: string;
  }) {
    this.txBuilder.getNormalizedTx({
      amountToTransferInSatoshi: Number(amountToTransferInSatoshi.toString()),
      refundAddress,
      recipient,
      feeLevel,
      changeAddress: this.getChangeAddress(accountType),
      sessionId: this.peginTxState.sessionId,
      accountType,
    })
      .then((tx: NormalizedTx) => {
        this.addNormalizedTx(tx);
        switch (this.peginTxState.bitcoinWallet) {
          case constants.WALLET_LEDGER:
            this.currentComponent = 'ConfirmLedgerTransaction';
            break;
          case constants.WALLET_LIQUALITY:
            this.currentComponent = 'ConfirmLiqualityTransaction';
            break;
          default:
            this.currentComponent = 'ConfirmTrezorTransaction';
            break;
        }
        return tx;
      })
      .catch((error) => {
        this.txError = error.message;
        this.showTxErrorDialog = true;
      });
  }

  @Emit()
  toPegInForm() {
    this.currentComponent = 'PegInForm';
    this.confirmTxState.send('idle');
    this.addNormalizedTx(getClearPeginTxState().normalizedTx);
  }

  @Emit()
  toTrackingId([txError, txId]: string[]) {
    if (txError !== '') {
      this.txError = txError;
      this.showTxErrorDialog = true;
      this.txId = txId;
    } else if (txId) {
      this.$router.push({ name: 'Success', params: { txId } });
    }
  }

  @Emit()
  closeErrorDialog() {
    this.showErrorDialog = false;
    this.sendBitcoinState = 'idle';
  }

  @Emit()
  async closeTxErrorDialog() {
    this.showTxErrorDialog = false;
    this.sendBitcoinState = 'idle';
    this.confirmTxState.send('idle');
  }

  @Emit()
  startAskingForBalance() {
    this.sendBitcoinState = 'loading';
    this.startAskingForBalanceStore()
      .catch((e) => {
        if (e.statusCode === 27010) {
          this.deviceError = 'Please unlock your Ledger device.';
        } else {
          this.deviceError = e.message;
        }
        if (e instanceof LiqualityError) {
          this.errorType = e.errorType;
          this.urlToMoreInformation = e.urlToMoreInformation;
          this.messageToUserOnLink = e.messageToUserOnLink;
          this.messageInstallationToUser = e.messageInstallationToUser;
          this.installationLink = e.installationLink;
        }
        this.sendBitcoinState = 'error';
        this.showErrorDialog = true;
      });
  }

  @Emit()
  async backToConnectDevice() {
    await this.clear();
    this.clearAccount();
    let wallet: BtcWallet;
    if (this.peginTxState.bitcoinWallet) {
      wallet = this.peginTxState.bitcoinWallet;
    } else {
      await this.back();
    }
    this.clearStore();
    this.init()
      .then(() => this.setBtcWallet(wallet));
  }

  @Emit('back')
  async back() {
    await this.stopAskingForBalance();
  }

  @Emit()
  setTxBuilder():void {
    switch (this.peginTxState.bitcoinWallet) {
      case constants.WALLET_TREZOR:
        this.txBuilder = new TrezorTxBuilder();
        break;
      case constants.WALLET_LEDGER:
        this.txBuilder = new LedgerTxBuilder();
        break;
      case constants.WALLET_LIQUALITY:
        this.txBuilder = new LiqualityTxBuilder();
        break;
      default:
        this.txBuilder = new TrezorTxBuilder();
        break;
    }
  }

  @Emit()
  async clear(): Promise<void> {
    this.showErrorDialog = false;
    this.showTxErrorDialog = false;
    this.deviceError = 'test';
    this.sendBitcoinState = 'idle';
    this.confirmTxState = new Machine('idle');
    this.currentComponent = 'PegInForm';
    this.txId = '';
    this.txError = '';
    this.setTxBuilder();
    await this.stopAskingForBalance();
  }

  created() {
    this.setTxBuilder();
  }
}
</script>
