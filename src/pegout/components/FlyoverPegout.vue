<template>
  <v-container>
    <v-row>
      <v-btn variant="text"
        :prepend-icon="mdiArrowLeft"
        @click="back"
        :disabled="pegOutFormState.matches(['loading', 'goingHome'])">
        Go Back
      </v-btn>
    </v-row>
    <v-row>
      <v-col>
        <flyover-rbtc-input-amount
          @getQuotes="getQuotes"
          :willReceive="amountToReceive" />
      </v-col>
    </v-row>
    <v-row v-if="showStep && !loadingQuotes">
      <v-col cols="6" v-for="(quote, index) in pegoutQuotes" :key="index" >
        <pegout-option
        :class="index === 0 ? 'mr-2' : 'ml-2'"
        :quote="quote"
        :isWalletAuthorizedToSign="isWalletAuthorizedToSign"
        @openAddressDialog="showAddressDialog = true"
        @changeSelectedOption="changeSelectedOption"
        :selectedOption="selectedOption === quote.quoteHash"
        :quote-differences="quoteDifferences"
        />
      </v-col>
    </v-row>
    <v-row v-else-if="loadingQuotes" class="pt-4 justify-center">
      <v-progress-circular
        :size="250"
        :width="18"
        color="warning"
        indeterminate>
        Searching Options...
      </v-progress-circular>
    </v-row>
    <v-row justify="end">
        <v-col cols="auto">
            <v-btn-rsk v-if="!pegOutFormState.matches(['loading'])"
            @click="send(selectedOption)"
            :disabled="!isReadyToCreate
              || !isFlyoverReady
              || pegOutFormState.matches(['goingHome'])"
            >
            <template #append>
              <v-icon :icon="mdiArrowRight" />
            </template>
            Send
          </v-btn-rsk>
        </v-col>
      </v-row>
    <!-- Address Dialog -->
    <v-row v-if="showAddressDialog">
      <address-dialog @closeDialog="showAddressDialog = false"/>
    </v-row>
    <v-overlay
      v-model="sendingPegout"
      class="align-center justify-center"
    >
    <div class="d-flex flex-column align-center ga-2">
      <v-progress-circular
        :size="250"
        :width="18"
        color="warning"
        indeterminate
        />
      <p v-if="isLedgerConnected" class="text-warning">
        See your Ledger device to confirm your transaction.
      </p>
    </div>

    </v-overlay>
    <!-- Send tx error message -->
    <template v-if="showTxErrorDialog">
      <full-tx-error-dialog
      :showTxErrorDialog="showTxErrorDialog"
      :error="txError"
      @closeErrorDialog="showTxErrorDialog = false"
      />
    </template>
    <quote-diff-dialog :show-dialog="showQuoteDiff"
      :differences="quoteDifferences" @continue="continueHandler"/>
  </v-container>
</template>

<script lang="ts">
import {
  computed, defineComponent, ref,
} from 'vue';
import * as constants from '@/common/store/constants';
import EnvironmentContextProviderService from '@/common/providers/EnvironmentContextProvider';
import FlyoverRbtcInputAmount from '@/pegout/components/FlyoverRbtcInputAmount.vue';
import AddressDialog from '@/pegout/components/AddressDialog.vue';
import QuoteDiffDialog from '@/pegout/components/QuoteDiffDialog.vue';
import {
  useAction, useGetter, useState, useStateAttribute,
} from '@/common/store/helper';
import { SessionState } from '@/common/types/session';
import { mdiArrowLeft, mdiArrowRight } from '@mdi/js';
import {
  FlyoverPegoutState, ObjectDifference, PegOutTxState, QuotePegOut2WP,
  SatoshiBig, TxStatusType, WeiBig,
} from '@/common/types';
import { Machine, ServiceError, validateAddress } from '@/common/utils';
import router from '@/common/router';
import ApiService from '@/common/services/ApiService';
import FullTxErrorDialog from '@/common/components/exchange/FullTxErrorDialog.vue';
import PegoutOption from './PegoutOption.vue';

export default defineComponent({
  name: 'FlyoverPegout',
  components: {
    FlyoverRbtcInputAmount,
    AddressDialog,
    PegoutOption,
    FullTxErrorDialog,
    QuoteDiffDialog,
  },
  props: {
    flyoverEnabled: {
      type: Boolean,
      required: true,
    },
  },
  setup(props, context) {
    const nextPage = 'Confirmation';
    const showTxErrorDialog = ref(false);
    const txError = ref<ServiceError>(new ServiceError('', '', '', ''));
    const environmentContext = EnvironmentContextProviderService.getEnvironmentContext();
    const pegOutFormState = ref<Machine<'loading' | 'goingHome' | 'fill'>>(new Machine('fill'));
    const showAddressDialog = ref(false);
    const loadingQuotes = ref(false);
    const showStep = ref(false);
    const isWalletAuthorizedToSign = ref(true);

    const pegOutTxState = useState<PegOutTxState>('pegOutTx');
    const flyoverPegoutState = useState<FlyoverPegoutState>('flyoverPegout');
    const session = useState<SessionState>('web3Session');
    const sendTx = useAction('pegOutTx', constants.PEGOUT_TX_SEND);
    const sendFlyoverTx = useAction('flyoverPegout', constants.FLYOVER_PEGOUT_ACCEPT_AND_SEND_QUOTE);
    const initFlyoverTx = useAction('flyoverPegout', constants.FLYOVER_PEGOUT_INIT);
    const clearFlyoverState = useAction('flyoverPegout', constants.FLYOVER_PEGOUT_CLEAR_STATE);
    const getPegoutQuotes = useAction('flyoverPegout', constants.FLYOVER_PEGOUT_GET_QUOTES);
    const quotes = useStateAttribute<Record<number, QuotePegOut2WP[]>>('flyoverPegout', 'quotes');
    const quoteDifferences = useStateAttribute<Array<ObjectDifference>>('flyoverPegout', 'differences');
    const selectedQuote = useGetter<QuotePegOut2WP>('flyoverPegout', constants.FLYOVER_PEGOUT_GET_SELECTED_QUOTE);
    const estimatedBtcToReceive = useGetter<SatoshiBig>('pegOutTx', constants.PEGOUT_TX_GET_ESTIMATED_BTC_TO_RECEIVE);
    const isEnoughBalance = useGetter<boolean>('pegOutTx', constants.PEGOUT_TX_IS_ENOUGH_BALANCE);
    const isLedgerConnected = useGetter<boolean>('web3Session', constants.SESSION_IS_LEDGER_CONNECTED);
    const isTrezorConnected = useGetter<boolean>('web3Session', constants.SESSION_IS_TREZOR_CONNECTED);
    const isMetamaskConnected = useGetter<boolean>('web3Session', constants.SESSION_IS_METAMASK_CONNECTED);
    const setSelectedQuoteHash = useAction('flyoverPegout', constants.FLYOVER_PEGOUT_SET_SELECTED_QUOTE_HASH);
    const getSelectedQuote = useGetter<QuotePegOut2WP>('flyoverPegout', constants.FLYOVER_PEGOUT_GET_SELECTED_QUOTE);
    const selectedOption = ref<string | undefined>('');

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
          depositConfirmations: 198, // to match 33 hours with 10 minutes per block
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
          transferTime: 0,
          value: pegOutTxState.value.amountToTransfer,
        },
        quoteHash: '',
      });

      quoteList.sort((q1, q2) => q2.quote.depositConfirmations - q1.quote.depositConfirmations);

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
      return '';
    });

    const showQuoteDiff = computed(() => quoteDifferences.value.length > 0);

    const validAmountToReceive = computed((): boolean => estimatedBtcToReceive.value.gt(0));

    const isReadyToCreate = computed((): boolean => isEnoughBalance.value
        && !!session.value.account
        && validAmountToReceive.value
        && selectedOption.value !== undefined);

    const isFlyoverReady = computed(() => {
      if (selectedOption.value) {
        const { btcRecipientAddress } = flyoverPegoutState.value;
        const { bridgeContractAddress } = pegOutTxState.value.pegoutConfiguration;
        const { valid, addressType } = validateAddress(btcRecipientAddress);
        const allowedAdressType = (addressType === constants.BITCOIN_LEGACY_ADDRESS
          || addressType === constants.BITCOIN_SEGWIT_ADDRESS);
        return valid
          && btcRecipientAddress !== bridgeContractAddress
          && allowedAdressType;
      }
      return true;
    });

    const sendingPegout = computed(():boolean => pegOutFormState.value.matches(['loading']));

    function handlePegoutError(error: ServiceError) {
      txError.value = error;
      showTxErrorDialog.value = true;
    }

    function changePage(type: string) {
      router.push({
        name: 'SuccessTx',
        params: {
          type,
          txId: type === TxStatusType.FLYOVER_PEGOUT.toLowerCase()
            ? flyoverPegoutState.value.txHash
            : pegOutTxState.value.txHash,
        },
      });
      context.emit('changePage', nextPage);
    }

    function getLPName(): string {
      return flyoverPegoutState.value.liquidityProviders
        .find((lp) => lp.provider === selectedQuote.value.quote.liquidityProviderRskAddress)?.name ?? '';
    }

    function getProviderFee(): string {
      return selectedQuote.value.quote.productFeeAmount
        .plus(selectedQuote.value.quote.callFee)
        .toRBTCTrimmedString();
    }

    const registerFlyover = computed(() => ({
      sessionId: '',
      txHash: flyoverPegoutState.value.txHash as string,
      type: TxStatusType.PEGOUT.toLowerCase(),
      value: Number(flyoverPegoutState.value.amountToTransfer.toRBTCTrimmedString()),
      wallet: currentWallet.value ? currentWallet.value.formal_name : '',
      rskGas: Number(selectedQuote.value.quote.gasFee.toRBTCTrimmedString()),
      fee: Number(getProviderFee()),
      provider: getLPName(),
      details: {
        senderAddress: session.value.account,
        recipientAddress: flyoverPegoutState.value.btcRecipientAddress,
        blocksToCompleteTransaction: selectedQuote.value.quote.depositConfirmations,
      },
    }));

    const registerPegout = computed(() => ({
      sessionId: '',
      txHash: pegOutTxState.value.txHash as string,
      type: TxStatusType.PEGOUT.toLowerCase(),
      value: Number(pegOutTxState.value.amountToTransfer.toRBTCTrimmedString()),
      wallet: currentWallet.value ? currentWallet.value.formal_name : '',
      btcEstimatedFee: Number(pegOutTxState.value.btcEstimatedFee.toBTCTrimmedString()),
      rskGas: Number(pegOutTxState.value.calculatedFee.toRBTCTrimmedString()),
    }));

    async function send(quoteHash: string) {
      const type = quoteHash
        ? TxStatusType.FLYOVER_PEGOUT.toLowerCase()
        : TxStatusType.PEGOUT.toLowerCase();
      pegOutFormState.value.send('loading');
      try {
        if (quoteHash) {
          await sendFlyoverTx(quoteHash);
        } else {
          await sendTx();
        }
        ApiService.registerTx(quoteHash ? registerFlyover.value : registerPegout.value);
        changePage(type);
      } catch (e) {
        if (e instanceof ServiceError) {
          handlePegoutError(e);
        }
      } finally {
        pegOutFormState.value.send('fill');
      }
    }

    function clearState() {
      clearFlyoverState();
      initFlyoverTx();
      showStep.value = false;
    }

    function back():void {
      clearState();
      router.push({ name: 'Home' });
    }

    function getQuotes() {
      loadingQuotes.value = true;
      getPegoutQuotes(session.value.account)
        .catch(handlePegoutError)
        .finally(() => {
          loadingQuotes.value = false;
          showStep.value = true;
        });
    }

    function changeSelectedOption(quoteHash: string) {
      setSelectedQuoteHash(quoteHash);
      selectedOption.value = quoteHash;
    }

    if (!props.flyoverEnabled) {
      showStep.value = true;
    }

    const amountToReceive = computed(() => {
      let finalAmount = '';
      if (selectedOption.value) {
        finalAmount = getSelectedQuote.value?.quote.value.toRBTCTrimmedString();
      } else {
        finalAmount = new WeiBig(estimatedBtcToReceive.value.toBTCString(), 'rbtc')
          .minus(pegOutTxState.value.calculatedFee).toRBTCTrimmedString();
      }
      return new SatoshiBig(finalAmount, 'btc').toBTCTrimmedString();
    });

    function continueHandler() {
      setSelectedQuoteHash('');
      selectedOption.value = undefined;
    }

    return {
      environmentContext,
      showAddressDialog,
      isWalletAuthorizedToSign,
      isLedgerConnected,
      pegOutFormState,
      send,
      back,
      isReadyToCreate,
      txError,
      showTxErrorDialog,
      pegoutQuotes,
      clearState,
      getQuotes,
      loadingQuotes,
      sendingPegout,
      showStep,
      quoteDifferences,
      showQuoteDiff,
      mdiArrowLeft,
      selectedOption,
      changeSelectedOption,
      mdiArrowRight,
      amountToReceive,
      isFlyoverReady,
      continueHandler,
    };
  },
});

</script>
