<template>
<v-container fluid class="mt-0">
  <v-col class="container pa-0 exchange-form">
    <v-row class="mx-0">
        <v-col cols="1" class="pa-0 d-flex align-center" style="margin-left: -26px;">
          <v-img position="center left"
                 :src="require('@/assets/exchange/arrow.png')" height="40" contain/>
        </v-col>
        <v-col class="px-0">
         <h1 class="justify-center text-left">
          Send {{environmentContext.getRbtcTicker()}}.
          Get {{environmentContext.getBtcTicker()}}.</h1>
        </v-col>
      </v-row>
    <v-row class="exchange-form mt-2 ma-0 justify-space-between">
      <v-col cols="8" lg="7" class="pa-0" >
        <rsk-wallet-connection
          @switchDeriveButton="switchDeriveButton"/>
        <v-divider color="#C4C4C4"/>
        <rbtc-input-amount :enableButton="!isReadyToSign"/>
        <v-divider color="#C4C4C4"/>
        <div class="form-step py-4">
          <v-row class="ma-0 align-start">
            <v-col cols="auto" class="pl-0">
              <div v-bind:class="[focus ?
              'number-filled' : 'number']">3</div>
            </v-col>
            <v-col class="pl-0 ma-0 pb-0">
              <p v-bind:class="{'boldie': focus}">
                (Optional) Verify your Bitcoin destination address:
              </p>
              <v-row class="ma-0 mt-4 pa-0">
                <v-col v-if="session.btcDerivedAddress" cols="7" class="p-0">
                  <div class="container">
                    <v-row class="mx-0">
                      <span>Address derived</span>
                    </v-row>
                    <v-row class="mx-0 d-flex align-center">
                      <p class="mb-0 account">
                        {{session.btcDerivedAddress}}
                      </p>
                    </v-row>
                  </div>
                </v-col>
                <v-col v-else cols="5" class="pb-0 px-0">
                  <v-row class="derive-button mx-0 d-flex justify-center">
                    <v-btn :disabled="!isReadyToSign ||
                      injectedProvider === appConstants.RLOGIN_LIQUALITY_WALLET"
                      variant="outlined" rounded id="derivation-addr-btn"
                      width="100%" height="38"
                      @click="openAddressDialog" >
                      <span>
                        Get Bitcoin destination address
                      </span>
                    </v-btn>
                  </v-row>
                </v-col>
                <v-container v-if="injectedProvider
                                  && injectedProvider !== appConstants.RLOGIN_METAMASK_WALLET"
                  class="pl-0">
                  <span class="blackish" style="font-size: 14px;">
                    As you are not using MetaMask, you need to follow
                    <a :href=appConstants.RSK_PEGOUT_DOCUMENTATION_URL class="d-inline blackish a"
                        target='_blank'> this documentation</a> to get the destination address.
                  </span>
                </v-container>
              </v-row>
            </v-col>
          </v-row>
        </div>
      </v-col>
      <v-col cols="4" lg="4">
        <tx-summary-fixed
          :summary="pegOutFormSummary"
          :initialExpand="true"
          :type="typeSummary"
          :orientation="orientationSummary"/>
      </v-col>
    </v-row>
    <v-row v-if="showAddressDialog">
      <address-dialog @switchDeriveButton="switchDeriveButton"
       @closeDialog="closeAddressDialog"/>
    </v-row>
    <v-row class="ma-0 mt-8">
      <v-col cols="2" class="d-flex justify-start ma-0 pa-0">
        <v-btn @click="back"
        rounded variant="outlined" color="#000000" width="110"
                :disabled="pegOutFormState.matches(['loading', 'goingHome'])">
          <span>Back</span>
        </v-btn>
      </v-col>
      <v-col cols="10" class="d-flex justify-end ma-0 py-0 pl-0" >
        <v-btn v-if="!pegOutFormState.matches(['loading'])" rounded color="#000000"
                @click="send" id="send-btn"
                :disabled="!isReadyToCreate || pegOutFormState.matches(['goingHome'])">
          <span class="whiteish">Send</span>
          <v-icon class="ml-2" color="#fff" :icon="mdiSendOutline"></v-icon>
        </v-btn>
        <v-progress-circular v-if="pegOutFormState.matches(['loading'])"
                              indeterminate color="#000000" class="mr-10"/>
      </v-col>
    </v-row>
    <v-row class="mx-0 justify-center"
           v-if="pegOutFormState.matches(['loading']) && isLedgerConnected">
      See your ledger device to confirm your transaction.
    </v-row>
  </v-col>
  <template v-if="showTxErrorDialog">
    <tx-error-dialog :showTxErrorDialog="showTxErrorDialog"
                     :errorMessage="txError" @closeErrorDialog="closeTxErrorDialog"/>
  </template>
</v-container>
</template>

<script lang="ts">
import { computed, ref, defineComponent } from 'vue';
import { useRouter } from 'vue-router';
import { mdiSendOutline } from '@mdi/js';
import EnvironmentContextProviderService from '@/common/providers/EnvironmentContextProvider';
import RbtcInputAmount from '@/pegout/components/RbtcInputAmount.vue';
import RskWalletConnection from '@/pegout/components/RskWalletConnection.vue';
import AddressDialog from '@/pegout/components/AddressDialog.vue';
import { TxStatusType } from '@/common/types/store';
import { Machine } from '@/common/utils';
import { TxSummaryOrientation } from '@/common/types/Status';
import * as constants from '@/common/store/constants';
import TxErrorDialog from '@/common/components/exchange/TxErrorDialog.vue';
import {
  NormalizedSummary, PegOutTxState, SatoshiBig, SessionState, WeiBig,
} from '@/common/types';
import TxSummaryFixed from '@/common/components/exchange/TxSummaryFixed.vue';
import { useAction, useGetter, useState } from '@/common/store/helper';

export default defineComponent({
  name: 'PegOutForm',
  components: {
    AddressDialog,
    RbtcInputAmount,
    RskWalletConnection,
    TxSummaryFixed,
    TxErrorDialog,
  },
  setup(_, context) {
    const pegOutFormState = ref<Machine<'loading' | 'goingHome' | 'fill'>>(new Machine('fill'));
    const environmentContext = EnvironmentContextProviderService.getEnvironmentContext();
    const injectedProvider = ref('');
    const appConstants = constants;
    const showAddressDialog = ref(false);
    const focus = ref(false);
    const nextPage = 'Confirmation';
    const typeSummary = TxStatusType.PEGOUT;
    const orientationSummary = TxSummaryOrientation.VERTICAL;
    const showTxErrorDialog = ref(false);
    const txError = ref('');
    const isReadyToSign = ref(false);
    const router = useRouter();
    const session = useState<SessionState>('web3Session');
    const pegOutTxState = useState<PegOutTxState>('pegOutTx');
    const sendTx = useAction('pegOutTx', constants.PEGOUT_TX_SEND);
    const isEnoughBalance = useGetter<boolean>('pegOutTx', constants.PEGOUT_TX_IS_ENOUGH_BALANCE);
    const safeFee = useGetter<WeiBig>('pegOutTx', constants.PEGOUT_TX_GET_SAFE_TX_FEE);
    const estimatedBtcToReceive = useGetter<SatoshiBig>('pegOutTx', constants.PEGOUT_TX_GET_ESTIMATED_BTC_TO_RECEIVE);
    const isLedgerConnected = useGetter<boolean>('web3Session', constants.SESSION_IS_LEDGER_CONNECTED);
    const isReadyToCreate = computed((): boolean => isEnoughBalance.value
        && !!session.value.account);
    const pegOutFormSummary = computed((): NormalizedSummary => ({
      amountFromString: pegOutTxState.value.amountToTransfer.toRBTCTrimmedString(),
      amountReceivedString: estimatedBtcToReceive.value.toBTCTrimmedString(),
      fee: Number(pegOutTxState.value.btcEstimatedFee.toBTCTrimmedString()),
      recipientAddress: session.value.btcDerivedAddress,
      senderAddress: session.value.account,
      gas: Number(safeFee.value.toRBTCTrimmedString()),
    }));
    function closeAddressDialog() {
      showAddressDialog.value = false;
    }
    function back():void {
      router.push({ name: 'Home' });
    }
    function openAddressDialog() {
      showAddressDialog.value = true;
    }
    function switchDeriveButton(): void {
      // eslint-disable-next-line
      // @ts-ignore
      const provider = session.value.rLoginInstance?.providerController.injectedProvider.name;
      injectedProvider.value = provider;
      isReadyToSign.value = !isReadyToSign.value;
    }
    function changePage() {
      context.emit('changePage', nextPage);
    }
    function send() {
      pegOutFormState.value.send('loading');
      sendTx()
        .then(() => {
          changePage();
        })
        .catch((error:Error) => {
          txError.value = error.message;
          showTxErrorDialog.value = true;
        })
        .finally(() => {
          pegOutFormState.value.send('fill');
        });
    }
    function closeTxErrorDialog() {
      showTxErrorDialog.value = false;
    }
    return {
      environmentContext,
      switchDeriveButton,
      isReadyToSign,
      session,
      injectedProvider,
      appConstants,
      openAddressDialog,
      pegOutFormSummary,
      typeSummary,
      orientationSummary,
      showAddressDialog,
      closeAddressDialog,
      back,
      pegOutFormState,
      send,
      isReadyToCreate,
      isLedgerConnected,
      showTxErrorDialog,
      txError,
      closeTxErrorDialog,
      focus,
      mdiSendOutline,
    };
  },
});
</script>
