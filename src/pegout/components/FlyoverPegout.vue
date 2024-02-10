<template>
  <v-container>
        <!-- Header -->
        <v-row class="ma-0">
          <v-col class="flex-grow-0 align-self-center pl-0 pb-0">
            <v-img :src="require('@/assets/exchange/arrow.png')" width="40" />
          </v-col>
          <v-col class="pb-0">
            <h1 class="pegout-form-heading">
              Send {{environmentContext.getRbtcTicker()}}.
              Get {{environmentContext.getBtcTicker()}}.
            </h1>
          </v-col>
        </v-row>
        <v-row class="exchange-form ma-0 mt-2 justify-space-between">
          <!-- Form -->
          <v-col cols="12" class="pa-0">
            <!-- Step 1 -->
            <rsk-wallet-connection @switchDeriveButton="switchDeriveButton" class="p"/>
            <v-divider />
            <!-- Step 2 -->
            <flyover-rbtc-input-amount :enableButton="!isReadyToSign"
            @walletDisconnected="clearState"/>
            <v-divider />
            <!-- Step 3 -->
            <btc-recipient-input/>
            <v-divider/>
            <v-row class="ma-0 align-start">
              <v-col cols="10" class="d-flex justify-center ma-0 py-5 pl-0" >
                <v-btn rounded color="#000000"
                        @click="getQuotes" id="get-quotes-btn">
                  <span class="whiteish">Get Quotes</span>
                  <v-icon class="ml-2" color="#fff" :icon="mdiSendOutline"></v-icon>
                </v-btn>
              </v-col>
            </v-row>
            <v-divider/>
            <!-- Step 4 -->
            <v-row v-if="quotesToShow" class="ma-0 align-start">
              <v-col cols="auto" class="pl-0">
                <div :class="[focus ? 'number-filled' : 'number']">4</div>
              </v-col>
              <v-col class="pl-0 ma-0 pb-0">
                <p :class="{'boldie': focus}">
                  Choose the best option to proceed with:
                </p>
                <v-container class="px-0">
                  <v-row dense>
                    <v-col cols="6" v-for="(quote, index) in pegoutQuotes" :key="index" >
                      <pegout-option
                      :quote="quote"
                      :formState="pegOutFormState"
                      :isReadyToSign="isReadyToSign"
                      :isReadyToCreate="isReadyToCreate"
                      :authorizedWalletToSignMessage="authorizedWalletToSignMessage"
                      @openAddressDialog="showAddressDialog = true"
                      @flyoverInputFocusChanged="handleFlyoverInputFocusChanged"
                      @send="send(quote.quoteHash)"
                      />
                    </v-col>
                  </v-row>
                </v-container>
              </v-col>
            </v-row>
            <!-- Fee higher than amount error message -->
            <div class="form-step py-4 px-4" v-if="!validAmountToReceive && formFilled">
              <v-row class="alert-msg py-6">
                <v-col cols="1">
                <v-icon class="ml-2" color="#DF1B42" :icon="mdiAlertOctagon" size="40"></v-icon>
                </v-col>
                <v-col class="px-7">
                  <v-row class="title">
                    The transaction can't be performed
                  </v-row>
                  <v-row class="mt-5">
                    Currently the total fee to pay is higher than the amount you want to send.
                  </v-row>
                </v-col>
              </v-row>
            </div>
          </v-col>
        </v-row>
        <!-- Address Dialog -->
        <v-row v-if="showAddressDialog">
          <address-dialog @switchDeriveButton="switchDeriveButton"
                          @closeDialog="showAddressDialog = false"/>
        </v-row>
        <!-- Footer -->
        <v-row class="ma-0 mt-8">
          <v-col cols="2" class="d-flex justify-start ma-0 pa-0">
            <v-btn @click="back"
            rounded variant="outlined" color="#000000" width="110"
                    :disabled="pegOutFormState.matches(['loading', 'goingHome'])">
              <span>Back</span>
            </v-btn>
          </v-col>
          <v-col cols="10" class="d-flex justify-end ma-0 py-0 pl-0" >
            <v-progress-circular v-if="pegOutFormState.matches(['loading'])"
                                  indeterminate color="#000000" class="mr-10"/>
          </v-col>
        </v-row>
        <!-- Ledger loading message -->
        <v-row v-if="pegOutFormState.matches(['loading']) && isLedgerConnected"
          class="mx-0 justify-center">
          See your ledger device to confirm your transaction.
        </v-row>
          <!-- Send tx error message -->
          <template v-if="showTxErrorDialog">
            <tx-error-dialog
            :showTxErrorDialog="showTxErrorDialog"
            :errorMessage="txError"
            @closeErrorDialog="showTxErrorDialog = false"
            />
          </template>
      </v-container>
  </template>

<script lang="ts">
import {
  computed, defineComponent, ref,
} from 'vue';
import * as constants from '@/common/store/constants';
import EnvironmentContextProviderService from '@/common/providers/EnvironmentContextProvider';
import RskWalletConnection from '@/pegout/components/RskWalletConnection.vue';
import FlyoverRbtcInputAmount from '@/pegout/components/FlyoverRbtcInputAmount.vue';
import AddressDialog from '@/pegout/components/AddressDialog.vue';
import {
  useAction, useGetter, useState, useStateAttribute,
} from '@/common/store/helper';
import { SessionState } from '@/common/types/session';
import { mdiSendOutline, mdiAlertOctagon } from '@mdi/js';
import {
  NormalizedSummary, PegOutTxState, QuotePegOut2WP,
  SatoshiBig, TxStatusType, TxSummaryOrientation, WeiBig,
} from '@/common/types';
import { Machine } from '@/common/utils';
import router from '@/common/router';
import ApiService from '@/common/services/ApiService';
import TxErrorDialog from '@/common/components/exchange/TxErrorDialog.vue';
import PegoutOption from './PegoutOption.vue';
import BtcRecipientInput from './BtcRecipientInput.vue';

export default defineComponent({
  name: 'FlyoverPegout',
  components: {
    RskWalletConnection,
    FlyoverRbtcInputAmount,
    AddressDialog,
    PegoutOption,
    TxErrorDialog,
    BtcRecipientInput,
  },
  setup(props, context) {
    const nextPage = 'Confirmation';
    const typeSummary = TxStatusType.PEGOUT;
    const orientationSummary = TxSummaryOrientation.VERTICAL;
    const showTxErrorDialog = ref(false);
    const txError = ref('');
    const environmentContext = EnvironmentContextProviderService.getEnvironmentContext();
    const pegOutFormState = ref<Machine<'loading' | 'goingHome' | 'fill'>>(new Machine('fill'));
    const injectedProvider = ref('');
    const isReadyToSign = ref(false);
    const showAddressDialog = ref(false);
    const flyoverInputFocused = ref(false);
    const pegOutTxState = useState<PegOutTxState>('pegOutTx');
    const session = useState<SessionState>('web3Session');
    const sendTx = useAction('pegOutTx', constants.PEGOUT_TX_SEND);
    const sendFlyoverTx = useAction('flyoverPegout', constants.FLYOVER_PEGOUT_ACCEPT_AND_SEND_QUOTE);
    const initFlyoverTx = useAction('flyoverPegout', constants.FLYOVER_PEGOUT_INIT);
    const clearFlyoverState = useAction('flyoverPegout', constants.FLYOVER_PEGOUT_CLEAR_STATE);
    const getPegoutQuotes = useAction('flyoverPegout', constants.FLYOVER_PEGOUT_GET_QUOTES);
    const quotes = useStateAttribute<Record<number, QuotePegOut2WP[]>>('flyoverPegout', 'quotes');
    const estimatedBtcToReceive = useGetter<SatoshiBig>('pegOutTx', constants.PEGOUT_TX_GET_ESTIMATED_BTC_TO_RECEIVE);
    const isEnoughBalance = useGetter<boolean>('pegOutTx', constants.PEGOUT_TX_IS_ENOUGH_BALANCE);
    const safeFee = useGetter<WeiBig>('pegOutTx', constants.PEGOUT_TX_GET_SAFE_TX_FEE);
    const isLedgerConnected = useGetter<boolean>('web3Session', constants.SESSION_IS_LEDGER_CONNECTED);
    const isTrezorConnected = useGetter<boolean>('web3Session', constants.SESSION_IS_TREZOR_CONNECTED);
    const isMetamaskConnected = useGetter<boolean>('web3Session', constants.SESSION_IS_METAMASK_CONNECTED);
    const focus = computed(() => showAddressDialog.value || flyoverInputFocused.value);

    const quotesToShow = computed(
      () => Object.values(quotes.value).some((providerQuotes) => providerQuotes.length > 0),
    );

    const pegoutQuotes = computed(() => {
      const quoteList: QuotePegOut2WP[] = [];

      Object.values(quotes.value).forEach((providerQuotes) => {
        providerQuotes.forEach((quote) => {
          quoteList.push(quote);
        });
      });

      quoteList.push({
        quote: {
          agreementTimestamp: 0,
          btcRefundAddress: '',
          callFee: new WeiBig(0, 'wei'),
          depositAddr: '', // Must be derived
          depositConfirmations: 0,
          depositDateLimit: 0,
          expireBlocks: 0,
          expireDate: 0,
          gasFee: pegOutTxState.value.calculatedFee,
          lbcAddress: '',
          liquidityProviderRskAddress: '',
          lpBtcAddr: '',
          nonce: 0n,
          penaltyFee: new WeiBig(0, 'wei'),
          productFeeAmount: new WeiBig(pegOutTxState.value.btcEstimatedFee.toBTCString(), 'rbtc'),
          rskRefundAddress: session.value.account ?? '',
          transferConfirmations: 0,
          transferTime: 50400, // 14 hours in seconds
          value: pegOutTxState.value.amountToTransfer,
        },
        quoteHash: '',
      });

      return quoteList;
    });

    const currentWallet = computed(() => {
      if (isLedgerConnected.value) {
        return constants.WALLET_NAMES.LEDGER;
      }
      if (isTrezorConnected.value) {
        return constants.WALLET_NAMES.TREZOR;
      }
      if (isMetamaskConnected.value) {
        return constants.WALLET_NAMES.METAMASK;
      }
      if (injectedProvider.value === constants.RLOGIN_LIQUALITY_WALLET) {
        return constants.WALLET_NAMES.LIQUALITY;
      }
      return '';
    });

    const authorizedWalletToSignMessage = computed(
      (): boolean => injectedProvider.value === constants.RLOGIN_METAMASK_WALLET
        || isLedgerConnected.value
        || session.value.rLogin?.provider.isTrezor,
    );

    const validAmountToReceive = computed((): boolean => estimatedBtcToReceive.value.gt(0));

    const formFilled = computed((): boolean => !!session.value.account
      && pegOutTxState.value.amountToTransfer.gt(0)
      && !!pegOutTxState.value.btcEstimatedFee);

    const isReadyToCreate = computed((): boolean => isEnoughBalance.value
        && !!session.value.account
        && validAmountToReceive.value);

    function switchDeriveButton(): void {
      injectedProvider.value = session.value
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        .rLoginInstance?.providerController.injectedProvider.name;
      isReadyToSign.value = !isReadyToSign.value;
    }

    function changePage(type: string) {
      router.push({
        name: 'PegOutSuccess',
        params: {
          wallet: currentWallet.value,
          type,
        },
      });
      context.emit('changePage', nextPage);
    }

    function send(quoteHash: string) {
      const type = quoteHash ? 'flyover' : 'powpeg';
      pegOutFormState.value.send('loading');
      if (quoteHash) {
        sendFlyoverTx(quoteHash).then(() => changePage(type));
      } else {
        sendTx()
          .then(() => {
            ApiService.registerTx({
              sessionId: '',
              txHash: pegOutTxState.value.txHash as string,
              type: TxStatusType.PEGOUT.toLowerCase(),
              value: Number(pegOutTxState.value.amountToTransfer.toRBTCTrimmedString()),
              wallet: currentWallet.value,
              btcEstimatedFee: Number(pegOutTxState.value.btcEstimatedFee.toBTCTrimmedString()),
              rskGas: Number(pegOutTxState.value.calculatedFee.toRBTCTrimmedString()),
            });
            changePage(type);
          })
          .catch((error:Error) => {
            txError.value = error.message;
            showTxErrorDialog.value = true;
          });
      }
      pegOutFormState.value.send('fill');
    }

    function back():void {
      router.push({ name: 'Home' });
    }

    function clearState() {
      clearFlyoverState();
      initFlyoverTx();
    }

    function getQuotes() {
      getPegoutQuotes(session.value.account);
    }

    const pegOutFormSummary = computed((): NormalizedSummary => ({
      amountFromString: pegOutTxState.value.amountToTransfer.toRBTCTrimmedString(),
      amountReceivedString: validAmountToReceive.value
        ? estimatedBtcToReceive.value.toBTCTrimmedString()
        : '0',
      fee: Number(pegOutTxState.value.btcEstimatedFee.toBTCTrimmedString()),
      recipientAddress: session.value.btcDerivedAddress,
      senderAddress: session.value.account,
      gas: Number(safeFee.value.toRBTCTrimmedString()),
    }));

    function handleFlyoverInputFocusChanged(focused: boolean): void {
      flyoverInputFocused.value = focused;
    }

    return {
      environmentContext,
      switchDeriveButton,
      isReadyToSign,
      showAddressDialog,
      authorizedWalletToSignMessage,
      mdiAlertOctagon,
      mdiSendOutline,
      validAmountToReceive,
      formFilled,
      isLedgerConnected,
      pegOutFormState,
      send,
      back,
      isReadyToCreate,
      txError,
      showTxErrorDialog,
      pegOutFormSummary,
      typeSummary,
      orientationSummary,
      pegoutQuotes,
      focus,
      handleFlyoverInputFocusChanged,
      clearState,
      getQuotes,
      quotesToShow,
    };
  },
});

</script>
