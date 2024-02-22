<template>
  <v-container fluid class="exchange container max-width mx-6">
    <div class="transactions">
      <v-row class="mx-0 d-flex justify-center">
        <v-col cols="10" lg="8" xl="6" class="d-flex justify-center">
          <h1 class="text-center">
            Your {{environmentContext.getBtcTicker()}} is on its way!
          </h1>
        </v-col>
      </v-row>
      <v-row v-if="isFlyover()" class="mx-0 my-8 flex-column text-center">
        <p>
          Between 5 and 10 minutes you will receive your {{environmentContext.getBtcTicker()}}
          in your address
        </p>
        <p class="mt-4">
          <a
            class="d-inline blackish"
            :href="getBtcAddressExplorerUrl(successPegOutSummary.recipientAddress)"
            target="_blank"
            rel="noopener"
            >
            {{ successPegOutSummary.recipientAddress }}
          </a>
        </p>
      </v-row>
      <v-row v-else class="mx-0 my-8 flex-column text-center">
        <p>
          You can follow the conversion from the status page.
        </p>
        <p class="mt-4">
          Click
          <a
            class="d-inline blackish"
            :href=appConstants.DERIVE_BTC_ADDRESS_DOCUMENTATION_URL
            target="_blank" >here</a>
          to know how to get your funds at the end of the peg-out process.
        </p>
      </v-row>
      <v-row class="mx-0 my-8">
        <tx-summary-fixed
          :summary="successPegOutSummary"
          :initialExpand="true"
          :type="typeSummary"
          :orientation="orientationSummary"/>
      </v-row>
      <v-row class="ma-0">
        <v-col cols="2" class="d-flex justify-start ma-0 py-0" offset="10">
        </v-col>
        <v-col cols="12" class="d-flex justify-center ma-0 py-0">
          <v-btn v-if="isFlyover()" rounded variant="outlined" color="#000000" @click="goHome">
            <span>Go home</span>
          </v-btn>
          <v-btn v-else rounded class="big_button" color="#000000" @click="goToStatus">
            <span class="whiteish">Go to status page</span>
          </v-btn>
        </v-col>
      </v-row>
    </div>
  </v-container>
  </template>

<script lang="ts">
import {
  computed, defineComponent, onBeforeMount, onUnmounted, ref,
} from 'vue';
import { useRouter } from 'vue-router';
import { addTag, getBtcAddressExplorerUrl } from '@/common/utils';
import { TxStatusType } from '@/common/types/store';
import { TxSummaryOrientation } from '@/common/types/Status';
import {
  FlyoverPegoutState,
  NormalizedSummary, PegOutTxState, QuotePegOut2WP, SatoshiBig,
} from '@/common/types';
import TxSummaryFixed from '@/common/components/exchange/TxSummaryFixed.vue';
import * as constants from '@/common/store/constants';
import {
  useAction, useGetter, useState, useStateAttribute,
} from '@/common/store/helper';
import EnvironmentContextProviderService from '@/common/providers/EnvironmentContextProvider';

export default defineComponent({
  name: 'SuccessPegout',
  components: {
    TxSummaryFixed,
  },
  props: {
    type: {
      type: String,
      required: true,
    },
  },
  setup(props) {
    const appConstants = constants;
    const injectedProvider = ref('');
    const typeSummary = TxStatusType.PEGOUT;
    const orientationSummary = TxSummaryOrientation.HORIZONTAL;
    const router = useRouter();
    const pegoutTxState = useState<PegOutTxState>('pegOutTx');
    const flyoverPegoutState = useState<FlyoverPegoutState>('flyoverPegout');
    const btcDerivedAddress = useStateAttribute<string>('web3Session', 'btcDerivedAddress');
    const account = useStateAttribute<string>('web3Session', 'account');
    const clearStatus = useAction('status', constants.STATUS_CLEAR);
    const clearFlyoverState = useAction('flyoverPegout', constants.FLYOVER_PEGOUT_CLEAR_STATE);
    const estimatedBtcToReceive = useGetter<SatoshiBig>('pegOutTx', constants.PEGOUT_TX_GET_ESTIMATED_BTC_TO_RECEIVE);
    const selectedQuote = useGetter<QuotePegOut2WP>('flyoverPegout', constants.FLYOVER_PEGOUT_GET_SELECTED_QUOTE);
    const isLedgerConnected = useGetter<boolean>('web3Session', constants.SESSION_IS_LEDGER_CONNECTED);
    const isTrezorConnected = useGetter<boolean>('web3Session', constants.SESSION_IS_TREZOR_CONNECTED);
    const isMetamaskConnected = useGetter<boolean>('web3Session', constants.SESSION_IS_METAMASK_CONNECTED);
    const environmentContext = EnvironmentContextProviderService.getEnvironmentContext();

    function isFlyover(): boolean {
      return props.type === 'flyover';
    }

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
      if (injectedProvider.value === appConstants.RLOGIN_LIQUALITY_WALLET) {
        return constants.WALLET_NAMES.LIQUALITY;
      }
      return '';
    });

    const successPegOutSummary = computed((): NormalizedSummary => {
      let summary: NormalizedSummary;
      if (isFlyover()) {
        const amountToTransfer = selectedQuote.value.quote.value
          .plus(selectedQuote.value.quote.callFee)
          .plus(selectedQuote.value.quote.gasFee)
          .plus(selectedQuote.value.quote.productFeeAmount);
        summary = {
          amountFromString: amountToTransfer.toRBTCTrimmedString(),
          amountReceivedString: selectedQuote.value.quote.value.toRBTCTrimmedString(),
          fee: Number(selectedQuote.value.quote.callFee
            .plus(selectedQuote.value.quote.productFeeAmount).toRBTCString()),
          recipientAddress: flyoverPegoutState.value.btcRecipientAddress,
          senderAddress: account.value,
          txId: flyoverPegoutState.value.txHash,
          gas: selectedQuote.value.quote.gasFee.toNumber(),
        };
      } else {
        summary = {
          amountFromString: pegoutTxState.value.amountToTransfer.toRBTCTrimmedString(),
          amountReceivedString: estimatedBtcToReceive.value.toBTCTrimmedString(),
          estimatedFee: Number(pegoutTxState.value.btcEstimatedFee.toBTCTrimmedString()),
          recipientAddress: btcDerivedAddress.value,
          senderAddress: account.value,
          txId: pegoutTxState.value.txHash,
          gas: Number(pegoutTxState.value.efectivePaidFee?.toRBTCTrimmedString()),
        };
      }
      return summary;
    });

    function goToStatus() {
      clearStatus();
      router.push({
        name: 'Status',
        params: { txId: String(pegoutTxState.value.txHash) },
      });
    }

    function goHome() {
      clearStatus();
      router.push({ name: 'Home' });
    }

    function appendClarityScript(): void {
      addTag(constants.OPERATION_TYPE, TxStatusType.PEGOUT);
      addTag(constants.WALLET_NAME, `${currentWallet.value}`);
      addTag(constants.OPERATION_AMOUNT, `${pegoutTxState.value.amountToTransfer.toRBTCTrimmedString()}`);
    }

    onBeforeMount(appendClarityScript);
    onUnmounted(() => {
      if (isFlyover()) {
        clearFlyoverState();
      }
    });

    return {
      environmentContext,
      appConstants,
      successPegOutSummary,
      typeSummary,
      orientationSummary,
      goToStatus,
      isFlyover,
      goHome,
      getBtcAddressExplorerUrl,
    };
  },
});
</script>
