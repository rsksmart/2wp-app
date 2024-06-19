<template>
  <v-container>
    <template v-if="!walletDataReady">
      <connect-device @continueToForm="startAskingForBalance"
                      :sendBitcoinState="sendBitcoinState"
                      :show-dialog="showConnectDeviceDialog"
      />
    </template>
    <template v-else>
      <component :is="currentComponent"
                 @createTx="toConfirmTx" @successConfirmation="toTrackingId"
                 :txBuilder="txBuilder"
                 :txId="txId" @back="back"
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
import { ref, defineComponent } from 'vue';
import { useRouter } from 'vue-router';
import PegInForm from '@/pegin/components/create/PegInForm.vue';
import ConfirmTx from '@/pegin/components/create/ConfirmTx.vue';
import * as constants from '@/common/store/constants';
import {
  SendBitcoinState, SatoshiBig, BtcWallet, Utxo, TxStatusType,
} from '@/common/types';
import { Machine, getClearPeginTxState } from '@/common/utils';
import { useAction, useGetter, useStateAttribute } from '@/common/store/helper';
import TrezorTxBuilder from '@/pegin/middleware/TxBuilder/TrezorTxBuilder';
import LedgerTxBuilder from '@/pegin/middleware/TxBuilder/LedgerTxBuilder';
import TxBuilder from '@/pegin/middleware/TxBuilder/TxBuilder';
import DeviceErrorDialog from '@/common/components/exchange/DeviceErrorDialog.vue';
import ConnectDevice from '@/common/components/exchange/ConnectDevice.vue';
import TxErrorDialog from '@/common/components/exchange/TxErrorDialog.vue';
import { BridgeService } from '@/common/services/BridgeService';
import { TrezorError } from '@/common/types/exception/TrezorError';
import LeatherTxBuilder from '@/pegin/middleware/TxBuilder/LeatherTxBuilder';
import PeginTxService from '../../services/PeginTxService';

export default defineComponent({
  name: 'SendBitcoin',
  components: {
    PegInForm,
    ConfirmTx,
    ConnectDevice,
    DeviceErrorDialog,
    TxErrorDialog,
  },
  setup(_, context) {
    const showErrorDialog = ref(false);
    const showTxErrorDialog = ref(false);
    const showConnectDeviceDialog = ref(false);
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
    const router = useRouter();
    const currentWallet = ref('');
    const bitcoinWallet = useStateAttribute<BtcWallet>('pegInTx', 'bitcoinWallet');
    const walletDataReady = useStateAttribute<boolean>('pegInTx', 'walletDataReady');
    const startAskingForBalanceStore = useAction('pegInTx', constants.PEGIN_TX_START_ASKING_FOR_BALANCE);
    const stopAskingForBalance = useAction('pegInTx', constants.PEGIN_TX_STOP_ASKING_FOR_BALANCE);
    const addNormalizedTx = useAction('pegInTx', constants.PEGIN_TX_ADD_NORMALIZED_TX);
    const clearAccount = useAction('web3Session', constants.WEB3_SESSION_CLEAR_ACCOUNT);
    const clearStore = useAction('pegInTx', constants.PEGIN_TX_CLEAR_STATE);
    const init = useAction('pegInTx', constants.PEGIN_TX_INIT);
    const setBtcWallet = useAction('pegInTx', constants.PEGIN_TX_ADD_BITCOIN_WALLET);
    const getChangeAddress = useGetter<string>('pegInTx', constants.PEGIN_TX_GET_CHANGE_ADDRESS);
    const selectedUtxoList = useGetter<Utxo[]>('pegInTx', constants.PEGIN_TX_GET_SELECTED_UTXO_LIST);
    const selectedFee = useGetter<SatoshiBig>('pegInTx', constants.PEGIN_TX_GET_SAFE_TX_FEE);

    async function toConfirmTx({
      amountToTransferInSatoshi,
      refundAddress,
      recipient,
    }: {
      amountToTransferInSatoshi: SatoshiBig;
      refundAddress: string;
      recipient: string;
      accountType: string;
    }) {
      const bridgeService = new BridgeService();
      const normalizedTx = PeginTxService.buildNormalizedTx(
        {
          amountToTransfer: amountToTransferInSatoshi,
          federationAddress: await bridgeService.getFederationAddress(),
          refundAddress,
          rskRecipientAddress: recipient,
          changeAddress: getChangeAddress.value,
          totalFee: selectedFee.value,
          selectedUtxoList: selectedUtxoList.value,
        },
      );
      await addNormalizedTx(normalizedTx);
      currentComponent.value = 'ConfirmTx';
      return normalizedTx;
    }

    function toPegInForm() {
      currentComponent.value = 'PegInForm';
      confirmTxState.value.send('idle');
      addNormalizedTx(getClearPeginTxState().normalizedTx);
    }

    function toTrackingId([error, txHash]: string[]) {
      if (error !== '') {
        txError.value = error;
        showTxErrorDialog.value = true;
        txId.value = txHash;
      } else if (txHash) {
        router.push({
          name: 'SuccessTx',
          params: { txId: txHash, type: (TxStatusType.PEGIN).toLowerCase() },
        });
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
          const stringError = JSON.stringify(e);
          if (e.statusCode === 27010) {
            deviceError.value = 'Please unlock your Ledger device.';
          } else if (stringError.includes('No device selected')) {
            deviceError.value = 'There are no device selected, please check your wallet connection, unlock your device and try again.';
          } else {
            console.error(e);
            deviceError.value = 'Something went wrong with the wallet, please check your wallet connection, unlock your device and try again.';
          }
          if (e instanceof TrezorError) {
            errorType.value = e.errorType;
          }
          sendBitcoinState.value = 'error';
          showErrorDialog.value = true;
        });
    }

    function setTxBuilder():void {
      switch (bitcoinWallet.value) {
        case constants.WALLET_NAMES.TREZOR.long_name:
          txBuilder.value = new TrezorTxBuilder();
          currentWallet.value = constants.WALLET_NAMES.TREZOR.short_name;
          break;
        case constants.WALLET_NAMES.LEDGER.long_name:
          txBuilder.value = new LedgerTxBuilder();
          currentWallet.value = constants.WALLET_NAMES.LEDGER.short_name;
          break;
        case constants.WALLET_NAMES.LEATHER.long_name:
          txBuilder.value = new LeatherTxBuilder();
          currentWallet.value = constants.WALLET_NAMES.LEATHER.short_name;
          break;
        default:
          txBuilder.value = new TrezorTxBuilder();
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
      await clearAccount();
      await stopAskingForBalance();
    }

    async function back() {
      await stopAskingForBalance();
      context.emit('back');
    }

    async function backToConnectDevice() {
      await clear();
      let wallet: BtcWallet;
      if (bitcoinWallet.value) {
        wallet = bitcoinWallet.value;
      } else {
        await back();
      }
      showConnectDeviceDialog.value = true;
      await clearStore();
      init()
        .then(() => setBtcWallet(wallet));
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
      back,
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
      showConnectDeviceDialog,
    };
  },
});
</script>
