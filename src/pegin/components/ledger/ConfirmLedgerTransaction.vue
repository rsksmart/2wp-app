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
        on the Ledger device are correct.
        <br>
        To prevent malware attacks, double-check the address with the recipient.
        <br>
        Press <strong>Send</strong> when you finish.
      </p>
    </v-row>
    <v-row id="instructions-ledger" justify="center" class="ma-0">
      <v-col id="instruction-1" cols="3" xl="3">
        <v-row justify="center" class="ma-0">
          <v-img :src="require('@/assets/exchange/rootstock_black.png')" height="40" contain/>
        </v-row>
        <v-row class="mx-0 d-flex justify-center">
          <h4 class="text-center">
            <span class="number">1</span>
            Confirm on {{environmentContext.getRskText()}}
          </h4>
        </v-row>
      </v-col>
      <v-col id="instruction-2" cols="3" xl="3">
        <v-row justify="center" class="ma-0">
          <v-img :src="require('@/assets/exchange/trezor/transfer.png')" height="40" contain/>
        </v-row>
        <v-row class="mx-0 d-flex justify-center">
          <h4 class="text-center"><span class="number">2</span>Confirm funds transfer</h4>
        </v-row>
      </v-col>
      <v-col v-if="parseFloat(changeAmount) > 0" id="instruction-3" cols="3" xl="3">
        <v-row justify="center" class="ma-0">
          <v-img :src="require('@/assets/exchange/trezor/change.png')" height="40" contain/>
        </v-row>
        <v-row class="mx-0 d-flex justify-center">
          <h4 class="text-center"><span class="number">3</span>Confirm change address</h4>
        </v-row>
      </v-col>
      <v-col id="instruction-4" cols="3" xl="3">
        <v-row justify="center" class="ma-0">
          <v-img :src="require('@/assets/exchange/trezor/fee.png')" height="40" contain/>
        </v-row>
        <v-row class="mx-0 d-flex justify-center">
          <h4 class="text-center">
            <span class="number">
              {{ parseFloat(changeAmount) > 0 ? 4 : 3 }}
            </span>
            Confirm transaction fee
          </h4>
        </v-row>
      </v-col>
    </v-row>
    <v-row justify="center" class="ma-0">
      <v-col cols="3" >
        <fieldset class="confirmation-box">
          <legend class="px-4">See on Ledger</legend>
          <v-row justify="center" class="mt-5 mx-0 text-center">Review output #1</v-row>
          <v-row justify="center" class="mt-5 mx-0 text-center">Amount: 0</v-row>
          <v-row justify="center" align="start" class="mt-5 mx-0 text-center" >
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
                The OP_RETURN is an output with information required for the
                {{environmentContext.getRskText()}} network.
              </p>
            </v-tooltip>
          </v-row>
          <v-row justify="center" class="mt-5 mb-3 mx-0">Accept</v-row>
        </fieldset>
      </v-col>
      <v-col cols="3" >
        <fieldset class="confirmation-box">
          <legend class="px-4">See on Ledger</legend>
          <v-row justify="center" class="mt-5 mx-0 text-center">Review output #2</v-row>
          <v-row justify="center" class="mt-5 mx-0 text-center">
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
          <v-row justify="center" class="mt-5 mb-3 mx-0">Accept</v-row>
        </fieldset>
      </v-col>
      <v-col v-if="parseFloat(changeAmount) > 0" cols="3" >
        <fieldset class="confirmation-box">
          <legend class="px-4">See on Ledger</legend>
          <v-row justify="center" class="mt-5 mx-0 text-center">Review output #3</v-row>
          <v-row justify="center" class="mt-5 mx-0 text-center">Amount: {{changeAmount}}</v-row>
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
          <v-row justify="center" class="mt-5 mb-3 mx-0">Accept</v-row>
        </fieldset>
      </v-col>
      <v-col cols="3" >
        <fieldset class="confirmation-box">
          <legend class="px-4">See on Ledger</legend>
          <v-row justify="center" class="mt-5 mx-0 text-center">Confirm transaction</v-row>
          <v-row justify="center" class="mt-5 mx-0 text-center" >
            Fees: {{safeFee.toBTCTrimmedString()}}
          </v-row>
          <v-row justify="center" class="mt-4 mx-0 text-center">
            Please make sure to check that the fee this transaction is paying
            is along your expectations.
          </v-row>
          <v-row justify="center" class="mt-5 mb-3 mx-0">Accept and send</v-row>
        </fieldset>
      </v-col>
    </v-row>
    <v-divider/>
    <v-row class="mx-0 my-8">
        <tx-summary-fixed
          :summary="confirmLedgerTxSummary"
          :initialExpand="true"
          :type='typeSummary'
          :orientation='orientationSummary'/>
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
          See your Ledger device to confirm your transaction!
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
  computed, PropType, ref, defineComponent, onBeforeMount,
} from 'vue';
import {
  LedgerTx, LedgerSignedTx, NormalizedSummary,
} from '@/common/types';
import ApiService from '@/common/services/ApiService';
import SatoshiBig from '@/common/types/SatoshiBig';
import LedgerTxBuilder from '@/pegin/middleware/TxBuilder/LedgerTxBuilder';
import { WalletService } from '@/common/services';
import { Machine } from '@/common/utils';
import EnvironmentContextProviderService from '@/common/providers/EnvironmentContextProvider';
import { PegInTxState } from '@/common/types/pegInTx';
import * as constants from '@/common/store/constants';
import { TxStatusType } from '@/common/types/store';
import { TxSummaryOrientation } from '@/common/types/Status';
import TxSummaryFixed from '@/common/components/exchange/TxSummaryFixed.vue';
import { useGetter, useState } from '@/common/store/helper';
import AdvancedData from '@/common/components/exchange/AdvancedData.vue';

export default defineComponent({
  name: 'ConfirmLedgerTransaction',
  components: {
    TxSummaryFixed,
    AdvancedData,
  },
  props: {
    confirmTxState: {
      type: Object as PropType<Machine< 'idle' | 'loading' | 'error' >>,
      required: true,
    },
    txBuilder: Object as PropType<LedgerTxBuilder>,
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

    const rskFederationAddress = computed(():string => pegInTxState.value.normalizedTx.outputs[1]?.address?.trim() ?? `${environmentContext.getBtcText()} Powpeg address not found`);

    const changeAddress = computed((): string => {
      const [, , change] = pegInTxState.value.normalizedTx.outputs;
      if (change && change.address) {
        return change.address;
      }
      return 'Change address not found';
    });

    const changeAmount = computed(() => {
      const changeAmountInSB = new SatoshiBig(pegInTxState.value.normalizedTx.outputs[2]?.amount ?? 0, 'satoshi');
      return changeAmountInSB.toBTCTrimmedString();
    });

    const confirmLedgerTxSummary = computed((): NormalizedSummary => ({
      amountFromString: pegInTxState.value.amountToTransfer.toBTCTrimmedString(),
      amountReceivedString: pegInTxState.value.amountToTransfer.toBTCTrimmedString(),
      fee: Number(safeFee.value.toBTCTrimmedString()),
      recipientAddress: pegInTxState.value.rskAddressSelected,
      refundAddress: refundAddress.value,
      selectedAccount: accountBalanceText.value,
      federationAddress: pegInTxState.value.peginConfiguration.federationAddress,
    }));

    async function toTrackId() {
      let txError = '';
      props.confirmTxState?.send('loading');
      await walletService.value.isConnected()
        .then((isConnected) => {
          if (!isConnected) {
            walletService.value.reconnect().then(() => walletService.value.stopAskingForBalance());
          } else {
            walletService.value.stopAskingForBalance();
          }
        })
        .then(() => {
          if (pegInTxState.value.selectedAccount && props.txBuilder) {
            return props.txBuilder
              .buildTx(pegInTxState.value.normalizedTx, pegInTxState.value.selectedAccount);
          }
          throw new Error('The account type is not set');
        })
        .then((ledgerTx: LedgerTx) => walletService.value.sign(ledgerTx) as Promise<LedgerSignedTx>)
        .then((tx: LedgerSignedTx) => ApiService
          .broadcast(tx.signedTx))
        .then((id) => {
          txId.value = id;
        })
        .catch((err) => {
          props.confirmTxState?.send('error');
          switch (err.statusCode) {
            case constants.LEDGER_STATUS_CODES.DEVICE_LOCKED:
              txError = 'Please unlock your Ledger device.';
              break;
            case constants.LEDGER_STATUS_CODES.TRANSACTION_CANCELLED_BY_USER:
              txError = 'Transaction cancelled by user.';
              break;
            case constants.LEDGER_STATUS_CODES.USER_EXITED_APP:
              txError = 'Please access the correct app and try again.';
              break;
            default:
              txError = err.message;
              break;
          }
        });
      context.emit('successConfirmation', [txError, txId.value]);
    }

    function toPegInForm() {
      props.confirmTxState?.send('loading');
      context.emit('toPegInForm');
    }

    function cropAddress(address: string):string {
      return `${address.substr(0, 6)}...${address.substr(address.length - 6, address.length)}`;
    }

    function splitString(s: string): string[] {
      return s.match(/.{1,16}/g) ?? [];
    }

    function appendClarityScript():void {
      const amountFromString = pegInTxState.value.amountToTransfer.toBTCTrimmedString();
      const vueAppClarityId = 'ibn9mzxbfg';
      const scriptTag:HTMLScriptElement = document.createElement('script');
      scriptTag.type = 'text/javascript';
      scriptTag.text = '(function(c,l,a,r,i,t,y){'
        + 'c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};'
        + 't=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;'
        + 'y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);'
        + `})(window, document, 'clarity', 'script', '${vueAppClarityId}');`;
      scriptTag.text = 'clarity("set", "pegin_using_ledger", "1");';
      scriptTag.text = `clarity("set", "pegin_using_ledger_value", "${amountFromString}");`;
      document.body.appendChild(scriptTag);
    }

    onBeforeMount(appendClarityScript);

    props.txBuilder?.getUnsignedRawTx(pegInTxState.value.normalizedTx)
      .then((tx: string) => {
        rawTx.value = tx;
      });

    return {
      environmentContext,
      changeAmount,
      pegInTxState,
      splitString,
      rskFederationAddress,
      cropAddress,
      changeAddress,
      safeFee,
      confirmLedgerTxSummary,
      typeSummary,
      orientationSummary,
      rawTx,
      toPegInForm,
      toTrackId,
    };
  },
});
</script>
