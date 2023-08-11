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
    <v-row id="instructions-ledger" justify="center" class="mx-0">
      <v-col id="instruction-1" cols="3" xl="3">
        <v-row justify="center" class="mx-0">
          <v-img src="@/assets/exchange/rootstock_black.png" height="40" contain/>
        </v-row>
        <v-row class="mx-0 d-flex justify-center">
          <h4 class="text-center">
            <span class="number">1</span>
            Confirm on {{environmentContext.getRskText()}}
          </h4>
        </v-row>
      </v-col>
      <v-col id="instruction-2" cols="3" xl="3">
        <v-row justify="center" class="mx-0">
          <v-img src="@/assets/exchange/trezor/transfer.png" height="40" contain/>
        </v-row>
        <v-row class="mx-0 d-flex justify-center">
          <h4 class="text-center"><span class="number">2</span>Confirm funds transfer</h4>
        </v-row>
      </v-col>
      <v-col v-if="parseFloat(changeAmount) > 0" id="instruction-3" cols="3" xl="3">
        <v-row justify="center" class="mx-0">
          <v-img src="@/assets/exchange/trezor/change.png" height="40" contain/>
        </v-row>
        <v-row class="mx-0 d-flex justify-center">
          <h4 class="text-center"><span class="number">3</span>Confirm change address</h4>
        </v-row>
      </v-col>
      <v-col id="instruction-4" cols="3" xl="3">
        <v-row justify="center" class="mx-0">
          <v-img src="@/assets/exchange/trezor/fee.png" height="40" contain/>
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
    <v-row justify="center" class="mx-0">
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
  computed, PropType, ref, defineComponent,
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
      const changeAmount = new SatoshiBig(pegInTxState.value.normalizedTx.outputs[2]?.amount ?? 0, 'satoshi');
      return changeAmount.toBTCTrimmedString();
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
      context.emit('successConfirmation', [txError, txId]);
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

    // eslint-disable-next-line
    props.txBuilder?.getUnsignedRawTx(pegInTxState.value.normalizedTx).then((tx) => rawTx.value = tx);

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

//
// @Component({
//   components: {
//     TxSummaryFixed,
//     AdvancedData,
//   },
// })
// class ConfirmLedgerTransaction extends Vue {
//   txId = '';
//
//   rawTx = '';
//
//   typeSummary = TxStatusType.PEGIN;
//
//   orientationSummary = TxSummaryOrientation.HORIZONTAL;
//
//   @Prop() confirmTxState!: Machine<
//     'idle'
//     | 'loading'
//     | 'error'
//   >;
//
//   @Prop() txBuilder!: LedgerTxBuilder;
//
//   @State('pegInTx') pegInTxState!: PegInTxState;
//
//   @Getter(constants.PEGIN_TX_GET_SAFE_TX_FEE, { namespace: 'pegInTx' }) safeFee!: SatoshiBig;
//
//   @Action(constants.PEGIN_TX_STOP_ASKING_FOR_BALANCE, { namespace: 'pegInTx' }) stopAskingForBalance !: () => Promise<void>;
//
//   @Getter(constants.PEGIN_TX_GET_WALLET_SERVICE, { namespace: 'pegInTx' }) walletService!: WalletService;
//
//   @Getter(constants.PEGIN_TX_GET_REFUND_ADDRESS, { namespace: 'pegInTx' }) refundAddress!: string;
//
//   @Getter(constants.PEGIN_TX_GET_ACCOUNT_BALANCE_TEXT, { namespace: 'pegInTx' }) accountBalanceText!: string;
//
//   environmentContext = EnvironmentContextProviderService.getEnvironmentContext();
//
//   @Emit('successConfirmation')
//   async toTrackId() {
//     let txError = '';
//     this.confirmTxState.send('loading');
//     await this.walletService.isConnected()
//       .then((isConnected) => {
//         if (!isConnected) {
//           this.walletService.reconnect().then(() => this.walletService.stopAskingForBalance());
//         } else {
//           this.walletService.stopAskingForBalance();
//         }
//       })
//       .then(() => {
//         if (this.pegInTxState.selectedAccount) {
//           return this.txBuilder
//             .buildTx(this.pegInTxState.normalizedTx, this.pegInTxState.selectedAccount);
//         }
//         throw new Error('The account type is not set');
//       })
//       .then((ledgerTx: LedgerTx) => this.walletService.sign(ledgerTx) as Promise<LedgerSignedTx>)
//       .then((tx: LedgerSignedTx) => ApiService
//         .broadcast(tx.signedTx))
//       .then((txId) => {
//         this.txId = txId;
//       })
//       .catch((err) => {
//         this.confirmTxState.send('error');
//         switch (err.statusCode) {
//           case constants.LEDGER_STATUS_CODES.DEVICE_LOCKED:
//             txError = 'Please unlock your Ledger device.';
//             break;
//           case constants.LEDGER_STATUS_CODES.TRANSACTION_CANCELLED_BY_USER:
//             txError = 'Transaction cancelled by user.';
//             break;
//           case constants.LEDGER_STATUS_CODES.USER_EXITED_APP:
//             txError = 'Please access the correct app and try again.';
//             break;
//           default:
//             txError = err.message;
//             break;
//         }
//       });
//     return [txError, this.txId];
//   }
//
//   @Emit('toPegInForm')
//   toPegInForm() {
//     this.confirmTxState.send('loading');
//   }
//
//   // eslint-disable-next-line class-methods-use-this
//   cropAddress(address: string):string {
//     return `${address.substr(0, 6)}...${address.substr(address.length - 6, address.length)}`;
//   }
//
//   // eslint-disable-next-line class-methods-use-this
//   splitString(s: string): string[] {
//     return s.match(/.{1,16}/g) ?? [];
//   }
//
//   get rskFederationAddress():string {
//     return this.pegInTxState.normalizedTx.outputs[1]?.address?.trim() ?? `${this.environmentContext.getBtcText()} Powpeg address not found`;
//   }
//
//   get changeAddress(): string {
//     const [, , change] = this.pegInTxState.normalizedTx.outputs;
//     if (change && change.address) {
//       return change.address;
//     }
//     return 'Change address not found';
//   }
//
//   get changeAmount() {
//     const changeAmount = new SatoshiBig(this.pegInTxState.normalizedTx.outputs[2]?.amount ?? 0, 'satoshi');
//     return changeAmount.toBTCTrimmedString();
//   }
//
//   get confirmLedgerTxSummary(): NormalizedSummary {
//     return {
//       amountFromString: this.pegInTxState.amountToTransfer.toBTCTrimmedString(),
//       amountReceivedString: this.pegInTxState.amountToTransfer.toBTCTrimmedString(),
//       fee: Number(this.safeFee.toBTCTrimmedString()),
//       recipientAddress: this.pegInTxState.rskAddressSelected,
//       refundAddress: this.refundAddress,
//       selectedAccount: this.accountBalanceText,
//       federationAddress: this.pegInTxState.peginConfiguration.federationAddress,
//     };
//   }
//
//   async created() {
//     this.rawTx = await this.txBuilder.getUnsignedRawTx(this.pegInTxState.normalizedTx);
//   }
// }
</script>
