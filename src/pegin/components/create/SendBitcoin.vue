<template>
  <v-container fluid class="mt-0">
    <template v-if="!walletDataReady">
      <connect-device @continueToForm="startAskingForBalance"
                      :sendBitcoinState="sendBitcoinState"/>
    </template>
    <template v-if="walletDataReady">
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
import PegInForm from '@/pegin/components/create/PegInForm.vue';
import ConfirmTrezorTransaction from '@/pegin/components/trezor/ConfirmTrezorTransaction.vue';
import ConfirmLedgerTransaction from '@/pegin/components/ledger/ConfirmLedgerTransaction.vue';
import * as constants from '@/common/store/constants';
import {
  NormalizedTx, SendBitcoinState, SatoshiBig, BtcWallet, LiqualityError,
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
import { ref } from 'vue';
import { useAction, useGetter, useStateAttribute } from '@/common/store/helper';
import { useRouter } from 'vue-router';

export default {
  name: 'SendBitcoin',
  components: {
    PegInForm,
    ConfirmTrezorTransaction,
    ConfirmLedgerTransaction,
    ConfirmLiqualityTransaction,
    ConnectDevice,
    DeviceErrorDialog,
    TxErrorDialog,
  },
  setup(_, context) {
    const showErrorDialog = ref(false);
    const showTxErrorDialog = ref(false);
    const deviceError = ref('test');
    const errorType = ref('');
    const urlToMoreInformation = ref('');
    const messageToUserOnLink = ref('');
    const installationLink = ref('');
    const messageInstallationToUser = ref('');
    const sendBitcoinState = ref<SendBitcoinState>('idle');
    const currentComponent = ref('PegInForm');
    const txId = ref('');
    const txError = ref('');
    const confirmTxState = ref<Machine<
      'idle'
      | 'loading'
      | 'error'
      | 'goingHome'
      >>(new Machine('idle'));
    const txBuilder = ref<TxBuilder>();

    const bitcoinWallet = useStateAttribute<BtcWallet>('pegInTx', 'bitcoinWallet');
    const sessionId = useStateAttribute<String>('pegInTx', 'sessionId');
    const walletDataReady = useStateAttribute<boolean>('pegInTx', 'walletDataReady');
    const startAskingForBalanceStore = useAction('pegInTx', constants.PEGIN_TX_START_ASKING_FOR_BALANCE);
    const stopAskingForBalance = useAction('pegInTx', constants.PEGIN_TX_STOP_ASKING_FOR_BALANCE);
    const addNormalizedTx = useAction('pegInTx', constants.PEGIN_TX_ADD_NORMALIZED_TX);
    const clearAccount = useAction('web3Session', constants.WEB3_SESSION_CLEAR_ACCOUNT);
    const clearStore = useAction('pegInTx', constants.PEGIN_TX_CLEAR_STATE);
    const init = useAction('pegInTx', constants.PEGIN_TX_INIT);
    const setBtcWallet = useAction('pegInTx', constants.PEGIN_TX_ADD_BITCOIN_WALLET);
    const getChangeAddress = useGetter<(accountType: String)=> String>('pegInTx', constants.PEGIN_TX_GET_CHANGE_ADDRESS);

    async function toConfirmTx({
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
      txBuilder.value?.getNormalizedTx({
        amountToTransferInSatoshi: Number(amountToTransferInSatoshi.toString()),
        refundAddress,
        recipient,
        feeLevel,
        changeAddress: getChangeAddress.value(accountType),
        sessionId: sessionId.value,
        accountType,
      })
        .then((tx: NormalizedTx) => {
          addNormalizedTx(tx);
          switch (bitcoinWallet.value) {
            case constants.WALLET_LEDGER:
              currentComponent.value = 'ConfirmLedgerTransaction';
              break;
            case constants.WALLET_LIQUALITY:
              currentComponent.value = 'ConfirmLiqualityTransaction';
              break;
            default:
              currentComponent.value = 'ConfirmTrezorTransaction';
              break;
          }
          return tx;
        })
        .catch((error) => {
          txError.value = error.message;
          showTxErrorDialog.value = true;
        });
    }

    function toPegInForm() {
      currentComponent.value = 'PegInForm';
      confirmTxState.value.send('idle');
      addNormalizedTx(getClearPeginTxState().normalizedTx);
    }

    function toTrackingId([error , txHash]: string[]) {
      if (error !== '') {
        txError.value = error;
        showTxErrorDialog.value = true;
        txId.value = txHash;
      } else if (txHash) {
        const router = useRouter();
        router.push({ name: 'Success', params: { txHash } });
      }
    }

    function closeErrorDialog() {
      showErrorDialog.value = false;
      sendBitcoinState.value = 'idle';
    }

    async function closeTxErrorDialog() {
      showTxErrorDialog.value = false;
      sendBitcoinState.value = 'idle';
      confirmTxState.value.send('idle');
    }

    function startAskingForBalance() {
      sendBitcoinState.value = 'loading';
      startAskingForBalanceStore()
        .catch((e) => {
          if (e.statusCode === 27010) {
            deviceError.value = 'Please unlock your Ledger device.';
          } else {
            deviceError.value = e.message;
          }
          if (e instanceof LiqualityError) {
            errorType.value = e.errorType;
            urlToMoreInformation.value = e.urlToMoreInformation;
            messageToUserOnLink.value = e.messageToUserOnLink;
            messageInstallationToUser.value = e.messageInstallationToUser;
            installationLink.value = e.installationLink;
          }
          sendBitcoinState.value = 'error';
          showErrorDialog.value = true;
        });
    }

    async function backToConnectDevice() {
      await clear();
      await clearAccount();
      let wallet: BtcWallet;
      if (bitcoinWallet.value) {
        wallet = bitcoinWallet.value;
      } else {
        await back();
      }
      await clearStore();
      init()
        .then(() => setBtcWallet(wallet));
    }

    async function back() {
      await stopAskingForBalance();
      context.emit('back');
    }

    function setTxBuilder():void {
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

    async function clear(): Promise<void> {
      showErrorDialog.value = false;
      showTxErrorDialog.value = false;
      deviceError.value = 'Unexpected error';
      sendBitcoinState.value = 'idle';
      confirmTxState.value = new Machine('idle');
      currentComponent.value = 'PegInForm';
      txId.value = '';
      txError.value = '';
      setTxBuilder();
      await stopAskingForBalance();
    }

    setTxBuilder();

    return {
      startAskingForBalance,
      sendBitcoinState,
      toConfirmTx,
      toTrackingId,
      currentComponent,
      txBuilder,
      txId,
      backToConnectDevice,
      toPegInForm,
      confirmTxState,
      showErrorDialog,
      deviceError,
      errorType,
      urlToMoreInformation,
      messageInstallationToUser,
      messageToUserOnLink,
      installationLink,
      closeErrorDialog,
      showTxErrorDialog,
      txError,
      closeTxErrorDialog,
      walletDataReady,
    };
  },
}
//
// @Component({
//   components: {
//     PegInForm,
//     ConfirmTrezorTransaction,
//     ConfirmLedgerTransaction,
//     ConfirmLiqualityTransaction,
//     ConnectDevice,
//     DeviceErrorDialog,
//     TxErrorDialog,
//   },
// })
//
// class SendBitcoin extends Vue {
//   showErrorDialog = false;
//
//   showTxErrorDialog = false;
//
//   deviceError = 'test';
//
//   errorType = '';
//
//   urlToMoreInformation = '';
//
//   messageToUserOnLink = '';
//
//   installationLink = '';
//
//   messageInstallationToUser = '';
//
//   sendBitcoinState: SendBitcoinState = 'idle';
//
//   currentComponent = 'PegInForm';
//
//   txId = '';
//
//   txError = '';
//
//   confirmTxState: Machine<
//     'idle'
//     | 'loading'
//     | 'error'
//     | 'goingHome'
//     > = new Machine('idle');
//
//   rawTx = '';
//
//   txBuilder!: TxBuilder;
//
//   @State('pegInTx') peginTxState!: PegInTxState;
//
//   @Action(constants.PEGIN_TX_START_ASKING_FOR_BALANCE, { namespace: 'pegInTx' }) startAskingForBalanceStore !: () => Promise<void>;
//
//   @Action(constants.PEGIN_TX_STOP_ASKING_FOR_BALANCE, { namespace: 'pegInTx' }) stopAskingForBalance !: () => Promise<void>;
//
//   @Action(constants.PEGIN_TX_ADD_NORMALIZED_TX, { namespace: 'pegInTx' }) addNormalizedTx !: (tx: NormalizedTx) => void;
//
//   @Action(constants.WEB3_SESSION_CLEAR_ACCOUNT, { namespace: 'web3Session' }) clearAccount !: () => void;
//
//   @Action(constants.PEGIN_TX_CLEAR_STATE, { namespace: 'pegInTx' }) clearStore !: () => void;
//
//   @Action(constants.PEGIN_TX_INIT, { namespace: 'pegInTx' }) init !: () => Promise<void>;
//
//   @Action(constants.PEGIN_TX_ADD_BITCOIN_WALLET, { namespace: 'pegInTx' }) setBtcWallet !: (wallet: BtcWallet) => Promise<void>;
//
//   @Getter(constants.PEGIN_TX_GET_CHANGE_ADDRESS, { namespace: 'pegInTx' }) getChangeAddress!: (accountType: string) => string;
//
//   get change() {
//     return this.getChangeAddress;
//   }
//
//   @Emit()
//   async toConfirmTx({
//     amountToTransferInSatoshi,
//     refundAddress,
//     recipient,
//     feeLevel,
//     accountType,
//   }: {
//     amountToTransferInSatoshi: SatoshiBig;
//     refundAddress: string;
//     recipient: string;
//     feeLevel: string;
//     accountType: string;
//   }) {
//     this.txBuilder.getNormalizedTx({
//       amountToTransferInSatoshi: Number(amountToTransferInSatoshi.toString()),
//       refundAddress,
//       recipient,
//       feeLevel,
//       changeAddress: this.getChangeAddress(accountType),
//       sessionId: this.peginTxState.sessionId,
//       accountType,
//     })
//       .then((tx: NormalizedTx) => {
//         this.addNormalizedTx(tx);
//         switch (this.peginTxState.bitcoinWallet) {
//           case constants.WALLET_LEDGER:
//             this.currentComponent = 'ConfirmLedgerTransaction';
//             break;
//           case constants.WALLET_LIQUALITY:
//             this.currentComponent = 'ConfirmLiqualityTransaction';
//             break;
//           default:
//             this.currentComponent = 'ConfirmTrezorTransaction';
//             break;
//         }
//         return tx;
//       })
//       .catch((error) => {
//         this.txError = error.message;
//         this.showTxErrorDialog = true;
//       });
//   }
//
//   @Emit()
//   toPegInForm() {
//     this.currentComponent = 'PegInForm';
//     this.confirmTxState.send('idle');
//     this.addNormalizedTx(getClearPeginTxState().normalizedTx);
//   }
//
//   @Emit()
//   toTrackingId([txError, txId]: string[]) {
//     if (txError !== '') {
//       this.txError = txError;
//       this.showTxErrorDialog = true;
//       this.txId = txId;
//     } else if (txId) {
//       this.$router.push({ name: 'Success', params: { txId } });
//     }
//   }
//
//   @Emit()
//   closeErrorDialog() {
//     this.showErrorDialog = false;
//     this.sendBitcoinState = 'idle';
//   }
//
//   @Emit()
//   async closeTxErrorDialog() {
//     this.showTxErrorDialog = false;
//     this.sendBitcoinState = 'idle';
//     this.confirmTxState.send('idle');
//   }
//
//   @Emit()
//   startAskingForBalance() {
//     this.sendBitcoinState = 'loading';
//     this.startAskingForBalanceStore()
//       .catch((e) => {
//         if (e.statusCode === 27010) {
//           this.deviceError = 'Please unlock your Ledger device.';
//         } else {
//           this.deviceError = e.message;
//         }
//         if (e instanceof LiqualityError) {
//           this.errorType = e.errorType;
//           this.urlToMoreInformation = e.urlToMoreInformation;
//           this.messageToUserOnLink = e.messageToUserOnLink;
//           this.messageInstallationToUser = e.messageInstallationToUser;
//           this.installationLink = e.installationLink;
//         }
//         this.sendBitcoinState = 'error';
//         this.showErrorDialog = true;
//       });
//   }
//
//   @Emit()
//   async backToConnectDevice() {
//     await this.clear();
//     this.clearAccount();
//     let wallet: BtcWallet;
//     if (this.peginTxState.bitcoinWallet) {
//       wallet = this.peginTxState.bitcoinWallet;
//     } else {
//       await this.back();
//     }
//     this.clearStore();
//     this.init()
//       .then(() => this.setBtcWallet(wallet));
//   }
//
//   @Emit('back')
//   async back() {
//     await this.stopAskingForBalance();
//   }
//
//   @Emit()
//   setTxBuilder():void {
//     switch (this.peginTxState.bitcoinWallet) {
//       case constants.WALLET_TREZOR:
//         this.txBuilder = new TrezorTxBuilder();
//         break;
//       case constants.WALLET_LEDGER:
//         this.txBuilder = new LedgerTxBuilder();
//         break;
//       case constants.WALLET_LIQUALITY:
//         this.txBuilder = new LiqualityTxBuilder();
//         break;
//       default:
//         this.txBuilder = new TrezorTxBuilder();
//         break;
//     }
//   }
//
//   @Emit()
//   async clear(): Promise<void> {
//     this.showErrorDialog = false;
//     this.showTxErrorDialog = false;
//     this.deviceError = 'Unexpected error';
//     this.sendBitcoinState = 'idle';
//     this.confirmTxState = new Machine('idle');
//     this.currentComponent = 'PegInForm';
//     this.txId = '';
//     this.txError = '';
//     this.setTxBuilder();
//     await this.stopAskingForBalance();
//   }
//
//   created() {
//     this.setTxBuilder();
//   }
// }
</script>
