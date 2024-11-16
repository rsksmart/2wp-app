<template>
  <v-container>
    <v-row>
      <v-btn variant="text" class="px-0" :prepend-icon="mdiArrowLeft" @click="toPegInForm"
        :disabled="confirmTxState.matches(['error', 'goingHome', 'loading'])">
        Go Back
      </v-btn>
    </v-row>
    <v-row>
      <confirmation-steps :hd-wallet="isHdWallet" />
    </v-row>
    <v-row class="pt-2" justify="end">
      <v-btn-rsk v-if="!confirmTxState.matches(['confirming'])" @click="toTrackId"
        :disabled="confirmTxState.matches(['error', 'goingHome'])">
        <template #append>
          <v-icon :icon="mdiArrowRight" />
        </template>
        Send
      </v-btn-rsk>
      <v-progress-circular v-else indeterminate :size="60" :width="8" class="mt-2" />
    </v-row>
  </v-container>
</template>

<script lang="ts">
import {
  PropType, computed, defineComponent,
} from 'vue';
import { Machine } from '@/common/utils';
import TxBuilder from '@/pegin/middleware/TxBuilder/TxBuilder';
import * as constants from '@/common/store/constants';
import { ApiService, WalletService } from '@/common/services';
import { useState, useGetter, useStateAttribute } from '@/common/store/helper';
import {
  LiquidityProvider2WP,
  PeginQuote,
  PeginQuoteDbModel,
  PegInTxState, SatoshiBig, TxStatusType,
} from '@/common/types';
import { mdiInformation, mdiArrowLeft, mdiArrowRight } from '@mdi/js';
import ConfirmationSteps from '@/pegin/components/create/ConfirmationSteps.vue';

export default defineComponent({
  name: 'ConfirmTx',
  components: {
    ConfirmationSteps,
  },
  emits: ['successConfirmation', 'toPegInForm'],
  props: {
    confirmTxState: {
      type: Object as PropType<Machine < 'idle' | 'loading' | 'error' | 'confirming' | 'goingHome' >>,
      required: true,
    },
    txBuilder: {
      type: Object as PropType<TxBuilder>,
      required: true,
    },
  },
  setup(props, context) {
    const pegInTxState = useState<PegInTxState>('pegInTx');
    const walletService = useGetter<WalletService>('pegInTx', constants.PEGIN_TX_GET_WALLET_SERVICE);
    const selectedAccountType = useGetter<string>('pegInTx', constants.PEGIN_TX_GET_SELECTED_ACCOUNT_TYPE);
    const safeFee = useGetter<SatoshiBig>('pegInTx', constants.PEGIN_TX_GET_SAFE_TX_FEE);
    const isHdWallet = useGetter<boolean>('pegInTx', constants.PEGIN_TX_IS_HD_WALLET);
    const selectedQuote = useGetter<PeginQuote>('flyoverPegin', constants.FLYOVER_PEGIN_GET_SELECTED_QUOTE);
    const liquidityProviders = useStateAttribute<LiquidityProvider2WP[]>('flyoverPegin', 'liquidityProviders');
    const recipientAddress = useStateAttribute<string>('flyoverPegin', 'rootstockRecipientAddress');
    const peginType = useStateAttribute<string>('pegInTx', 'peginType');
    const isFlyover = computed(() => peginType.value === constants.peginType.FLYOVER);

    function getLPName(): string {
      const address = selectedQuote.value.quote.lpRSKAddr.toLowerCase();
      const provider = liquidityProviders.value.find((lp) => lp.provider.toLowerCase() === address);
      return provider?.name ?? '';
    }

    const flyoverProps = computed(() => {
      const peginQuote = selectedQuote.value.quote;
      const dbQuote: PeginQuoteDbModel = {
        callFeeOnSatoshi: peginQuote.callFee.toSatoshiNumber(),
        callOnRegister: peginQuote.callOnRegister,
        confirmations: peginQuote.confirmations,
        contractAddr: peginQuote.contractAddr,
        data: peginQuote.data,
        fedBTCAddr: peginQuote.fedBTCAddr,
        gasLimit: peginQuote.gasLimit,
        lpCallTime: peginQuote.lpCallTime,
        productFeeAmountOnSatoshi: peginQuote.productFeeAmount.toSatoshiNumber(),
        timeForDepositInSeconds: peginQuote.timeForDepositInSeconds,
        valueOnSatoshi: peginQuote.value.toSatoshiNumber(),
        agreementTimestamp: peginQuote.agreementTimestamp,
        gasFeeOnWei: peginQuote.gasFee.toWeiNumber(),
        nonce: Number(peginQuote.nonce),
        penaltyFeeOnWei: peginQuote.penaltyFee.toWeiNumber(),
        btcRefundAddress: peginQuote.btcRefundAddr,
        lbcAddress: peginQuote.lbcAddr,
        lpBtcAddress: peginQuote.lpBTCAddr,
        rskRefundAddress: peginQuote.rskRefundAddr,
        liquidityProviderRskAddress: peginQuote.lpRSKAddr,
      };
      return {
        value: Number(selectedQuote.value.quote.value.toBTCTrimmedString()),
        fee: Number(selectedQuote.value.getTotalQuoteFee(safeFee.value).toBTCTrimmedString()),
        provider: getLPName(),
        details: {
          senderAddress: pegInTxState.value.normalizedTx.inputs[0].address,
          recipientAddress: recipientAddress.value,
          blocksToCompleteTransaction: selectedQuote.value.quote.confirmations,
        },
        quote: dbQuote,
        quoteHash: selectedQuote.value.quoteHash,
      };
    });

    const nativeProps = computed(() => ({
      value: Number(pegInTxState.value.amountToTransfer.toBTCTrimmedString()),
      fee: Number(safeFee.value.toBTCTrimmedString()),
    }));

    async function toTrackId() {
      let txError = '';
      props.confirmTxState.send('confirming');
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
            txHash: id,
            type: TxStatusType.PEGIN.toLowerCase(),
            wallet: walletService.value.name().short_name,
            addressType: selectedAccountType.value,
            ...(isFlyover.value ? flyoverProps.value : nativeProps.value),
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

    toTrackId();

    return {
      toPegInForm,
      toTrackId,
      mdiInformation,
      isHdWallet,
      mdiArrowLeft,
      mdiArrowRight,
    };
  },
});
</script>
