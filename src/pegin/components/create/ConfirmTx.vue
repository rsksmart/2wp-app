<template>
 <div class="transactions">
    <v-row class="mx-0 d-flex justify-center">
      <v-col cols="10" lg="8" xl="6" class="d-flex justify-center">
        <h1 class="text-center">Confirm transaction on your wallet</h1>
      </v-col>
    </v-row>
    <v-row class="mx-0 my-8 d-flex justify-center">
      <p class="text-center">
        Make sure the amount, address and transaction fee displayed
        on the {{ walletService.name().formal_name }} wallet are correct.
        <br>
        To prevent malware attacks, double-check the address with the recipient.
        <br>
        Press <strong>Send</strong> when you finish.
      </p>
    </v-row>
    <v-row class="ma-0 justify-center">
      <v-col class="d-flex flex-column"
        cols="3" v-for="step, idx in walletService.confirmationSteps()" :key="`step-${idx}`">
        <v-row class="step-title ma-0">
          <v-col>
            <v-img :src="require(`@/assets/exchange/steps/${idx}.png`)" height="40" contain/>
              <div class="d-flex justify-center">
                <div v-if="walletService.confirmationSteps().length > 1" class="number">
                  {{ idx + 1 }}
                </div>
                <h4>{{ step.title }}</h4>
              </div>
          </v-col>
        </v-row>
        <div :class="
        [isHdWallet ? 'confirmation-box-hd flex-grow-1': 'confirmation-box flex-grow-1']">
          <span class="legend grayish">See on {{ walletService.name().formal_name }}</span>
          <v-row v-if="walletService.name().short_name != 'leather'" class="ma-0 text-center">
            <v-col class="py-0">
              <v-row justify="center" class="mt-6 mb-2">
                <span>
                  {{ step.subtitle }}
                </span>
              </v-row>
              <v-row v-if="step.outputsToshow.opReturn.amount || step.outputsToshow.opReturn.value"
                 class="mt-2 d-flex justify-center">
                <span>
                  OP_RETURN
                </span>
                <v-tooltip right>
                  <template v-slot:activator="{props}">
                      <v-icon
                        size="x-small" :icon="mdiInformation" color="grey-darken-2"
                        v-bind="props" v-on="props.on"
                        />
                  </template>
                  <p class="tooltip-form mb-0">
                    The OP_RETURN is an output with information
                    required for the {{environmentContext.getRskText()}} network.
                  </p>
                </v-tooltip>
              </v-row>
              <v-row v-if="step.outputsToshow.opReturn.amount"
                justify="center" class="mt-5 mx-0 text-center">
                Amount: 0 {{ environmentContext.getBtcTicker() }}
              </v-row>
              <v-row v-if="step.outputsToshow.opReturn.value"
                  justify="center" class="ma-0">
                <v-col class="mt-5 pa-0 d-flex">
                  <span class="breakable-address d-flex justify-center">
                    {{ opReturnData }}
                  </span>
                </v-col>
              </v-row>
              <v-divider
                  v-if="step.outputsToshow.opReturn.value || step.outputsToshow.opReturn.amount"
                  :class="[isHdWallet ? 'mt-6 mb-3 divideronfooter': 'mt-6 mb-3']"/>
              <v-row v-if="step.outputsToshow.federation.amount" justify="center" class="mt-2">
                Amount: {{computedAmountToTransfer}} {{ environmentContext.getBtcTicker() }}
              </v-row>
              <v-row v-if="step.outputsToshow.federation.address"
                justify="center" class="mt-5 mx-0 d-none d-lg-block">
                <v-col class="pa-0 d-flex flex-column align-center">
                  <span v-for="value in splitString(rskFederationAddress)" :key="value">
                    {{ value }}
                  </span>
                </v-col>
              </v-row>
              <v-row v-if="step.outputsToshow.federation.address"
                justify="center" class="mt-5 mx-0 d-lg-none">
                <span class="breakable-address">
                  {{rskFederationAddress}}
                </span>
              </v-row>
              <v-divider
                v-if="step.outputsToshow.federation.address || step.outputsToshow.federation.amount"
                :class="[isHdWallet ? 'mt-6 mb-3 divideronfooter': 'mt-6 mb-3']"/>
              <v-row v-if="step.fullAmount"
                justify="center" class="mt-2 mx-0 text-center">
                 Amount: {{computedFullAmount}} {{ environmentContext.getBtcTicker() }}
              </v-row>
              <v-divider
                  v-if="step.fullAmount"
                  :class="[isHdWallet ? 'mt-6 mb-3 divideronfooter': 'mt-6 mb-3']"/>
              <v-row v-if="step.outputsToshow.change.amount && parseFloat(changeAmountComputed) > 0"
                justify="center" class="mt-2 mx-0 text-center">
                Amount: {{changeAmountComputed}} {{ environmentContext.getBtcTicker() }}
              </v-row>
              <v-row v-if="step.outputsToshow.change.address"
                justify="center" class="mt-5 mx-0">
                <span class="breakable-address">
                  {{changeAddress}}
                </span>
              </v-row>
              <v-divider
                  v-if="step.outputsToshow.change.address || step.outputsToshow.change.amount"
                  :class="[isHdWallet ? 'mt-6 mb-3 divideronfooter': 'mt-6 mb-3']"/>
              <v-row v-if="step.fee"
                justify="center" class="mt-5 mx-0 text-center">
                Fee: {{safeFee.toBTCTrimmedString()}} {{ environmentContext.getBtcTicker() }}
              </v-row>
              <v-row class="pa-2" v-if="step.fee">
                <span class="grayish">
                  Please make sure to check that the fee this transaction
                  is paying is along your expectations.
                </span>
              </v-row>
              <v-divider
                  v-if="step.fee"
                  :class="[isHdWallet ? 'mt-6 mb-3 divideronfooter': 'mt-6 mb-3']"/>

            </v-col>
          </v-row>
          <!-- handling leather -->
          <v-row v-if="walletService.name().short_name === 'leather'" class="ma-0 text-center">
            <v-col>
              <v-row justify="center" class="mt-3 mb-2">
                <span>
                  You'll transfer
                </span>
              </v-row>
              <v-row v-if="step.outputsToshow.federation.amount" justify="center">
                {{ environmentContext.getBtcText() }} {{computedPlusFeeFullAmount}}
              </v-row>
              <v-divider class="my-6"/>
              <v-row v-if="step.outputsToshow.federation.amount" justify="center">
                Transaction fee {{confirmTxSummary.fee}} {{environmentContext.getBtcTicker()}}
              </v-row>
             </v-col>
          </v-row>
          <v-row justify="center"
           :class="[isHdWallet ?
           'mt-2 mb-3 mx-0 text-center divonfooter' : 'mt-2 mb-3 mx-0 text-center']">
            Confirm on your {{walletService.name().formal_name}} wallet
          </v-row>
        </div>
      </v-col>
    </v-row>
    <v-divider class="mt-4"/>
    <v-row class="mx-0 my-8">
      <tx-summary-fixed
        :summary="confirmTxSummary"
        :initialExpand="true"
        :type='typeSummary'
        :orientation='orientationSummary'/>
    </v-row>
    <v-row class="mx-0 my-8">
      <advanced-data :rawTx="rawTx" :initial-expand="false"/>
    </v-row>
    <v-row v-if="confirmTxState.matches(['idle', 'error', 'goingHome'])" class="ma-0">
      <v-col cols="2" class="d-flex justify-start ma-0 py-0">
        <v-btn rounded outlined color="#000000" width="110" @click="toPegInForm"
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
          See your {{ walletService.name().formal_name }} wallet to confirm your transaction!
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
  PropType, computed, defineComponent, ref,
} from 'vue';
import TxSummaryFixed from '@/common/components/exchange/TxSummaryFixed.vue';
import AdvancedData from '@/common/components/exchange/AdvancedData.vue';
import { Machine } from '@/common/utils';
import TxBuilder from '@/pegin/middleware/TxBuilder/TxBuilder';
import * as constants from '@/common/store/constants';
import { ApiService, WalletService } from '@/common/services';
import { useState, useGetter, useStateAttribute } from '@/common/store/helper';
import {
  NormalizedSummary,
  PegInTxState, SatoshiBig, TxStatusType, TxSummaryOrientation,
} from '@/common/types';
import EnvironmentContextProviderService from '@/common/providers/EnvironmentContextProvider';
import { mdiInformation } from '@mdi/js';

export default defineComponent({
  name: 'ConfirmTx',
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
    const refundAddress = useGetter<string>('pegInTx', constants.PEGIN_TX_GET_REFUND_ADDRESS);
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

    const confirmTxSummary = computed((): NormalizedSummary => ({
      amountFromString: pegInTxState.value.amountToTransfer.toBTCTrimmedString(),
      amountReceivedString: pegInTxState.value.amountToTransfer.toBTCTrimmedString(),
      fee: Number(safeFee.value.toBTCTrimmedString()),
      recipientAddress: pegInTxState.value.rskAddressSelected,
      refundAddress: refundAddress.value,
      selectedAccount: accountBalanceText.value,
      federationAddress: pegInTxState.value.peginConfiguration.federationAddress,
    }));

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
      confirmTxSummary,
      mdiInformation,
      isHdWallet,
    };
  },
});
</script>
