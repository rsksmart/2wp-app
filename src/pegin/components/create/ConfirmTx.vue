<template>
  <template v-if="!confirmTxState.matches(['loading'])">
    <v-container>
      <v-row>
        <v-btn variant="text" class="px-0"
               :prepend-icon="mdiArrowLeft"
               @click="toPegInForm"
               :disabled="confirmTxState.matches(['error', 'goingHome', 'loading'])"
        >
          Go Back
        </v-btn>
      </v-row>
      <confirmation-summary />
      <v-row justify="end">
        <v-col cols="auto" class="py-8">
          <v-btn-rsk
            @click="toTrackId"
            :disabled="confirmTxState.matches(['error', 'goingHome', 'loading'])">
            Confirm
            <template #append>
              <v-icon :icon="mdiArrowRight" />
            </template>
          </v-btn-rsk>
        </v-col>
      </v-row>
      <v-row v-if="confirmTxState.matches(['loading'])" class="mx-0 d-flex justify-center">
        <v-col>
          <v-row class="mx-0 mb-5 d-flex justify-center">
            See your {{ walletService.name().formal_name }} wallet to confirm your transaction!
          </v-row>
          <v-row class="mx-0 mb-5 mt-10 d-flex justify-center">
            <v-progress-circular indeterminate :size="60" :width="8" />
          </v-row>
        </v-col>
      </v-row>
    </v-container>
  </template>
  <template v-else>
    <confirm-ledger-transaction />
  </template>
</template>

<script lang="ts">
import {
  PropType, computed, defineComponent, ref,
} from 'vue';
import { Machine } from '@/common/utils';
import TxBuilder from '@/pegin/middleware/TxBuilder/TxBuilder';
import * as constants from '@/common/store/constants';
import { ApiService, WalletService } from '@/common/services';
import { useState, useGetter, useStateAttribute } from '@/common/store/helper';
import {
  PegInTxState, SatoshiBig, TxStatusType, TxSummaryOrientation,
} from '@/common/types';
import EnvironmentContextProviderService from '@/common/providers/EnvironmentContextProvider';
import { mdiInformation, mdiArrowLeft, mdiArrowRight } from '@mdi/js';
import ConfirmationSummary from '@/pegin/components/create/ConfirmationSummary.vue';
import ConfirmLedgerTransaction from '@/pegin/components/ledger/ConfirmLedgerTransaction.vue';

export default defineComponent({
  name: 'ConfirmTx',
  components: {
    ConfirmationSummary,
    ConfirmLedgerTransaction,
  },
  props: {
    confirmTxState: {
      type: Object as PropType<Machine < 'idle' | 'loading' | 'error' | 'goingHome' >>,
      required: true,
    },
    txBuilder: {
      type: Object as PropType<TxBuilder>,
      required: true,
    },
  },
  setup(props, context) {
    const rawTx = ref('');
    const typeSummary = TxStatusType.PEGIN;
    const orientationSummary = TxSummaryOrientation.HORIZONTAL;
    const environmentContext = EnvironmentContextProviderService.getEnvironmentContext();
    const pegInTxState = useState<PegInTxState>('pegInTx');
    const walletService = useGetter<WalletService>('pegInTx', constants.PEGIN_TX_GET_WALLET_SERVICE);
    const accountBalanceText = useGetter<string>('pegInTx', constants.PEGIN_TX_GET_ACCOUNT_BALANCE_TEXT);
    const safeFee = useGetter<SatoshiBig>('pegInTx', constants.PEGIN_TX_GET_SAFE_TX_FEE);
    const sessionId = useStateAttribute<string>('pegInTx', 'sessionId');
    const isHdWallet = useGetter<boolean>('pegInTx', constants.PEGIN_TX_IS_HD_WALLET);

    const changeAmountComputed = computed((): string => {
      const changeAmount = new SatoshiBig(pegInTxState.value.normalizedTx.outputs[2]?.amount ?? 0, 'satoshi');
      return changeAmount.toBTCTrimmedString();
    });

    const computedFullAmount = computed((): string => pegInTxState.value.amountToTransfer
      .plus(new SatoshiBig(pegInTxState.value.normalizedTx.outputs[2]?.amount ?? 0, 'satoshi'))
      .plus(safeFee.value)
      .toBTCTrimmedString());

    const computedAmountToTransfer = computed((): string => pegInTxState.value.amountToTransfer
      .toBTCTrimmedString());

    const computedPlusFeeFullAmount = computed((): string => pegInTxState.value.amountToTransfer
      .plus(safeFee.value)
      .toBTCTrimmedString());

    const opReturnData = computed((): string => {
      const opReturnDataOutput = pegInTxState.value.normalizedTx.outputs[0] ?? { script_type: '' };
      return opReturnDataOutput.op_return_data
        ? `${opReturnDataOutput.op_return_data.substring(0, 45)}...`
        : 'OP_RETURN data not found';
    });

    const rskFederationAddress = computed(():string => pegInTxState.value.normalizedTx.outputs[1]?.address?.trim() ?? `${environmentContext.getBtcText()} Powpeg address not found`);

    const changeAddress = computed((): string => {
      const [, , change] = pegInTxState.value.normalizedTx.outputs;
      if (change?.address) {
        return change.address;
      }
      return 'Change address not found';
    });

    const addressType = computed(() => accountBalanceText.value?.split('-')[0].trim() ?? '');

    async function toTrackId() {
      let txError = '';
      props.confirmTxState.send('loading');
      await walletService.value.stopAskingForBalance()
        .then(() => props.txBuilder.buildTx(
          pegInTxState.value.normalizedTx,
          pegInTxState.value.selectedAccount,
        ))
        .then((tx) => walletService.value.sign(tx))
        .then(({ signedTx }) => ApiService
          .broadcast(signedTx))
        .then((id) => {
          ApiService.registerTx({
            sessionId: sessionId.value,
            txHash: id,
            type: TxStatusType.PEGIN.toLowerCase(),
            value: Number(pegInTxState.value.amountToTransfer.toBTCTrimmedString()),
            wallet: walletService.value.name().short_name,
            addressType: addressType.value,
            fee: Number(safeFee.value.toBTCTrimmedString()),
          });
          context.emit('successConfirmation', [txError, id]);
        })
        .catch((err) => {
          props.confirmTxState.send('error');
          txError = err.message;
          context.emit('successConfirmation', [txError, '']);
        });
    }

    async function toPegInForm() {
      props.confirmTxState.send('loading');
      context.emit('toPegInForm', 'PegInForm');
    }

    function cropAddress(address: string):string {
      return `${address.substring(0, 6)}...${address.substring(address.length - 6, address.length)}`;
    }

    function splitString(s: string): string[] {
      return s.match(/.{1,16}/g) ?? [];
    }

    props.txBuilder.getUnsignedRawTx(pegInTxState.value.normalizedTx)
      .then((tx) => { rawTx.value = tx; });

    return {
      rawTx,
      typeSummary,
      orientationSummary,
      environmentContext,
      changeAmountComputed,
      computedFullAmount,
      computedAmountToTransfer,
      computedPlusFeeFullAmount,
      toPegInForm,
      cropAddress,
      splitString,
      pegInTxState,
      opReturnData,
      rskFederationAddress,
      changeAddress,
      safeFee,
      walletService,
      toTrackId,
      mdiInformation,
      isHdWallet,
      mdiArrowLeft,
      mdiArrowRight,
    };
  },
});
</script>
