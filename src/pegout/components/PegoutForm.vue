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
        <rbtc-input-amount
          @valid-amount="checkValidAmount"
          :clear="clearAmount" />
      </v-col>
    </v-row>
    <template v-if="showStep">
      <v-row>
        <span class="font-weight-bold ma-4 mb-2
        ">Select Mode</span>
      </v-row>
      <v-row>
        <v-col cols="6" v-if="!flyoverIsEnabled" >
          <pegout-option class="mr-2" flyover-not-available
            :option-type="pegoutType.FLYOVER">
            <template v-slot>
              <h4 v-if="countdown === recaptchanNewTokenTime">
                <span class="text-orange">Fast Mode</span> is unavailable at this time.
              </h4>
              <h4 v-else>
                Fast mode will be <br> available in
                <span class="text-orange">{{ countdown }} seconds.</span>
              </h4>
            </template>
          </pegout-option>
        </v-col>
        <v-col cols="6" v-if="flyoverIsEnabled && !validEnoughBalance && " >
          <pegout-option class="mr-2" flyover-not-available
            :option-type="pegoutType.FLYOVER">
            <template v-slot>
                <h4 v-if="countdown === recaptchanNewTokenTime">
                  <span class="text-orange">Review your transaction</span>
                   Amount+Fee greater than your balance.
                </h4>
            </template>
          </pegout-option>
        </v-col>
        <v-col cols="6" v-else v-for="(quote, index) in pegoutQuotes" :key="index" >
          <pegout-option
            :option-type="pegoutType.FLYOVER"
            :class="index === 0 ? 'mr-2' : 'ml-2'"
            :quote="quote"
            :isWalletAuthorizedToSign="isWalletAuthorizedToSign"
            @openAddressDialog="showAddressDialog = true"
            @changeSelectedOption="changeSelectedOption"
            :selectedOption="selectedOption === quote.quoteHash"
            :quote-difference="quoteDifference"
            />
        </v-col>
        <v-col cols="6">
          <pegout-option class="ml-2"
            :option-type="pegoutType.POWPEG"
            :quote="nativeQuote"
            :isWalletAuthorizedToSign="isWalletAuthorizedToSign"
            @openAddressDialog="showAddressDialog = true"
            @changeSelectedOption="changeSelectedOption"
            :selectedOption="selectedOption === ''"
            :quote-differences="quoteDifference"
            />
        </v-col>
      </v-row>
    </template>
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
            @click="executeRecaptcha"
            :disabled="!isValid
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
      <div class="d-flex flex-column align-center ga-2 rounded-circle bg-blur">
        <v-progress-circular
          :size="300"
          :width="18"
          color="warning"
          indeterminate
          >
          <span class="pa-10 text-center text-balance">
            Your transaction is being processed and will be sent to the network.
          </span>
        </v-progress-circular>
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
      @closeErrorDialog="clearForError"
      />
    </template>
    <quote-diff-dialog :show-dialog="showQuoteDiff"
      :differences="quoteDifference" @continue="continueHandler" @cancel="clearForError" />
    <div id="recaptcha" class="g-recaptcha"
        :data-sitekey="flyoverService.siteKey"
        data-callback="onRecaptchaSuccess"
        data-action="submit"
        data-size="invisible"></div>
  </v-container>
</template>

<script lang="ts">
import {
  computed, defineComponent, onBeforeMount, onMounted, ref, watch,
} from 'vue';
import * as constants from '@/common/store/constants';
import EnvironmentContextProviderService from '@/common/providers/EnvironmentContextProvider';
import RbtcInputAmount from '@/pegout/components/RbtcInputAmount.vue';
import AddressDialog from '@/pegout/components/AddressDialog.vue';
import QuoteDiffDialog from '@/pegout/components/QuoteDiffDialog.vue';
import {
  useAction, useGetter, useState, useStateAttribute,
} from '@/common/store/helper';
import { mdiArrowLeft, mdiArrowRight } from '@mdi/js';
import {
  FlyoverPegoutState, LiquidityProvider2WP, ObjectDifference,
  PegoutQuoteDbModel, PegOutTxState, QuotePegOut2WP,
  SatoshiBig, TxInfo, TxStatusType, WeiBig,
} from '@/common/types';
import {
  appendRecaptcha, Machine, ServiceError, validateAddress,
} from '@/common/utils';
import router from '@/common/router';
import ApiService from '@/common/services/ApiService';
import { FlyoverService } from '@/common/services';
import FullTxErrorDialog from '@/common/components/exchange/FullTxErrorDialog.vue';
import { EnvironmentAccessorService } from '@/common/services/enviroment-accessor.service';
import { providers } from 'ethers';
import PegoutOption from './PegoutOption.vue';

export default defineComponent({
  name: 'PegoutForm',
  components: {
    RbtcInputAmount,
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
  setup(props) {
    const showTxErrorDialog = ref(false);
    const txError = ref<ServiceError>(new ServiceError('', '', '', ''));
    const environmentContext = EnvironmentContextProviderService.getEnvironmentContext();
    const pegOutFormState = ref<Machine<'loading' | 'goingHome' | 'fill'>>(new Machine('fill'));
    const showAddressDialog = ref(false);
    const loadingQuotes = ref(false);
    const isWalletAuthorizedToSign = ref(true);
    const diffShown = ref(false);
    const clearAmount = ref(false);

    const pegOutTxState = useState<PegOutTxState>('pegOutTx');
    const flyoverPegoutState = useState<FlyoverPegoutState>('flyoverPegout');
    const flyoverService = useStateAttribute<FlyoverService>('flyoverPegout', 'flyoverService');
    const account = useStateAttribute<string>('web3Session', 'account');
    const balance = useStateAttribute<WeiBig>('web3Session', 'balance');
    const sendTx = useAction('pegOutTx', constants.PEGOUT_TX_SEND);
    const sendFlyoverTx = useAction('flyoverPegout', constants.FLYOVER_PEGOUT_ACCEPT_AND_SEND_QUOTE);
    const sendFlyoverTxWithConditionChanged = useAction('flyoverPegout', constants.FLYOVER_PEGOUT_ACCEPT_AND_SEND_QUOTE_WITH_CHANGED_CONDITIONS);
    const initFlyoverTx = useAction('flyoverPegout', constants.FLYOVER_PEGOUT_INIT);
    const initPegoutTx = useAction('pegOutTx', constants.PEGOUT_TX_INIT);
    const clearFlyoverState = useAction('flyoverPegout', constants.FLYOVER_PEGOUT_CLEAR_STATE);
    const clearPegoutTx = useAction('pegOutTx', constants.PEGOUT_TX_CLEAR);
    const getPegoutQuotes = useAction('flyoverPegout', constants.FLYOVER_PEGOUT_GET_QUOTES);
    const ethersProvider = useStateAttribute<providers.Web3Provider>('web3Session', 'ethersProvider');
    const quotes = useStateAttribute<Record<number, QuotePegOut2WP[]>>('flyoverPegout', 'quotes');
    const quoteDifference = useStateAttribute<ObjectDifference>('flyoverPegout', 'difference');
    const selectedQuote = useGetter<QuotePegOut2WP>('flyoverPegout', constants.FLYOVER_PEGOUT_GET_SELECTED_QUOTE);
    const estimatedBtcToReceive = useGetter<SatoshiBig>('pegOutTx', constants.PEGOUT_TX_GET_ESTIMATED_BTC_TO_RECEIVE);
    const isEnoughBalance = useGetter<boolean>('pegOutTx', constants.PEGOUT_TX_IS_ENOUGH_BALANCE);
    const isLedgerConnected = useGetter<boolean>('web3Session', constants.SESSION_IS_LEDGER_CONNECTED);
    const isTrezorConnected = useGetter<boolean>('web3Session', constants.SESSION_IS_TREZOR_CONNECTED);
    const isMetamaskConnected = useGetter<boolean>('web3Session', constants.SESSION_IS_METAMASK_CONNECTED);
    const setSelectedQuoteHash = useAction('flyoverPegout', constants.FLYOVER_PEGOUT_SET_SELECTED_QUOTE_HASH);
    const selectedQuoteHash = useStateAttribute<string>('flyoverPegout', 'selectedQuoteHash');
    const selectedOption = ref<string>('');
    const quoteDiffPercentage = EnvironmentAccessorService.getEnvironmentVariables()
      .flyoverPegoutDiffPercentage;
    const clearStore = useAction('pegInTx', constants.PEGOUT_TX_CLEAR_STATE);
    const clearSessionState = useAction('web3Session', constants.WEB3_SESSION_CLEAR_ACCOUNT);
    const getAvailableLiquidity = useAction('flyoverPegout', constants.FLYOVER_PEGOUT_GET_AVAILABLE_LIQUIDITY);
    const clearQuotes = useAction('flyoverPegout', constants.FLYOVER_PEGOUT_CLEAR_QUOTES);
    const amountToTransfer = useStateAttribute<WeiBig>('flyoverPegout', 'amountToTransfer');
    const liquidityProviders = useStateAttribute<LiquidityProvider2WP[]>('flyoverPegout', 'liquidityProviders');
    const startCountdown = useAction('web3Session', constants.SESSION_COUNTDOWN_GRECAPTCHA_TIME);
    const countdown = useStateAttribute<number>('web3Session', 'grecaptchaCountdown');
    const recaptchanNewTokenTime = EnvironmentAccessorService.getEnvironmentVariables()
      .grecaptchaTime;

    const pegoutQuotes = computed(() => {
      const quoteList: QuotePegOut2WP[] = [];

      Object.values(quotes.value).forEach((providerQuotes) => {
        providerQuotes.forEach((quote) => {
          quoteList.push(quote);
        });
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
      return '';
    });

    const showQuoteDiff = computed(() => quoteDifference.value.percentage > quoteDiffPercentage
      && diffShown.value);

    const validAmountToReceive = computed((): boolean => estimatedBtcToReceive.value.gt(0));

    const isReadyToCreate = computed((): boolean => isEnoughBalance.value
        && !!account.value
        && validAmountToReceive.value
        && selectedOption.value === '');

    const isFlyoverReady = computed(() => {
      if (selectedOption.value && selectedQuote.value) {
        const { btcRecipientAddress } = flyoverPegoutState.value;
        const { bridgeContractAddress } = pegOutTxState.value.pegoutConfiguration;
        const { valid, addressType } = validateAddress(btcRecipientAddress);
        const allowedAdressType = (addressType === constants.BITCOIN_LEGACY_ADDRESS
          || addressType === constants.BITCOIN_SEGWIT_ADDRESS
          || addressType === constants.BITCOIN_NATIVE_SEGWIT_ADDRESS);
        const amountPlusFees = selectedQuote.value.quote.value
          .plus(selectedQuote.value.quote.gasFee)
          .plus(selectedQuote.value.quote.productFeeAmount)
          .plus(selectedQuote.value.quote.callFee);
        const enoughBalance = balance.value.gt(amountPlusFees);
        return valid && enoughBalance
          && btcRecipientAddress !== bridgeContractAddress
          && allowedAdressType;
      }
      return true;
    });

    const sendingPegout = computed(():boolean => pegOutFormState.value.matches(['loading']));

    const nativeQuote = computed(() => {
      const btcFee = new WeiBig(pegOutTxState.value.btcEstimatedFee.toBTCString(), 'rbtc');
      const estimatedValueToReceive = pegOutTxState.value.amountToTransfer
        .minus(pegOutTxState.value.calculatedFee)
        .minus(btcFee);
      return {
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
          productFeeAmount: btcFee,
          rskRefundAddress: account.value ?? '',
          transferConfirmations: 0,
          transferTime: 0,
          value: estimatedValueToReceive,
        },
        quoteHash: '',
      };
    });

    const isValid = computed(() => {
      if (selectedQuote.value === undefined) return !loadingQuotes.value && isReadyToCreate.value;
      return !loadingQuotes.value && isFlyoverReady.value
        && countdown.value === recaptchanNewTokenTime;
    });

    const showCountdown = computed(() => {
      if (sendingPegout.value || diffShown.value) return true;
      return countdown.value === recaptchanNewTokenTime;
    });

    const flyoverIsEnabled = computed(() => pegoutQuotes.value.length > 0
      && props.flyoverEnabled && showCountdown.value);

    function handlePegoutError(error: ServiceError) {
      txError.value = error;
      showTxErrorDialog.value = true;
    }

    const valueToReceive = computed<WeiBig>(() => {
      const quoteHash = selectedQuoteHash.value || '';
      if (quoteHash) {
        return flyoverPegoutState.value.amountToTransfer;
      }
      return nativeQuote.value.quote.value;
    });

    function clearWallets() {
      clearStore();
      clearSessionState();
    }

    function changePage(type: string) {
      router.push({
        name: 'SuccessTx',
        params: {
          type,
          txId: type === TxStatusType.FLYOVER_PEGOUT.toLowerCase()
            ? flyoverPegoutState.value.txHash
            : pegOutTxState.value.txHash,
          amount: SatoshiBig.fromWeiBig(valueToReceive.value).toSatoshiString(),
          confirmations: type === TxStatusType.FLYOVER_PEGOUT.toLowerCase()
            ? selectedQuote.value.quote.depositConfirmations : 0,
        },
      });
      clearWallets();
    }

    function getLPName(): string {
      const address = selectedQuote.value.quote.liquidityProviderRskAddress.toLowerCase();
      const provider = flyoverPegoutState.value.liquidityProviders
        .find((lp) => lp.provider.toLowerCase() === address);
      return provider?.name ?? '';
    }

    function getProviderFee(): WeiBig {
      return selectedQuote.value.quote.productFeeAmount
        .plus(selectedQuote.value.quote.callFee);
    }

    const registerFlyover = computed<TxInfo>(() => {
      const pegoutQuote = selectedQuote.value.quote;
      const dbQuote: PegoutQuoteDbModel = {
        agreementTimestamp: pegoutQuote.agreementTimestamp.toString(),
        btcRefundAddress: pegoutQuote.btcRefundAddress,
        callFeeOnWei: pegoutQuote.callFee.toString(),
        depositAddr: pegoutQuote.depositAddr,
        depositConfirmations: pegoutQuote.depositConfirmations.toString(),
        depositDateLimit: pegoutQuote.depositDateLimit.toString(),
        expireBlocks: pegoutQuote.expireBlocks.toString(),
        expireDate: pegoutQuote.expireDate.toString(),
        gasFeeOnWei: pegoutQuote.gasFee.toString(),
        lbcAddress: pegoutQuote.lbcAddress,
        liquidityProviderRskAddress: pegoutQuote.liquidityProviderRskAddress,
        lpBtcAddress: pegoutQuote.lpBtcAddr,
        nonce: pegoutQuote.nonce.toString(),
        penaltyFeeOnWei: pegoutQuote.penaltyFee.toString(),
        productFeeAmountOnWei: pegoutQuote.productFeeAmount.toString(),
        rskRefundAddress: pegoutQuote.rskRefundAddress,
        transferConfirmations: pegoutQuote.transferConfirmations.toString(),
        transferTime: pegoutQuote.transferTime.toString(),
        valueOnWei: pegoutQuote.value.toString(),
      };
      return {
        txHash: flyoverPegoutState.value.txHash as string,
        type: TxStatusType.PEGOUT.toLowerCase(),
        value: flyoverPegoutState.value.amountToTransfer.toString(),
        wallet: currentWallet.value ? currentWallet.value.formal_name : '',
        rskGas: selectedQuote.value.quote.gasFee.toString(),
        fee: getProviderFee().toString(),
        provider: getLPName(),
        details: {
          senderAddress: account.value,
          recipientAddress: flyoverPegoutState.value.btcRecipientAddress,
          blocksToCompleteTransaction: selectedQuote.value.quote.depositConfirmations.toString(),
        },
        quote: dbQuote,
        quoteHash: selectedQuote.value.quoteHash,
        acceptedQuoteSignature: flyoverPegoutState.value.acceptedQuoteSignature,
      };
    });

    const registerPegout = computed(() => ({
      txHash: pegOutTxState.value.txHash as string,
      type: TxStatusType.PEGOUT.toLowerCase(),
      value: pegOutTxState.value.amountToTransfer.toString(),
      wallet: currentWallet.value ? currentWallet.value.formal_name : '',
      btcEstimatedFee: pegOutTxState.value.btcEstimatedFee.toString(),
      rskGas: pegOutTxState.value.calculatedFee.toString(),
    }));

    async function send() {
      clearAmount.value = false;
      const quoteHash = selectedQuoteHash.value || '';
      const type = quoteHash
        ? TxStatusType.FLYOVER_PEGOUT.toLowerCase()
        : TxStatusType.PEGOUT.toLowerCase();
      pegOutFormState.value.send('loading');
      try {
        if (quoteHash) {
          startCountdown();
          await sendFlyoverTx(quoteHash);
        } else await sendTx();
        ApiService.registerTx(quoteHash ? registerFlyover.value : registerPegout.value);
        changePage(type);
      } catch (e) {
        if (e instanceof ServiceError) {
          handlePegoutError(e);
        }
        if ((e as Error).toString().includes('Quote differences')) {
          diffShown.value = true;
        }
      } finally {
        pegOutFormState.value.send('fill');
      }
    }

    function clearState() {
      clearFlyoverState();
      clearPegoutTx();
      initFlyoverTx(ethersProvider.value);
      initPegoutTx();
      selectedOption.value = '';
      diffShown.value = false;
      showTxErrorDialog.value = false;
      showAddressDialog.value = false;
      loadingQuotes.value = false;
      isWalletAuthorizedToSign.value = true;
    }

    function back():void {
      clearState();
      router.push({ name: 'Home' });
    }

    function enoughLiquidityForThisAmount(amount: SatoshiBig) {
      return liquidityProviders.value.some((provider) => {
        const { liquidityCheckEnabled, pegout: { availableLiquidity } } = provider;
        return liquidityCheckEnabled && availableLiquidity?.gt(amount);
      });
    }

    function getQuotes() {
      loadingQuotes.value = true;
      getPegoutQuotes(account.value)
        .catch((e) => {
          handlePegoutError(e);
          clearQuotes();
        })
        .finally(() => {
          loadingQuotes.value = false;
        });
    }

    const validAmount = ref(false);
    const amount = ref();

    function checkValidAmount(isValidAmount: boolean, amountInformed: string) {
      validAmount.value = isValidAmount;
      if (isValidAmount && amountInformed !== amount.value) {
        amount.value = amountInformed;
      }
    }

    const validEnoughBalance = computed((): boolean => {
      if (selectedQuote.value) {
        // eslint-disable-next-line object-curly-newline
        const { value, gasFee, productFeeAmount, callFee } = selectedQuote.value.quote;
        const amountPlusFees = value
          .plus(gasFee)
          .plus(productFeeAmount)
          .plus(callFee);
        return balance.value.gt(amountPlusFees);
      }
      return false;
    });

    watch([amount, validAmount], async () => {
      if (!validAmount.value) return;
      if (!enoughLiquidityForThisAmount(SatoshiBig.fromWeiBig(amountToTransfer.value))) {
        await clearQuotes();
        return;
      }
      getQuotes();
    });

    const showStep = computed(() => (!loadingQuotes.value && validAmount.value));

    function changeSelectedOption(quoteHash: string) {
      setSelectedQuoteHash(quoteHash);
      selectedOption.value = quoteHash;
    }

    function executeRecaptcha() {
      if (selectedQuoteHash.value) {
        window.grecaptcha.execute();
      } else {
        send();
      }
    }

    async function continueHandler() {
      diffShown.value = false;
      pegOutFormState.value.send('loading');
      try {
        await sendFlyoverTxWithConditionChanged();
        ApiService.registerTx(registerFlyover.value);
        changePage(TxStatusType.FLYOVER_PEGOUT.toLowerCase());
      } catch (e) {
        if (e instanceof ServiceError) {
          handlePegoutError(e);
        }
      } finally {
        pegOutFormState.value.send('fill');
      }
    }

    function clearForError() {
      diffShown.value = false;
      showTxErrorDialog.value = false;
      clearAmount.value = true;
    }

    onBeforeMount(() => {
      if (props.flyoverEnabled) {
        window.onRecaptchaSuccess = send;
      }
    });

    onMounted(() => {
      if (props.flyoverEnabled) {
        appendRecaptcha(flyoverService.value.siteKey);
      }
    });

    watch(account, clearState);

    if (props.flyoverEnabled) {
      getAvailableLiquidity();
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
      quoteDifference,
      showQuoteDiff,
      mdiArrowLeft,
      selectedOption,
      changeSelectedOption,
      mdiArrowRight,
      isFlyoverReady,
      continueHandler,
      flyoverService,
      executeRecaptcha,
      nativeQuote,
      pegoutType: constants.pegoutType,
      isValid,
      flyoverIsEnabled,
      clearForError,
      clearAmount,
      checkValidAmount,
      countdown,
      recaptchanNewTokenTime,
      validEnoughBalance,
    };
  },
});

</script>
