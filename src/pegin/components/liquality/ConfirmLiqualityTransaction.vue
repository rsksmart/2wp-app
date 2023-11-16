<template>
  <div class="transactions">
    <v-row class="mx-0 d-flex justify-center">
      <v-col cols="10" lg="8" xl="6" class="d-flex justify-center">
        <h1 class="text-center">Confirm transaction details</h1>
      </v-col>
    </v-row>
    <v-row class="mx-0 my-8 d-flex justify-center">
      <p class="text-center">
        Make sure the amount, address and transaction fee displayed
        on the Liquality wallet are correct.
        <br>
        To prevent malware attacks, double-check the address with the recipient.
        <br>
        Press <strong>Send</strong> when you finish.
      </p>
    </v-row>
    <v-row id="instructions-trezor" justify="center" class="ma-0">
      <v-col cols="4">
      </v-col>
      <v-col cols="4">
        <v-row class="mx-0 d-flex justify-center">
          <h4 class="text-center">
            Transaction information
          </h4>
        </v-row>
      </v-col>
      <v-col cols="4">
      </v-col>
    </v-row>
    <v-row justify="center" class="ma-0">
      <v-col class="px-0" cols="5">
        <fieldset class="confirmation-box">
          <legend class="px-4">See on liquality</legend>
          <v-row justify="start" class="mt-5 mx-3 line-box-bottom">
            <v-col cols="2" class="d-flex flex-column align-left px-0">
              <h3>
                {{
                  convertAmount(pegInTxState.normalizedTx.outputs[0].amount)
                }}
              </h3>
            </v-col>
            <v-col cols="10" class="d-flex px-0 flex-column align-left justify-center">
              <v-tooltip>
                <template v-slot:activator="{props}">
                  <v-btn icon size="small" variant="plain" v-bind="props" density="compact">
                    <v-icon class="tooltip-info-icon" size="small" :icon="mdiInformation">
                    </v-icon>
                  </v-btn>
                </template>
                <p class="tooltip-form mb-0">
                 This output only contains metadata required by
                 RSK to process the peg-in, therefore it doesn't
                 include any value.
                </p>
              </v-tooltip>
            </v-col>
          </v-row>

           <v-row justify="start" class="mx-3 line-box-bottom">
            <v-col class="pa-0 pb-2 d-flex flex-column align-left">
              <span class="breakable-address my-5">
                {{ pegInTxState.normalizedTx.outputs[1].address }}
              </span>
              <h3>
                {{
                  convertAmount(pegInTxState.normalizedTx.outputs[1].amount)
                }}
              </h3>
            </v-col>
          </v-row>

          <v-row v-if="pegInTxState.normalizedTx.outputs[2]"
          justify="start" class="mx-3 line-box-bottom">
            <v-col class="pa-0 pb-4 d-flex flex-column align-left">
              <span class="breakable-address my-5">
                {{ pegInTxState.normalizedTx.outputs[2].address }}
              </span>
              <div class="d-flex">
                <div class="liquality-info">
                  <h3>
                    {{
                      convertAmount(pegInTxState.normalizedTx.outputs[2].amount)
                    }}
                  </h3>
                </div>
                <div class="liquality-info">
                  <span class="wallet-tag">
                    My Wallet
                  </span>
                </div>
              </div>
            </v-col>
          </v-row>

          <v-row justify="start" class="mx-2 my-3">
            <v-col class="pa-0 py-2 d-flex flex-column align-left">
              <v-row class="pa-0 ma-0">
                <span class="grayish">
                Fee: {{ fee + ' ' + environmentContext.getBtcTicker() }}
              </span>
              </v-row>
              <v-row class="pa-0 mb-0 mt-1 mx-0">
                <span class="grayish">
                Please make sure to check that the fee this transaction is paying
                  is along your expectations.
              </span>
              </v-row>
            </v-col>
          </v-row>
        </fieldset>
      </v-col>
    </v-row>
    <v-divider/>
    <v-row class="mx-0 my-8">
      <tx-summary-fixed
        :summary="confirmLiqualityTxSummary"
        :initialExpand="true"
        :type="typeSummary"
        :orientation="orientationSummary"/>
    </v-row>
    <v-row class="mx-0 my-8">
      <advanced-data :rawTx="rawTx" :initial-expand="false"/>
    </v-row>
    <v-row v-if="confirmTxState.matches(['idle', 'error', 'goingHome'])" class="ma-0">
      <v-col cols="2" class="d-flex justify-start ma-0 py-0">
        <v-btn rounded variant="outlined" color="#000000" width="110" @click="toPegInForm"
               :disabled="confirmTxState.matches(['error', 'goingHome', 'loading'])">
          <span>Back</span>
        </v-btn>
      </v-col>
      <v-col cols="10" class="d-flex justify-end ma-0 py-0">
        <v-btn rounded color="#000000" width="110" @click="toTrackId"
               :disabled="confirmTxState.matches(['error', 'goingHome', 'loading'])">
          <span class="whiteish">Send</span>
        </v-btn>
      </v-col>
    </v-row>
    <v-row v-if="confirmTxState.matches(['loading'])" class="mx-0 d-flex justify-center">
      <v-col>
        <v-row class="mx-0 mb-5 d-flex justify-center">
          See Liquality wallet to confirm your transaction!
        </v-row>
        <v-row class="mx-0 mb-5 mt-10 d-flex justify-center">
          <v-progress-circular indeterminate :size="60" :width="8" color="#000000" />
        </v-row>
      </v-col>
    </v-row>
  </div>
</template>

<script lang="ts">
import {
  computed, ref, PropType, defineComponent, onBeforeMount,
} from 'vue';
import { mdiInformation } from '@mdi/js';
import {
  LiqualitySignedTx,
  LiqualityTx, NormalizedSummary,
} from '@/common/types';
import ApiService from '@/common/services/ApiService';
import SatoshiBig from '@/common/types/SatoshiBig';
import AdvancedData from '@/common/components/exchange/AdvancedData.vue';
import { WalletService } from '@/common/services';
import { addTag, Machine } from '@/common/utils';
import EnvironmentContextProviderService from '@/common/providers/EnvironmentContextProvider';
import { PegInTxState } from '@/common/types/pegInTx';
import * as constants from '@/common/store/constants';
import LiqualityTxBuilder from '@/pegin/middleware/TxBuilder/LiqualityTxBuilder';
import { TxStatusType } from '@/common/types/store';
import { TxSummaryOrientation } from '@/common/types/Status';
import TxSummaryFixed from '@/common/components/exchange/TxSummaryFixed.vue';
import { useGetter, useState } from '@/common/store/helper';

export default defineComponent({
  name: 'ConfirmLiqualityTransaction',
  components: {
    TxSummaryFixed,
    AdvancedData,
  },
  props: {
    confirmTxState: {
      type: Object as PropType<Machine < 'idle' | 'loading' | 'error' | 'goingHome' >>,
      required: true,
    },
    txBuilder: {
      type: Object as PropType<LiqualityTxBuilder>,
      required: true,
    },
  },
  setup(props, context) {
    const txId = ref('');
    const rawTx = ref('');
    const typeSummary = TxStatusType.PEGIN;
    const orientationSummary = TxSummaryOrientation.HORIZONTAL;
    const VALUE_INCOMPLETE_MESSAGE = 'Not Found';
    const environmentContext = EnvironmentContextProviderService.getEnvironmentContext();
    const pegInTxState = useState<PegInTxState>('pegInTx');
    const walletService = useGetter<WalletService>('pegInTx', constants.PEGIN_TX_GET_WALLET_SERVICE);
    const accountBalanceText = useGetter<string>('pegInTx', constants.PEGIN_TX_GET_ACCOUNT_BALANCE_TEXT);
    const safeFee = useGetter<SatoshiBig>('pegInTx', constants.PEGIN_TX_GET_SAFE_TX_FEE);

    const feeBTC = computed(():SatoshiBig => safeFee.value);

    const fee = computed((): string => {
      if (!feeBTC.value) return VALUE_INCOMPLETE_MESSAGE;
      return feeBTC.value.toBTCString();
    });

    const confirmLiqualityTxSummary = computed((): NormalizedSummary => ({
      amountFromString: pegInTxState.value.amountToTransfer.toBTCTrimmedString(),
      amountReceivedString: pegInTxState.value.amountToTransfer.toBTCTrimmedString(),
      fee: Number(safeFee.value.toBTCTrimmedString()),
      recipientAddress: pegInTxState.value.rskAddressSelected,
      selectedAccount: accountBalanceText.value,
      federationAddress: pegInTxState.value.peginConfiguration.federationAddress,
    }));

    async function toTrackId() {
      let txError = '';
      props.confirmTxState.send('loading');
      await walletService.value.stopAskingForBalance()
        .then(() => props.txBuilder.buildTx(pegInTxState.value.normalizedTx))
        .then((tx: LiqualityTx) => walletService.value.sign(tx) as Promise<LiqualitySignedTx>)
        .then((liqualitySignedTx: LiqualitySignedTx) => ApiService
          .broadcast(liqualitySignedTx.signedTx))
        .then((txHash) => {
          txId.value = txHash;
        })
        .catch((err) => {
          props.confirmTxState.send('error');
          txError = err.message;
        });
      context.emit('successConfirmation', [txError, txId.value]);
    }

    async function toPegInForm() {
      props.confirmTxState.send('loading');
      context.emit('toPegInForm', 'PegInForm');
    }

    function convertAmount(amount: string) {
      const satoshiAmount = amount === '0' ? 0 : new SatoshiBig(amount, 'satoshi').toBTCString();
      return `${satoshiAmount} ${environmentContext.getBtcTicker()}`;
    }

    function appendClarityScript(): void {
      addTag(constants.OPERATION_TYPE, TxStatusType.PEGIN);
      addTag(constants.WALLET_NAME, constants.WALLET_LIQUALITY);
      const amountFromString = pegInTxState.value.amountToTransfer.toBTCTrimmedString();
      addTag(constants.OPERATION_AMOUNT, `${amountFromString}`);
    }

    onBeforeMount(appendClarityScript);

    props.txBuilder.getUnsignedRawTx(pegInTxState.value.normalizedTx)
      .then((tx: string) => {
        rawTx.value = tx;
      });

    return {
      convertAmount,
      pegInTxState,
      fee,
      environmentContext,
      confirmLiqualityTxSummary,
      typeSummary,
      orientationSummary,
      rawTx,
      toPegInForm,
      toTrackId,
      mdiInformation,
    };
  },
});
</script>
