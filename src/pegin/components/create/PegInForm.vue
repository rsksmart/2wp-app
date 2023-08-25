<template>
  <v-container fluid class="pa-0">
    <v-col class="exchange-form pa-0 ma-0">
      <v-row class="mx-0">
        <v-col cols="1" class="pa-0 d-flex align-center" style="margin-left: -26px;">
          <v-img position="center left"
                 :src="require('@/assets/exchange/arrow.png')" height="40" contain/>
        </v-col>
        <v-col class="px-0">
         <h1 class="justify-center text-left">Send {{environmentContext.getBtcTicker()}}.
            Get {{environmentContext.getRbtcTicker()}}.</h1>
        </v-col>
      </v-row>
      <v-row class="mx-0 mt-6 justify-space-between">
        <v-col id="options-col" cols="8" lg="7" class="pa-0">
          <peg-in-account-select/>
          <v-divider />
          <btc-input-amount/>
          <v-divider />
          <rsk-address-input @state="setRskAddressState"/>
          <v-divider />
          <btc-fee-select/>
        </v-col>
        <v-col id="summary-col" cols="4" lg="4">
          <tx-summary-fixed
            :summary="pegInFormSummary"
            :initialExpand="true"
            :type="typeSummary"
            :orientation="orientationSummary"/>
        </v-col>
      </v-row>
      <v-row class="mx-0 mt-12">
        <v-col cols="2" class="d-flex justify-start ma-0 pa-0">
          <v-btn rounded variant="outlined" color="#000000" width="110" @click="back"
                 :disabled="pegInFormState.matches(['loading', 'goingHome'])">
            <span>Back</span>
          </v-btn>
        </v-col>
        <v-col cols="10" class="d-flex justify-end ma-0 py-0 pl-0">
          <v-btn v-if="!pegInFormState.matches(['loading'])" rounded
                  variant="flat"
                  color="black"
                 @click="sendTx"
                 :disabled="!isReadyToCreate || pegInFormState.matches(['goingHome'])"
                 :append-icon="mdiSendOutline"
                 >
            <template v-slot:append>
              <v-icon color="white"></v-icon>
            </template>
            <span class="whiteish">Continue</span>
          </v-btn>
          <v-progress-circular v-if="pegInFormState.matches(['loading'])"
                               indeterminate color="#000000" class="mr-10"/>
        </v-col>
      </v-row>
      <v-row>
        <address-warning-dialog :address="pegInTxState.rskAddressSelected"
                                :show-dialog="showWarningMessage"
                                @continue="createTx"
                                @cancel="showWarningMessage = false"
        />
      </v-row>
    </v-col>
  </v-container>
</template>

<script lang="ts">
import { computed, ref, defineComponent } from 'vue';
import { mdiSendOutline } from '@mdi/js';
import PegInAccountSelect from '@/pegin/components/create/PegInAccountSelect.vue';
import BtcInputAmount from '@/pegin/components/create/BtcInputAmount.vue';
import RskAddressInput from '@/pegin/components/create/RskAddressInput.vue';
import BtcFeeSelect from '@/pegin/components/create/BtcFeeSelect.vue';
import { PegInTxState } from '@/common/types/pegInTx';
import * as constants from '@/common/store/constants';
import { Machine } from '@/common/utils';
import SatoshiBig from '@/common/types/SatoshiBig';
import EnvironmentContextProviderService from '@/common/providers/EnvironmentContextProvider';
import { TxStatusType } from '@/common/types/store';
import { TxSummaryOrientation } from '@/common/types/Status';
import TxSummaryFixed from '@/common/components/exchange/TxSummaryFixed.vue';
import { NormalizedSummary } from '@/common/types';
import { useGetter, useState } from '@/common/store/helper';
import AddressWarningDialog from '@/common/components/exchange/AddressWarningDialog.vue';

export default defineComponent({
  name: 'PegInForm',
  components: {
    PegInAccountSelect,
    BtcInputAmount,
    RskAddressInput,
    BtcFeeSelect,
    TxSummaryFixed,
    AddressWarningDialog,
  },
  setup(_, context) {
    const pegInFormState = ref<Machine<'loading' | 'goingHome' | 'fill'>>(new Machine('fill'));
    const showWarningMessage = ref(false);
    const rskAddressState = ref('invalid');
    const environmentContext = EnvironmentContextProviderService.getEnvironmentContext();
    const typeSummary = TxStatusType.PEGIN;
    const orientationSummary = TxSummaryOrientation.VERTICAL;

    const pegInTxState = useState<PegInTxState>('pegInTx');

    const refundAddress = useGetter<string>('pegInTx', constants.PEGIN_TX_GET_REFUND_ADDRESS);
    const safeFee = useGetter<SatoshiBig>('pegInTx', constants.PEGIN_TX_GET_SAFE_TX_FEE);
    const accountBalanceText = useGetter<string>('pegInTx', constants.PEGIN_TX_GET_ACCOUNT_BALANCE_TEXT);
    const enoughBalanceSelectedFee = useGetter<boolean>('pegInTx', constants.PEGIN_TX_GET_ENOUGH_FEE_VALUE);

    const isReadyToCreate = computed((): boolean => pegInTxState.value.isValidAmountToTransfer
        && !pegInTxState.value.loadingFee
        && rskAddressState.value !== 'invalid'
        && enoughBalanceSelectedFee.value
        && pegInTxState.value.rskAddressSelected !== '');

    const pegInFormSummary = computed((): NormalizedSummary => ({
      amountFromString: pegInTxState.value.amountToTransfer.toBTCTrimmedString(),
      amountReceivedString: pegInTxState.value.amountToTransfer.toBTCTrimmedString(),
      fee: Number(safeFee.value.toBTCString()),
      recipientAddress: pegInTxState.value.rskAddressSelected,
      refundAddress: refundAddress.value,
      selectedAccount: accountBalanceText.value,
      federationAddress: pegInTxState.value.peginConfiguration.federationAddress,
    }));

    function setRskAddressState(state: string) {
      rskAddressState.value = state;
    }

    function back() {
      pegInFormState.value.send('loading');
      context.emit('back');
    }

    function createTx() {
      showWarningMessage.value = false;
      pegInFormState.value.send('loading');
      context.emit('createTx', {
        amountToTransferInSatoshi: pegInTxState.value.amountToTransfer,
        refundAddress: refundAddress.value,
        recipient: pegInTxState.value.rskAddressSelected,
        feeLevel: pegInTxState.value.selectedFee,
        accountType: pegInTxState.value.selectedAccount,
      });
    }

    function sendTx() {
      if (rskAddressState.value === 'warning') showWarningMessage.value = true;
      else createTx();
    }

    return {
      pegInFormState,
      showWarningMessage,
      rskAddressState,
      environmentContext,
      typeSummary,
      orientationSummary,
      setRskAddressState,
      pegInFormSummary,
      back,
      sendTx,
      isReadyToCreate,
      pegInTxState,
      createTx,
      mdiSendOutline,
    };
  },
});
</script>
