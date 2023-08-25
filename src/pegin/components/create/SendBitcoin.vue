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
</script>