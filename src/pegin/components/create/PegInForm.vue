<template>
  <v-container fluid class="pa-0 d-flex flex-column ga-6">
    <v-row no-gutters>
      <v-btn variant="text"
        class="px-0"
        :prepend-icon="mdiArrowLeft"
        @click="back"
        :disabled="pegInFormState.matches(['loading', 'goingHome'])">
        Go Back
      </v-btn>
    </v-row>
    <v-row no-gutters class="ga-4 ga-lg-8">
      <btc-input @valid-amount="checkValidAmount" />
      <rsk-destination-address @valid-address="checkValidAddress" :is-amount-filled="validAmount"/>
    </v-row>
    <btc-fee-select/>
    <div v-if="showOptions" class="d-flex flex-column ga-2">
      <span class="font-weight-bold">Select mode</span>
      <v-row no-gutters class="ga-4 ga-lg-8">
        <v-col v-if="!flyoverIsEnabled || peginQuotes.length === 0">
          <pegin-option-card :option-type="peginType.FLYOVER" flyover-not-available>
            <template v-slot>
              <h4 v-if="countdown === recaptchanNewTokenTime">
                <span class="text-orange">Fast Mode</span> is unavailable at this time.
              </h4>
              <h4 v-else>
                Fast mode will be <br> available in
                <span class="text-orange">{{ countdown }} seconds.</span>
              </h4>
            </template>
          </pegin-option-card>
        </v-col>
        <v-col v-else v-for="(quote, index) in peginQuotes" :key="index">
          <pegin-option-card
            :option-type="peginType.FLYOVER"
            @selected-option="changeSelectedOption"
            :selected="selected === peginType.FLYOVER"
            :quote="quote"
          />
        </v-col>
        <v-col>
          <pegin-option-card
            :option-type="peginType.POWPEG"
            @selected-option="changeSelectedOption"
            :selected="selected === peginType.POWPEG"
          />
        </v-col>
      </v-row>
    </div>
    <v-row no-gutters v-else-if="loadingQuotes" class="justify-center">
      <v-progress-circular
        :size="250"
        :width="18"
        color="warning"
        indeterminate>
        Searching Options...
      </v-progress-circular>
    </v-row>
    <v-btn-rsk v-if="!pegInFormState.matches(['loading'])"
      @click="sendTx"
      :disabled="!isReadyToCreate || pegInFormState.matches(['goingHome'])"
      class="align-self-end text-body-1"
      >
      <template #append>
        <v-icon :icon="mdiArrowRight" />
      </template>
        Send
    </v-btn-rsk>
    <v-progress-circular class="align-self-end" v-else indeterminate />
  </v-container>
  <div id="recaptcha" class="g-recaptcha"
      :data-sitekey="flyoverService.siteKey"
      data-callback="onRecaptchaSuccess"
      data-action="submit"
      data-size="invisible"></div>
  <template v-if="showErrorDialog">
    <full-tx-error-dialog
    :showTxErrorDialog="showErrorDialog"
    :error="txError"
    @closeErrorDialog="showErrorDialog = false"
    />
  </template>
</template>

<script lang="ts">
import {
  computed, ref, defineComponent, onBeforeMount, watch, onMounted,
} from 'vue';
import { mdiArrowLeft, mdiArrowRight, mdiSendOutline } from '@mdi/js';
import BtcInput from '@/pegin/components/create/BtcInput.vue';
import PeginOptionCard from '@/pegin/components/create/PeginOptionCard.vue';
import { PegInTxState } from '@/common/types/pegInTx';
import * as constants from '@/common/store/constants';
import {
  appendRecaptcha, Machine, ServiceError,
} from '@/common/utils';
import EnvironmentContextProviderService from '@/common/providers/EnvironmentContextProvider';
import {
  FlyoverPeginState, LiquidityProvider2WP, PeginQuote, QuotePegIn2WP, SatoshiBig, WeiBig,
} from '@/common/types';
import {
  useAction, useGetter, useState, useStateAttribute,
} from '@/common/store/helper';
import BtcFeeSelect from '@/pegin/components/create/BtcFeeSelect.vue';
import { BridgeService } from '@/common/services/BridgeService';
import { FlyoverService } from '@/common/services';
import FullTxErrorDialog from '@/common/components/exchange/FullTxErrorDialog.vue';
import RskDestinationAddress from '@/pegin/components/create/RskDestinationAddress.vue';
import { AcceptedQuote } from '@rsksmart/flyover-sdk';
import { EnvironmentAccessorService } from '@/common/services/enviroment-accessor.service';

export default defineComponent({
  name: 'PegInForm',
  props: {
    isFlyoverAvailable: {
      type: Boolean,
      required: true,
    },
  },
  components: {
    BtcInput,
    RskDestinationAddress,
    PeginOptionCard,
    BtcFeeSelect,
    FullTxErrorDialog,
  },
  emits: ['back', 'createTx'],
  setup(props, context) {
    const pegInFormState = ref<Machine<'loading' | 'goingHome' | 'fill'>>(new Machine('fill'));
    const environmentContext = EnvironmentContextProviderService.getEnvironmentContext();
    const loadingQuotes = ref(false);
    const selected = ref<constants.peginType | null>(null);
    const selectedQuote = ref<PeginQuote>();
    const showErrorDialog = ref(false);
    const txError = ref<ServiceError>(new ServiceError('', '', '', ''));
    const account = useStateAttribute<string>('web3Session', 'account');
    const pegInTxState = useState<PegInTxState>('pegInTx');
    const flyoverPeginState = useState<FlyoverPeginState>('flyoverPegin');
    const refundAddress = useGetter<string>('pegInTx', constants.PEGIN_TX_GET_REFUND_ADDRESS);
    const enoughBalanceSelectedFee = useGetter<boolean>('pegInTx', constants.PEGIN_TX_GET_ENOUGH_FEE_VALUE);
    const isEnoughBalance = useGetter<boolean>('pegInTx', constants.PEGIN_TX_IS_ENOUGH_BALANCE);
    const getPeginQuotes = useAction('flyoverPegin', constants.FLYOVER_PEGIN_GET_QUOTES);
    const setSelectedQuote = useAction('flyoverPegin', constants.FLYOVER_PEGIN_ADD_SELECTED_QUOTE);
    const clearQuotes = useAction('flyoverPegin', constants.FLYOVER_PEGIN_CLEAR_QUOTES);
    const acceptQuote = useAction<AcceptedQuote>('flyoverPegin', constants.FLYOVER_PEGIN_ACCEPT_QUOTE);
    const getAvailableLiquidity = useAction('flyoverPegin', constants.FLYOVER_PEGIN_GET_AVAILABLE_LIQUIDITY);
    const liquidityProviders = useStateAttribute<LiquidityProvider2WP[]>('flyoverPegin', 'liquidityProviders');
    const quotes = useStateAttribute<Record<number, QuotePegIn2WP[]>>('flyoverPegin', 'quotes');
    const setPeginType = useAction('pegInTx', constants.PEGIN_TX_ADD_PEGIN_TYPE);
    const flyoverService = useStateAttribute<FlyoverService>('flyoverPegin', 'flyoverService');
    const selectedFee = useGetter<SatoshiBig>('pegInTx', constants.PEGIN_TX_GET_SAFE_TX_FEE);
    const selectedAccountBalance = useGetter<SatoshiBig>('pegInTx', constants.PEGIN_TX_GET_SELECTED_BALANCE);
    const loadingFee = useStateAttribute<boolean>('pegInTx', 'loadingFee');
    const startCountdown = useAction('web3Session', constants.SESSION_COUNTDOWN_GRECAPTCHA_TIME);
    const countdown = useStateAttribute<number>('web3Session', 'grecaptchaCountdown');
    const recaptchanNewTokenTime = EnvironmentAccessorService.getEnvironmentVariables()
      .grecaptchaTime;
    const getFeePerByte = useAction('pegInTx', constants.PEGIN_TX_GET_FEE_PER_BYTE);

    const enoughAmountFlyover = computed(() => {
      if (!selectedQuote.value) {
        return false;
      }
      const fullAmount: SatoshiBig = selectedQuote.value.getTotalTxAmount(selectedFee.value);
      return selectedAccountBalance.value?.gte(fullAmount);
    });

    const sendingPegin = computed(():boolean => pegInFormState.value.matches(['loading']));

    const peginQuotes = computed(() => {
      if (!props.isFlyoverAvailable) {
        return [];
      }
      const quoteList: QuotePegIn2WP[] = [];
      Object.values(quotes.value).forEach((providerQuotes) => {
        providerQuotes.forEach((quote) => {
          quoteList.push(quote);
        });
      });
      return quoteList;
    });

    const flyoverIsEnabled = computed(() => {
      if (props.isFlyoverAvailable) {
        if (sendingPegin.value) return true;
        return countdown.value === recaptchanNewTokenTime;
      }
      return false;
    });

    function back() {
      pegInFormState.value.send('loading');
      clearQuotes();
      context.emit('back');
    }

    function handleError(error: Error) {
      if (error instanceof ServiceError) {
        txError.value = error;
        showErrorDialog.value = true;
      }
    }

    async function createTx() {
      pegInFormState.value.send('loading');
      const bridgeService = new BridgeService();
      if (selected.value === constants.peginType.POWPEG) {
        context.emit('createTx', {
          amountToTransferInSatoshi: pegInTxState.value.amountToTransfer,
          refundAddress: refundAddress.value,
          recipient: pegInTxState.value.rskAddressSelected || account.value,
          feeLevel: pegInTxState.value.selectedFee,
          accountType: pegInTxState.value.selectedAccount,
          btcRecipient: await bridgeService.getFederationAddress(),
          peginType: constants.peginType.POWPEG,
        });
      } else {
        startCountdown();
        acceptQuote()
          .then((acceptedQuote) => {
            context.emit('createTx', {
              amountToTransferInSatoshi: selectedQuote.value?.valueToTransfer,
              refundAddress: '',
              recipient: '',
              feeLevel: pegInTxState.value.selectedFee,
              accountType: pegInTxState.value.selectedAccount,
              btcRecipient: acceptedQuote.bitcoinDepositAddressHash,
              peginType: constants.peginType.FLYOVER,
            });
          }).catch(handleError);
      }
      pegInFormState.value.send('fill');
    }

    async function changeSelectedOption(
      selectedType: constants.peginType | null,
      quote?: PeginQuote,
    ) {
      selected.value = selectedType;
      await setPeginType(selected.value);
      selectedQuote.value = quote;
      setSelectedQuote(quote?.quoteHash);
    }

    async function getQuotes() {
      loadingQuotes.value = true;
      getPeginQuotes({
        rootstockRecipientAddress: flyoverPeginState.value.rootstockRecipientAddress,
      })
        .finally(() => {
          loadingQuotes.value = false;
        });
    }

    function enoughLiquidityForThisAmount(amount: WeiBig) {
      return liquidityProviders.value.some((provider) => {
        const { liquidityCheckEnabled, pegin: { availableLiquidity } } = provider;
        return liquidityCheckEnabled && availableLiquidity?.gt(amount);
      });
    }

    const validAmount = ref(false);
    const amount = ref();
    const validAddress = ref(Boolean(account.value));
    const address = ref();

    const showOptions = computed(() => !loadingQuotes.value
    && !loadingFee.value && validAddress.value && validAmount.value);

    function checkValidAddress(isValid: boolean, addressInformed: string) {
      validAddress.value = isValid;
      if (isValid && addressInformed !== address.value) {
        address.value = addressInformed;
      }
    }

    function checkValidAmount(isValid: boolean, amountInformed: string) {
      validAmount.value = isValid;
      if (isValid && amountInformed !== amount.value) {
        amount.value = amountInformed;
      }
    }

    watch([amount, validAmount, address, validAddress], async () => {
      if (!validAmount.value || !validAddress.value) {
        return;
      }
      if (!enoughLiquidityForThisAmount(new WeiBig(amount.value, 'rbtc'))) {
        await clearQuotes();
        return;
      }
      await changeSelectedOption(null);
      await getQuotes();
    });

    const isReadyToCreate = computed((): boolean => {
      if (!showOptions.value) {
        return false;
      }

      if (selected.value === constants.peginType.POWPEG) {
        return isEnoughBalance.value
        && !pegInTxState.value.loadingFee
        && !!pegInTxState.value.rskAddressSelected
        && pegInTxState.value.rskAddressSelected !== '0x'
        && enoughBalanceSelectedFee.value;
      }

      if (selected.value === constants.peginType.FLYOVER) {
        return enoughAmountFlyover.value
          && !!flyoverPeginState.value.selectedQuoteHash
          && !!flyoverPeginState.value.rootstockRecipientAddress
          && flyoverPeginState.value.rootstockRecipientAddress !== '0x'
          && countdown.value === recaptchanNewTokenTime;
      }

      return false;
    });

    function sendTx() {
      if (props.isFlyoverAvailable && selected.value === constants.peginType.FLYOVER) {
        window.grecaptcha.execute();
      } else {
        createTx();
      }
    }

    onBeforeMount(() => {
      if (props.isFlyoverAvailable) {
        window.onRecaptchaSuccess = createTx;
      }
    });

    onMounted(() => {
      if (props.isFlyoverAvailable) {
        appendRecaptcha(flyoverService.value.siteKey);
      }
    });

    if (props.isFlyoverAvailable) {
      getAvailableLiquidity();
    }

    getFeePerByte();

    return {
      pegInFormState,
      environmentContext,
      back,
      isReadyToCreate,
      pegInTxState,
      createTx,
      mdiSendOutline,
      mdiArrowLeft,
      mdiArrowRight,
      changeSelectedOption,
      selected,
      showOptions,
      loadingQuotes,
      getQuotes,
      peginQuotes,
      peginType: constants.peginType,
      showErrorDialog,
      txError,
      handleError,
      flyoverService,
      checkValidAmount,
      checkValidAddress,
      validAmount,
      validAddress,
      sendTx,
      flyoverIsEnabled,
      countdown,
      recaptchanNewTokenTime,
    };
  },
});
</script>
