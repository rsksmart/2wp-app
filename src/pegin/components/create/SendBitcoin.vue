<template>
  <v-container class="pt-0">
    <template v-if="!walletDataReady">
      <connect-device @continueToForm="startAskingForBalance"
                      :sendBitcoinState="sendBitcoinState"
                      :show-dialog="showConnectDeviceDialog"
      />
    </template>
    <template v-else>
      <div v-if="loadingProviders"
        class="position-absolute top-0 right-0 bottom-0 left-0
          d-flex justify-center align-center mt-n16"
        >
        <v-progress-circular
          :size="250"
          :width="18"
          color="warning"
          indeterminate />
      </div>
      <component v-else :is="currentComponent" v-bind="filteredProps" v-on="eventHandlers" />
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
  ref, defineComponent,
  watch, computed, onBeforeMount,
} from 'vue';
import { useRouter } from 'vue-router';
import PegInForm from '@/pegin/components/create/PegInForm.vue';
import ConfirmTx from '@/pegin/components/create/ConfirmTx.vue';
import * as constants from '@/common/store/constants';
import {
  SendBitcoinState, SatoshiBig, BtcWallet, Utxo,
  TxStatusType,
  PeginQuote,
  FeatureNames,
  Feature,
  UtxoList,
  Fee,
} from '@/common/types';
import { Machine, getClearPeginTxState } from '@/common/utils';
import { useAction, useGetter, useStateAttribute } from '@/common/store/helper';
import TrezorTxBuilder from '@/pegin/middleware/TxBuilder/TrezorTxBuilder';
import LedgerTxBuilder from '@/pegin/middleware/TxBuilder/LedgerTxBuilder';
import TxBuilder from '@/pegin/middleware/TxBuilder/TxBuilder';
import DeviceErrorDialog from '@/common/components/exchange/DeviceErrorDialog.vue';
import ConnectDevice from '@/common/components/exchange/ConnectDevice.vue';
import TxErrorDialog from '@/common/components/exchange/TxErrorDialog.vue';
import { TrezorError } from '@/common/types/exception/TrezorError';
import LeatherTxBuilder from '@/pegin/middleware/TxBuilder/LeatherTxBuilder';
import EnkryptTxBuilder from '@/pegin/middleware/TxBuilder/EnkryptTxBuilder';
import PeginTxService from '@/pegin/services/PeginTxService';
import XverseTxBuilder from '@/pegin/middleware/TxBuilder/XverseTxBuilder';

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
    const currentComponent = ref<'PegInForm' | 'ConfirmTx'>('PegInForm');
    const txId = ref('');
    const txError = ref('');
    const confirmTxState = ref<Machine<
      'idle'
      | 'loading'
      | 'confirming'
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
    const clearStore = useAction('pegInTx', constants.PEGIN_TX_CLEAR_STATE);
    const clearSessionState = useAction('web3Session', constants.WEB3_SESSION_CLEAR_ACCOUNT);
    const setCurrenView = useAction('pegInTx', constants.PEGIN_TX_SET_CURRENT_VIEW);
    const getChangeAddress = useGetter<string>('pegInTx', constants.PEGIN_TX_GET_CHANGE_ADDRESS);
    const selectedUtxoList = useGetter<Utxo[]>('pegInTx', constants.PEGIN_TX_GET_SELECTED_UTXO_LIST);
    const selectedFee = useGetter<SatoshiBig>('pegInTx', constants.PEGIN_TX_GET_SAFE_TX_FEE);
    const selectedFlyoverFee = useGetter<Fee & UtxoList>('flyoverPegin', constants.FLYOVER_PEGIN_GET_SELECTED_FEE);
    const selectedFlyoverQuote = useGetter<PeginQuote>('flyoverPegin', constants.FLYOVER_PEGIN_GET_SELECTED_QUOTE);
    const initFlyover = useAction('flyoverPegin', constants.FLYOVER_PEGIN_INIT);
    const flyoverFeature = useGetter<(name: FeatureNames) => Feature>('web3Session', constants.SESSION_GET_FEATURE);
    const isFlyoverAvailable = ref(false);
    const loadingProviders = ref(true);
    const type = useStateAttribute<string>('pegInTx', 'peginType');
    const amountToTransfer = useStateAttribute<SatoshiBig>('pegInTx', 'amountToTransfer');

    const valueToReceive = computed<SatoshiBig>(() => {
      if (type.value === constants.peginType.FLYOVER) {
        return selectedFlyoverQuote.value.quote.value;
      }
      return amountToTransfer.value;
    });

    const selectedFeePerType = computed(() => {
      if (type.value === constants.peginType.FLYOVER) {
        return selectedFlyoverFee.value.amount;
      }
      return selectedFee.value;
    });

    const selectedUtxoListPerType = computed(() => {
      if (type.value === constants.peginType.FLYOVER) {
        return selectedFlyoverFee.value.selectedUtxoList;
      }
      return selectedUtxoList.value;
    });

    async function toConfirmTx({
      amountToTransferInSatoshi,
      refundAddress,
      recipient,
      btcRecipient,
      peginType,
    }: {
      amountToTransferInSatoshi: SatoshiBig;
      refundAddress: string;
      recipient: string;
      accountType: string;
      btcRecipient: string;
      peginType: constants.peginType;
    }) {
      const normalizedTx = PeginTxService.buildNormalizedTx(
        {
          amountToTransfer: amountToTransferInSatoshi,
          federationOrLPAddress: btcRecipient,
          refundAddress,
          rskRecipientAddress: recipient,
          changeAddress: getChangeAddress.value,
          totalFee: selectedFeePerType.value,
          selectedUtxoList: selectedUtxoListPerType.value,
          peginType,
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

    function clearWallets() {
      clearStore();
      clearSessionState();
    }

    function toTrackingId([error, txHash]: string[]) {
      if (error !== '') {
        txError.value = error;
        showTxErrorDialog.value = true;
        txId.value = txHash;
      } else if (txHash) {
        router.push({
          name: 'SuccessTx',
          params: {
            txId: txHash,
            type: type.value === constants.peginType.FLYOVER
              ? TxStatusType.FLYOVER_PEGIN
              : TxStatusType.PEGIN,
            amount: valueToReceive.value.toSatoshiString(),
            confirmations: type.value === constants.peginType.FLYOVER
              ? selectedFlyoverQuote.value.quote.confirmations : 0,
          },
        });
        clearWallets();
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
        case constants.WALLET_NAMES.XVERSE.long_name:
          txBuilder.value = new XverseTxBuilder();
          currentWallet.value = constants.WALLET_NAMES.XVERSE.short_name;
          break;
        case constants.WALLET_NAMES.ENKRYPT.long_name:
          txBuilder.value = new EnkryptTxBuilder();
          currentWallet.value = constants.WALLET_NAMES.ENKRYPT.short_name;
          break;
        default:
          txBuilder.value = new TrezorTxBuilder();
          break;
      }
    }

    async function back() {
      await stopAskingForBalance();
      context.emit('back');
    }

    const filteredProps = computed(() => {
      if (currentComponent.value === 'ConfirmTx') {
        return { confirmTxState: confirmTxState.value, txBuilder: txBuilder.value };
      }
      if (currentComponent.value === 'PegInForm') {
        return { isFlyoverAvailable: isFlyoverAvailable.value };
      }
      return {};
    });

    const eventHandlers = computed(() => {
      if (currentComponent.value === 'ConfirmTx') {
        return { successConfirmation: toTrackingId, toPegInForm };
      }
      if (currentComponent.value === 'PegInForm') {
        return { createTx: toConfirmTx, back };
      }
      return {};
    });

    watch(currentComponent, () => {
      setCurrenView(currentComponent.value);
    }, { immediate: true });

    setTxBuilder();

    onBeforeMount(() => {
      const flag = flyoverFeature.value(FeatureNames.FLYOVER_PEG_IN);
      if (flag.value === constants.ENABLED) {
        initFlyover()
          .then(() => { isFlyoverAvailable.value = true; })
          .catch(() => { isFlyoverAvailable.value = false; })
          .finally(() => { loadingProviders.value = false; });
      } else {
        loadingProviders.value = false;
      }
    });

    return {
      startAskingForBalance,
      sendBitcoinState,
      currentComponent,
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
      loadingProviders,
      filteredProps,
      eventHandlers,
    };
  },
});
</script>
