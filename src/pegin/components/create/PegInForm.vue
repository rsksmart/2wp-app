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
    <btc-input-amount @getPeginQuotes="getQuotes"/>
    <btc-fee-select/>
    <v-row v-if="showOptions && !loadingQuotes">
      <v-col class="mr-3">
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
            @click="createTx"
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
  </v-container>
</template>

<script lang="ts">
import {
  computed, ref, defineComponent, onBeforeMount,
} from 'vue';
import { mdiArrowLeft, mdiArrowRight, mdiSendOutline } from '@mdi/js';
import PegInAccountSelect from '@/pegin/components/create/PegInAccountSelect.vue';
import BtcInputAmount from '@/pegin/components/create/BtcInputAmount.vue';
import PeginOptionCard from '@/pegin/components/create/PeginOptionCard.vue';
import { PegInTxState } from '@/common/types/pegInTx';
import * as constants from '@/common/store/constants';
import { Machine } from '@/common/utils';
import EnvironmentContextProviderService from '@/common/providers/EnvironmentContextProvider';
import { TxStatusType } from '@/common/types/store';
import { TxSummaryOrientation } from '@/common/types/Status';
import {
  Feature, FeatureNames, QuotePegIn2WP, SatoshiBig, SessionState,
} from '@/common/types';
import {
  useAction, useGetter, useState, useStateAttribute,
} from '@/common/store/helper';
import AddressWarningDialog from '@/common/components/exchange/AddressWarningDialog.vue';
import BtcFeeSelect from '@/pegin/components/create/BtcFeeSelect.vue';
import { BridgeService } from '@/common/services/BridgeService';
import { FlyoverService } from '@/common/services';

export default defineComponent({
  name: 'PegInForm',
  components: {
    PegInAccountSelect,
    BtcInputAmount,
    PeginOptionCard,
    AddressWarningDialog,
    BtcFeeSelect,
  },
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

    const account = useStateAttribute<string>('web3Session', 'account');
    const flyoverFeature = useGetter<(name: FeatureNames) => Feature>('web3Session', constants.SESSION_GET_FEATURE);
    const pegInTxState = useState<PegInTxState>('pegInTx');
    const refundAddress = useGetter<string>('pegInTx', constants.PEGIN_TX_GET_REFUND_ADDRESS);
    const enoughBalanceSelectedFee = useGetter<boolean>('pegInTx', constants.PEGIN_TX_GET_ENOUGH_FEE_VALUE);
    const getPeginQuotes = useAction('flyoverPegin', constants.FLYOVER_PEGIN_GET_QUOTES);
    const setSelectedQuote = useAction('flyoverPegin', constants.FLYOVER_PEGIN_ADD_SELECTED_QUOTE);
    const session = useState<SessionState>('web3Session');
    const quotes = useStateAttribute<Record<number, QuotePegIn2WP[]>>('flyoverPegin', 'quotes');
    const setPeginType = useAction('pegInTx', constants.PEGIN_TX_ADD_PEGIN_TYPE);
    const selectedQuoteHash = useStateAttribute<string>('flyoverPegin', 'selectedQuoteHash');
    const flyoverService = useStateAttribute<FlyoverService>('flyoverPegin', 'flyoverService');

    const isReadyToCreate = computed((): boolean => pegInTxState.value.isValidAmountToTransfer
        && !pegInTxState.value.loadingFee
        && !!pegInTxState.value.rskAddressSelected
        && pegInTxState.value.rskAddressSelected !== '0x'
        && enoughBalanceSelectedFee.value);

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
      context.emit('back');
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
        const acceptedQuote = await flyoverService.value.acceptPeginQuote(selectedQuoteHash.value);
        context.emit('createTx', {
          amountToTransferInSatoshi: selectedQuote.value?.quote.value
            .plus(selectedQuote.value?.quote.productFeeAmount)
            .plus(selectedQuote.value?.quote.callFee)
            .plus(new SatoshiBig(selectedQuote.value?.quote.gasFee.toRBTCString(), 'btc')),
          refundAddress: '',
          recipient: '',
          feeLevel: pegInTxState.value.selectedFee,
          accountType: pegInTxState.value.selectedAccount,
          btcRecipient: acceptedQuote.bitcoinDepositAddressHash,
          peginType: constants.peginType.FLYOVER,
        });
      }
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
        rootstockRecipientAddress: session.value.account,
        bitcoinRefundAddress: refundAddress.value,
      })
        .then(() => {
          loadingQuotes.value = false;
          showOptions.value = true;
        });
    }

    onBeforeMount(() => {
      const feature = flyoverFeature.value(FeatureNames.FLYOVER_PEG_IN);
      flyoverEnabled.value = feature?.value === 'enabled';
    });

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
    };
  },
});
</script>
