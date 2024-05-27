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
    <btc-fee-select/>
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
        <warning-dialog :title="'IMPORTANT FOR LIQUALITY USERS'"
                                :show-dialog="showLiqualityWarning"
                                :message="liqualityWarningMessage"
                                @continue="showLiqualityWarning = false"
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
import { Feature, FeatureNames } from '@/common/types';
import { useGetter, useState, useStateAttribute } from '@/common/store/helper';
import AddressWarningDialog from '@/common/components/exchange/AddressWarningDialog.vue';
import WarningDialog from '@/common/components/common/WarningDialog.vue';
import BtcFeeSelect from '@/pegin/components/create/BtcFeeSelect.vue';

export default defineComponent({
  name: 'PegInForm',
  components: {
    PegInAccountSelect,
    BtcInputAmount,
    PeginOptionCard,
    AddressWarningDialog,
    WarningDialog,
    BtcFeeSelect,
  },
  setup(_, context) {
    const pegInFormState = ref<Machine<'loading' | 'goingHome' | 'fill'>>(new Machine('fill'));
    const showWarningMessage = ref(false);
    const account = useStateAttribute<string>('web3Session', 'account');
    const environmentContext = EnvironmentContextProviderService.getEnvironmentContext();
    const typeSummary = TxStatusType.PEGIN;
    const orientationSummary = TxSummaryOrientation.VERTICAL;
    const liqualityWarningMessage = 'Some users have encountered difficulties while attempting to create new Bitcoin accounts in Liquality. It\'s important to note that this issue is unrelated to the 2WP app. If you experience this problem, we recommend selecting another wallet.';
    const showLiqualityWarning = ref(false);
    const flyoverFeature = useGetter<(name: FeatureNames) => Feature>('web3Session', constants.SESSION_GET_FEATURE);
    const flyoverEnabled = ref(true);

    const pegInTxState = useState<PegInTxState>('pegInTx');

    const refundAddress = useGetter<string>('pegInTx', constants.PEGIN_TX_GET_REFUND_ADDRESS);
    const enoughBalanceSelectedFee = useGetter<boolean>('pegInTx', constants.PEGIN_TX_GET_ENOUGH_FEE_VALUE);

    const isReadyToCreate = computed((): boolean => pegInTxState.value.isValidAmountToTransfer
        && !pegInTxState.value.loadingFee
        && !!pegInTxState.value.rskAddressSelected
        && pegInTxState.value.rskAddressSelected !== '0x'
        && enoughBalanceSelectedFee.value);

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
        recipient: pegInTxState.value.rskAddressSelected || account.value,
        feeLevel: pegInTxState.value.selectedFee,
        accountType: pegInTxState.value.selectedAccount,
      });
    }
    showLiqualityWarning.value = pegInTxState.value.bitcoinWallet
    === constants.WALLET_NAMES.LIQUALITY.long_name;

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
      environmentContext,
      typeSummary,
      orientationSummary,
      back,
      isReadyToCreate,
      pegInTxState,
      createTx,
      mdiSendOutline,
      liqualityWarningMessage,
      showLiqualityWarning,
      mdiArrowLeft,
      mdiArrowRight,
      changeSelectedOption,
      selected,
      flyoverEnabled,
    };
  },
});
</script>
