<template>
  <v-container fluid class="pa-0">
    <v-row>
      <v-btn variant="text"
        :prepend-icon="mdiArrowLeft"
        @click="back"
        :disabled="pegInFormState.matches(['loading', 'goingHome'])">
        Go Back
      </v-btn>
    </v-row>
    <v-row>
      <v-col cols="6">
        <peg-in-account-select />
      </v-col>
    </v-row>
    <btc-input-amount @getPeginQuotes="getQuotes" @peginError="handleError"/>
    <btc-fee-select/>
    <v-row v-if="showOptions && !loadingQuotes">
      <v-col cols="6" class="mr-3">
        <pegin-option-card
          :option-type="peginType.POWPEG"
          @selected-option="changeSelectedOption"
          :selected="selected === peginType.POWPEG"
        />
      </v-col>
      <v-col v-for="(quote, index) in peginQuotes" :key="index">
        <pegin-option-card
          :option-type="peginType.FLYOVER"
          @selected-option="changeSelectedOption"
          :selected="selected === peginType.FLYOVER"
          :quote="quote"
        />
      </v-col>
    </v-row>
    <v-row v-else-if="loadingQuotes" class="py-8 justify-center">
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
            <v-btn-rsk v-if="!pegInFormState.matches(['loading'])"
            @click="callRecaptcha"
            :disabled="!isReadyToCreate || pegInFormState.matches(['goingHome'])"
            >
            <template #append>
              <v-icon :icon="mdiArrowRight" />
            </template>
            Continue to Summary
          </v-btn-rsk>
          <v-progress-circular v-else indeterminate />
        </v-col>
      </v-row>
      <v-row>
        <address-warning-dialog :address="pegInTxState.rskAddressSelected"
                                :show-dialog="showWarningMessage"
                                @continue="createTx"
                                @cancel="showWarningMessage = false"
        />
      </v-row>
      <div id="recaptcha" class="g-recaptcha"
          :data-sitekey="flyoverService.siteKey"
          data-callback="onRecaptchaSuccess"
          data-action="submit"
          data-size="invisible"></div>
  </v-container>
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
import PegInAccountSelect from '@/pegin/components/create/PegInAccountSelect.vue';
import BtcInputAmount from '@/pegin/components/create/BtcInputAmount.vue';
import PeginOptionCard from '@/pegin/components/create/PeginOptionCard.vue';
import { PegInTxState } from '@/common/types/pegInTx';
import * as constants from '@/common/store/constants';
import { appendRecaptcha, Machine, ServiceError } from '@/common/utils';
import EnvironmentContextProviderService from '@/common/providers/EnvironmentContextProvider';
import { TxStatusType } from '@/common/types/store';
import { TxSummaryOrientation } from '@/common/types/Status';
import {
  Feature, FeatureNames, FlyoverPeginState, QuotePegIn2WP, SatoshiBig,
} from '@/common/types';
import {
  useAction, useGetter, useState, useStateAttribute,
} from '@/common/store/helper';
import AddressWarningDialog from '@/common/components/exchange/AddressWarningDialog.vue';
import BtcFeeSelect from '@/pegin/components/create/BtcFeeSelect.vue';
import { BridgeService } from '@/common/services/BridgeService';
import { FlyoverService } from '@/common/services';
import FullTxErrorDialog from '@/common/components/exchange/FullTxErrorDialog.vue';

export default defineComponent({
  name: 'PegInForm',
  components: {
    PegInAccountSelect,
    BtcInputAmount,
    PeginOptionCard,
    AddressWarningDialog,
    BtcFeeSelect,
    FullTxErrorDialog,
  },
  emits: ['back', 'createTx'],
  setup(_, context) {
    const pegInFormState = ref<Machine<'loading' | 'goingHome' | 'fill'>>(new Machine('fill'));
    const showWarningMessage = ref(false);
    const environmentContext = EnvironmentContextProviderService.getEnvironmentContext();
    const typeSummary = TxStatusType.PEGIN;
    const orientationSummary = TxSummaryOrientation.VERTICAL;
    const flyoverEnabled = ref(true);
    const showOptions = ref(false);
    const loadingQuotes = ref(false);
    const selected = ref<constants.peginType>();
    const selectedQuote = ref<QuotePegIn2WP>();
    const showErrorDialog = ref(false);
    const txError = ref<ServiceError>(new ServiceError('', '', '', ''));

    const account = useStateAttribute<string>('web3Session', 'account');
    const flyoverFeature = useGetter<(name: FeatureNames) => Feature>('web3Session', constants.SESSION_GET_FEATURE);
    const pegInTxState = useState<PegInTxState>('pegInTx');
    const flyoverPeginState = useState<FlyoverPeginState>('flyoverPegin');
    const refundAddress = useGetter<string>('pegInTx', constants.PEGIN_TX_GET_REFUND_ADDRESS);
    const enoughBalanceSelectedFee = useGetter<boolean>('pegInTx', constants.PEGIN_TX_GET_ENOUGH_FEE_VALUE);
    const getPeginQuotes = useAction('flyoverPegin', constants.FLYOVER_PEGIN_GET_QUOTES);
    const setSelectedQuote = useAction('flyoverPegin', constants.FLYOVER_PEGIN_ADD_SELECTED_QUOTE);
    const clearQuotes = useAction('flyoverPegin', constants.FLYOVER_PEGIN_CLEAR_QUOTES);
    const quotes = useStateAttribute<Record<number, QuotePegIn2WP[]>>('flyoverPegin', 'quotes');
    const setPeginType = useAction('pegInTx', constants.PEGIN_TX_ADD_PEGIN_TYPE);
    const selectedQuoteHash = useStateAttribute<string>('flyoverPegin', 'selectedQuoteHash');
    const flyoverService = useStateAttribute<FlyoverService>('flyoverPegin', 'flyoverService');
    const selectedFee = useGetter<SatoshiBig>('pegInTx', constants.PEGIN_TX_GET_SAFE_TX_FEE);
    const selectedAccountBalance = useGetter<SatoshiBig>('pegInTx', constants.PEGIN_TX_GET_SELECTED_BALANCE);

    const enoughAmountFlyover = computed(() => {
      const quote = selectedQuote.value?.quote;
      if (!quote) {
        return false;
      }
      const fullAmount: SatoshiBig = quote?.value
        .plus(quote.productFeeAmount)
        .plus(quote.callFee)
        .plus(SatoshiBig.fromWeiBig(quote.gasFee))
        .plus(selectedFee.value);

      return selectedAccountBalance.value?.gte(fullAmount);
    });

    const isReadyToCreate = computed((): boolean => {
      if (selected.value === constants.peginType.POWPEG) {
        return pegInTxState.value.isValidAmountToTransfer
        && !pegInTxState.value.loadingFee
        && !!pegInTxState.value.rskAddressSelected
        && pegInTxState.value.rskAddressSelected !== '0x'
        && enoughBalanceSelectedFee.value;
      }

      if (selected.value === constants.peginType.FLYOVER) {
        return enoughAmountFlyover.value
          && !!flyoverPeginState.value.selectedQuoteHash
          && !!flyoverPeginState.value.rootstockRecipientAddress
          && flyoverPeginState.value.rootstockRecipientAddress !== '0x';
      }

      return false;
    });

    const peginQuotes = computed(() => {
      if (!flyoverEnabled.value) {
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
      showWarningMessage.value = false;
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
        flyoverService.value.acceptPeginQuote(selectedQuoteHash.value)
          .then((acceptedQuote) => {
            context.emit('createTx', {
              amountToTransferInSatoshi: selectedQuote.value?.quote.value
                .plus(selectedQuote.value?.quote.productFeeAmount)
                .plus(selectedQuote.value?.quote.callFee)
                .plus(SatoshiBig.fromWeiBig(selectedQuote.value?.quote.gasFee)),
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

    async function changeSelectedOption(selectedType: constants.peginType, quote?: QuotePegIn2WP) {
      selected.value = selectedType;
      await setPeginType(selected.value);
      selectedQuote.value = quote;
      setSelectedQuote(quote?.quoteHash);
    }

    async function getQuotes() {
      loadingQuotes.value = true;
      getPeginQuotes({
        rootstockRecipientAddress: account.value,
        bitcoinRefundAddress: refundAddress.value,
      })
        .then(() => {
          loadingQuotes.value = false;
          showOptions.value = true;
        });
    }

    function callRecaptcha() {
      window.grecaptcha.execute();
    }

    onBeforeMount(() => {
      window.onRecaptchaSuccess = createTx;
      const feature = flyoverFeature.value(FeatureNames.FLYOVER_PEG_IN);
      flyoverEnabled.value = feature?.value === 'enabled';
    });

    onMounted(() => {
      appendRecaptcha(flyoverService.value.siteKey);
    });

    watch(account, getQuotes);

    if (flyoverEnabled.value && peginQuotes.value.length > 0) {
      showOptions.value = true;
    }

    return {
      pegInFormState,
      showWarningMessage,
      environmentContext,
      typeSummary,
      orientationSummary,
      back,
      isReadyToCreate,
      pegInTxState,
      createTx,
      mdiSendOutline,
      mdiArrowLeft,
      mdiArrowRight,
      changeSelectedOption,
      selected,
      flyoverEnabled,
      showOptions,
      loadingQuotes,
      getQuotes,
      peginQuotes,
      peginType: constants.peginType,
      showErrorDialog,
      txError,
      handleError,
      flyoverService,
      callRecaptcha,
    };
  },
});
</script>
