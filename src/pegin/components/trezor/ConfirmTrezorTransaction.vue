<template>
  <div class="transactions">
    <v-row class="mx-0 d-flex justify-center">
      <v-col cols="10" lg="8" xl="6" class="d-flex justify-center">
        <h1 class="text-center">Confirm transaction on your device</h1>
      </v-col>
    </v-row>
    <v-row class="mx-0 my-8 d-flex justify-center">
      <p class="text-center">
        Make sure the amount, address and transaction fee displayed
        on the Trezor device are correct.
        <br>
        To prevent malware attacks, double-check the address with the recipient.
        <br>
        Press <strong>Send</strong> when you finish.
      </p>
    </v-row>
    <v-row id="instructions-trezor" justify="center" class="mx-0">
      <v-col cols="3">
        <v-row class="mx-0 d-flex justify-center">
          <v-img :src="require('@/assets/exchange/rootstock_black.png')" height="40" contain/>
        </v-row>
        <v-row class="mx-0 d-flex justify-center">
          <h4 class="text-center">
          <div class="number">1</div>Confirm on {{environmentContext.getRskText()}}</h4>
        </v-row>
      </v-col>
      <v-col cols="3">
        <v-row class="mx-0">
          <v-img :src="require('@/assets/exchange/trezor/transfer.png')" height="40" contain/>
        </v-row>
        <v-row class="mx-0 d-flex justify-center">
          <h4 class="text-center"><div class="number">2</div>Confirm funds transfer</h4>
        </v-row>
      </v-col>
      <v-col v-if="parseFloat(changeAmountComputed) > 0" cols="3">
        <v-row class="mx-0">
          <v-img :src="require('@/assets/exchange/trezor/change.png')" height="40" contain/>
        </v-row>
        <v-row class="mx-0 d-flex justify-center">
          <h4 class="text-center"><div class="number">3</div>Confirm change address</h4>
        </v-row>
      </v-col>
      <v-col cols="3">
        <v-row class="mx-0">
          <v-img :src="require('@/assets/exchange/trezor/fee.png')" height="40" contain/>
        </v-row>
        <v-row class="mx-0 d-flex justify-center">
          <h4 class="text-center">
            <div class="number">
              {{ parseFloat(changeAmountComputed) > 0 ? 4 : 3 }}
            </div>
            Confirm transaction fee
          </h4>
        </v-row>
      </v-col>
    </v-row>
    <v-row justify="center" class="mx-0">
      <v-col cols="3">
        <fieldset class="confirmation-box">
          <legend lass="px-4">See on Trezor</legend>
          <v-row justify="center" class="mt-5 mx-0"><span>Confirm</span></v-row>
          <v-row justify="center" align="start" class="mt-5 mx-0 text-center">
            <span>
            OP_RETURN
            </span>
            <v-tooltip right>
              <template v-slot:activator="{props}">
                <v-icon small color="black" v-bind="props.attrs" v-on="props.on" class="ml-2">
                  mdi-information
                </v-icon>
              </template>
              <p class="tooltip-form mb-0">
                The OP_RETURN is an output with information
                required for the {{environmentContext.getRskText()}} network.
              </p>
            </v-tooltip>
          </v-row>
          <v-row justify="center" class="mt-5 mx-0 d-none d-lg-block">
            <v-col class="pa-0 d-flex flex-column align-center">
              <span v-for="value in splitString(opReturnData)" :key="value">
                {{ value }}
              </span>
            </v-col>
          </v-row>
          <v-row justify="center" class="mt-5 mx-0 d-lg-none">
            <v-col class="pa-0 px-4 d-flex flex-column align-center">
              <span class="breakable-address">
                {{ opReturnData }}
              </span>
            </v-col>
          </v-row>
          <v-row justify="center" class="mt-5 mb-3 mx-0">Confirm</v-row>
        </fieldset>
      </v-col>
      <v-col cols="3">
        <fieldset class="confirmation-box">
          <legend class="px-4">See on Trezor</legend>
          <v-row justify="center" class="mt-5 mx-0">Confirm sending</v-row>
          <v-row justify="center" class="mt-5 mx-0 text-center" >
            Amount: {{pegInTxState.amountToTransfer.toBTCTrimmedString()}}
          </v-row>
          <v-row justify="center" class="mt-5 mx-0 d-none d-lg-block">
            <v-col class="pa-0 d-flex flex-column align-center">
              <span v-for="value in splitString(rskFederationAddress)" :key="value">
                {{ value }}
              </span>
            </v-col>
          </v-row>
          <v-row justify="center" class="mt-5 mx-0 d-lg-none">
            <span>
              {{cropAddress(rskFederationAddress)}}
            </span>
          </v-row>
          <v-row justify="center" class="mt-5 mb-3 mx-0">Confirm</v-row>
        </fieldset>
      </v-col>
      <v-col v-if="parseFloat(changeAmountComputed) > 0" cols="3">
        <fieldset class="confirmation-box">
          <legend class="px-4">See on Trezor</legend>
          <v-row justify="center" class="mt-5 mx-0">Confirm sending</v-row>
          <v-row justify="center" class="mt-5 mx-0 text-center">
            Amount: {{changeAmountComputed}}
          </v-row>
          <v-row justify="center" class="mt-5 mx-0 d-none d-lg-block">
            <v-col class="pa-0 d-flex flex-column align-center">
              <span v-for="value in splitString(changeAddress)" :key="value">
                {{ value }}
              </span>
            </v-col>
          </v-row>
          <v-row justify="center" class="mt-5 mx-0 d-lg-none">
            <span>
              {{cropAddress(changeAddress)}}
            </span>
          </v-row>
          <v-row justify="center" class="mt-5 mb-3 mx-0">Confirm</v-row>
        </fieldset>
      </v-col>
      <v-col cols="3">
        <fieldset class="confirmation-box">
          <legend class="px-4">See on Trezor</legend>
          <v-row justify="center" class="mt-5 mx-0">Really send</v-row>
          <v-row justify="center" class="mt-5 mx-0 text-center">
            Amount: {{computedFullAmount}}
          </v-row>
          <v-row justify="center" class="mt-5 mx-0 text-center">
            Fee: {{safeFee.toBTCTrimmedString()}}
          </v-row>
          <v-row justify="center" class="mt-4 mx-0 text-center">
            Please make sure to check that the fee this transaction is paying
            is along your expectations.
          </v-row>
          <v-row justify="center" class="mt-5 mb-3 mx-0">Confirm</v-row>
        </fieldset>
      </v-col>
    </v-row>
    <v-divider/>
    <v-row class="mx-0 my-8">
      <tx-summary-fixed
        :summary="confirmTrezorTxSummary"
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
          See your Trezor device to confirm your transaction!
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
  computed, PropType, ref, defineComponent,
} from 'vue';
import TrezorTxBuilder from '@/pegin/middleware/TxBuilder/TrezorTxBuilder';
import {
  NormalizedSummary,
  TrezorSignedTx, TrezorTx,
} from '@/common/types';
import ApiService from '@/common/services/ApiService';
import SatoshiBig from '@/common/types/SatoshiBig';
import AdvancedData from '@/common/components/exchange/AdvancedData.vue';
import { WalletService } from '@/common/services';
import { Machine } from '@/common/utils';
import EnvironmentContextProviderService from '@/common/providers/EnvironmentContextProvider';
import { PegInTxState } from '@/common/types/pegInTx';
import * as constants from '@/common/store/constants';
import { TxStatusType } from '@/common/types/store';
import { TxSummaryOrientation } from '@/common/types/Status';
import TxSummaryFixed from '@/common/components/exchange/TxSummaryFixed.vue';
import { useGetter, useState } from '@/common/store/helper';

export default defineComponent({
  name: 'ConfirmTrezorTransaction',
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
      type: Object as PropType<TrezorTxBuilder>,
      required: true,
    },
  },
  setup(props, context) {
    const txId = ref('');
    const rawTx = ref('');
    const typeSummary = TxStatusType.PEGIN;
    const orientationSummary = TxSummaryOrientation.HORIZONTAL;
    const environmentContext = EnvironmentContextProviderService.getEnvironmentContext();

    const pegInTxState = useState<PegInTxState>('pegInTx');
    const walletService = useGetter<WalletService>('pegInTx', constants.PEGIN_TX_GET_WALLET_SERVICE);
    const refundAddress = useGetter<string>('pegInTx', constants.PEGIN_TX_GET_REFUND_ADDRESS);
    const accountBalanceText = useGetter<string>('pegInTx', constants.PEGIN_TX_GET_ACCOUNT_BALANCE_TEXT);
    const safeFee = useGetter<SatoshiBig>('pegInTx', constants.PEGIN_TX_GET_SAFE_TX_FEE);

    async function toTrackId() {
      let txError = '';
      props.confirmTxState.send('loading');
      await walletService.value.stopAskingForBalance()
        .then(() => props.txBuilder.buildTx(pegInTxState.value.normalizedTx))
        .then((tx: TrezorTx) => walletService.value.sign(tx) as Promise<TrezorSignedTx>)
        .then((trezorSignedTx: TrezorSignedTx) => ApiService
          .broadcast(trezorSignedTx.payload.serializedTx))
        .then((id) => {
          txId.value = id;
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

    function cropAddress(address: string):string {
      return `${address.substr(0, 6)}...${address.substr(address.length - 6, address.length)}`;
    }

    function splitString(s: string): string[] {
      return s.match(/.{1,16}/g) ?? [];
    }

    const opReturnData = computed((): string => {
      const opReturnDataOutput = pegInTxState.value.normalizedTx.outputs[0] ?? { script_type: '' };
      return opReturnDataOutput.op_return_data
        ? `${opReturnDataOutput.op_return_data.substr(0, 45)}...`
        : 'OP_RETURN data not found';
    });

    const rskFederationAddress = computed(():string => pegInTxState.value.normalizedTx.outputs[1]?.address?.trim() ?? `${environmentContext.getBtcText()} Powpeg address not found`);

    const changeAddress = computed((): string => {
      const [, , change] = pegInTxState.value.normalizedTx.outputs;
      if (change && change.address) {
        return change.address;
      }
      return 'Change address not found';
    });

    const changeAmountComputed = computed((): string => {
      const changeAmount = new SatoshiBig(pegInTxState.value.normalizedTx.outputs[2]?.amount ?? 0, 'satoshi');
      return changeAmount.toBTCTrimmedString();
    });

    const computedFullAmount = computed((): string => {
      const changeAmount = new SatoshiBig(pegInTxState.value.normalizedTx.outputs[2]?.amount ?? 0, 'satoshi');
      return pegInTxState.value.amountToTransfer.plus(safeFee.value)
        .plus(changeAmount)
        .toBTCTrimmedString();
    });

    const confirmTrezorTxSummary = computed((): NormalizedSummary => ({
      amountFromString: pegInTxState.value.amountToTransfer.toBTCTrimmedString(),
      amountReceivedString: pegInTxState.value.amountToTransfer.toBTCTrimmedString(),
      fee: Number(safeFee.value.toBTCTrimmedString()),
      recipientAddress: pegInTxState.value.rskAddressSelected,
      refundAddress: refundAddress.value,
      selectedAccount: accountBalanceText.value,
      federationAddress: pegInTxState.value.peginConfiguration.federationAddress,
    }));

    // eslint-disable-next-line
    props.txBuilder.getUnsignedRawTx(pegInTxState.value.normalizedTx).then((tx) => rawTx.value = tx);

    return {
      environmentContext,
      changeAmountComputed,
      splitString,
      opReturnData,
      pegInTxState,
      rskFederationAddress,
      cropAddress,
      changeAddress,
      computedFullAmount,
      safeFee,
      confirmTrezorTxSummary,
      orientationSummary,
      typeSummary,
      rawTx,
      toPegInForm,
      toTrackId,
    };
  },
});
</script>
