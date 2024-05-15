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
    <btc-input-amount />
    <v-row>
      <v-col class="mr-3">
        <pegin-option-card
          option-type="native"
          @selected-option="changeSelectedOption"
          :selected="selected === 'native'"
        />
      </v-col>
      <v-col v-if="flyoverEnabled">
        <pegin-option-card
          option-type="flyover"
          @selected-option="changeSelectedOption"
          :selected="selected === 'flyover'"
        />
      </v-col>
      </v-row>
      <v-row>
      </v-row>
      <v-row justify="end">
        <v-col cols="auto">
            <v-btn-rsk v-if="!pegInFormState.matches(['loading'])"
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
import SatoshiBig from '@/common/types/SatoshiBig';
import EnvironmentContextProviderService from '@/common/providers/EnvironmentContextProvider';
import { TxStatusType } from '@/common/types/store';
import { TxSummaryOrientation } from '@/common/types/Status';
import { Feature, FeatureNames, NormalizedSummary } from '@/common/types';
import { useGetter, useState } from '@/common/store/helper';
import AddressWarningDialog from '@/common/components/exchange/AddressWarningDialog.vue';

export default defineComponent({
  name: 'PegInForm',
  components: {
    PegInAccountSelect,
    BtcInputAmount,
    PeginOptionCard,
    AddressWarningDialog,
  },
  setup(_, context) {
    const pegInFormState = ref<Machine<'loading' | 'goingHome' | 'fill'>>(new Machine('fill'));
    const showWarningMessage = ref(false);
    const rskAddressState = ref('invalid');
    const environmentContext = EnvironmentContextProviderService.getEnvironmentContext();
    const typeSummary = TxStatusType.PEGIN;
    const orientationSummary = TxSummaryOrientation.VERTICAL;
    const flyoverFeature = useGetter<(name: FeatureNames) => Feature>('web3Session', constants.SESSION_GET_FEATURE);
    const flyoverEnabled = ref(true);

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

    const selected = ref();
    function changeSelectedOption(selectedType: 'native' | 'flyover') {
      selected.value = selectedType;
    }

    onBeforeMount(() => {
      const feature = flyoverFeature.value(FeatureNames.FLYOVER_PEG_IN);
      flyoverEnabled.value = feature?.value === 'enabled';
    });

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
      mdiArrowLeft,
      mdiArrowRight,
      changeSelectedOption,
      selected,
      flyoverEnabled,
    };
  },
});
</script>
