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
import { ApiService, FlyoverService, WalletService } from '@/common/services';
import { useState, useGetter, useStateAttribute } from '@/common/store/helper';
import {
  PeginQuote,
  PegInTxState, Tx,
} from '@/common/types';
import { mdiInformation, mdiArrowLeft, mdiArrowRight } from '@mdi/js';
import ConfirmationSteps from '@/pegin/components/create/ConfirmationSteps.vue';
import { useAppKitProvider } from '@reown/appkit/vue';
import { BitcoinConnector } from '@reown/appkit-adapter-bitcoin';
import ReownService from '@/common/services/ReownService';

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
    const isHdWallet = useGetter<boolean>('pegInTx', constants.PEGIN_TX_IS_HD_WALLET);
    const selectedQuote = useGetter<PeginQuote>('flyoverPegin', constants.FLYOVER_PEGIN_GET_SELECTED_QUOTE);
    const peginType = useStateAttribute<string>('pegInTx', 'peginType');
    const acceptedQuoteSignature = useStateAttribute<string>('flyoverPegin', 'acceptedQuoteSignature');
    const flyoverService = useStateAttribute<FlyoverService>('flyoverPegin', 'flyoverService');
    const bitcoinWallet = useStateAttribute('pegInTx', 'bitcoinWallet');
    const isFlyover = computed(() => peginType.value === constants.peginType.FLYOVER);

    async function toTrackId() {
      let txError = '';
      props.confirmTxState.send('confirming');
      await walletService.value.stopAskingForBalance()
        .then(() => props.txBuilder.buildTx(
          pegInTxState.value.normalizedTx,
          pegInTxState.value.selectedAccount,
        ))
        .then(async (tx: Tx) => {
          if (bitcoinWallet.value === constants.WALLET_NAMES.REOWN.long_name) {
            const { walletProvider } = useAppKitProvider<BitcoinConnector>('bip122');
            (walletService.value as ReownService)
              .setReownProvider(walletProvider as BitcoinConnector);
          }
          return walletService.value.sign(tx);
        })
        .then(async ({ signedTx }) => {
          if (isFlyover.value) {
            await flyoverService.value.validatePegin(
              selectedQuote.value,
              acceptedQuoteSignature.value,
              pegInTxState.value.normalizedTx.outputs[0].address as string,
              signedTx,
            );
          }
          return ApiService.broadcast(signedTx);
        })
        .then((id) => {
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
