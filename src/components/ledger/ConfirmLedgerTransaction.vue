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
          <v-img src="@/assets/exchange/trezor/rsk.png" height="40" contain/>
        </v-row>
        <v-row class="mx-0 d-flex justify-center">
          <h4 class="text-center">
            <span class="number">1</span>
            Confirm {{environmentContext.getRskText()}} information
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
          <legend align="center" class="px-4">See on Ledger</legend>
          <v-row justify="center" class="mt-5 mx-0 text-center">Review output #1</v-row>
          <v-row justify="center" class="mt-5 mx-0 text-center">Amount: 0</v-row>
          <v-row justify="center" align="start" class="mt-5 mx-0 text-center" >
            <span>
              OP_RETURN
            </span>
            <v-tooltip right>
              <template v-slot:activator="{ on, attrs }">
                <v-icon small color="black" v-bind="attrs" v-on="on" class="ml-2">
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
          <legend align="center" class="px-4">See on Ledger</legend>
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
          <legend align="center" class="px-4">See on Ledger</legend>
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
          <legend align="center" class="px-4">See on Ledger</legend>
          <v-row justify="center" class="mt-5 mx-0 text-center">Confirm transaction</v-row>
          <v-row justify="center" class="mt-5 mx-0 text-center" >
            Fees: {{safeFee.toBTCTrimmedString()}}
          </v-row>
          <v-row justify="center" class="mt-5 mb-3 mx-0">Accept and send</v-row>
        </fieldset>
      </v-col>
    </v-row>
    <v-divider/>
    <v-row class="mx-0 my-8">
      <tx-summary :initial-expand="true"/>
    </v-row>
    <v-row class="mx-0 my-8">
      <advanced-data :rawTx="rawTx" :initial-expand="false"/>
    </v-row>
    <v-row v-if="confirmTxState.matches(['idle', 'error', 'goingHome'])" class="ma-0">
      <v-col cols="2" class="d-flex justify-start ma-0 py-0">
        <v-btn rounded outlined color="#00B520" width="110" @click="toPegInForm"
               :disabled="confirmTxState.matches(['error', 'goingHome', 'loading'])">
          <span>Back</span>
        </v-btn>
      </v-col>
      <v-col cols="10" class="d-flex justify-end ma-0 py-0">
        <v-btn rounded color="#00B520" width="110" @click="toTrackId"
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
          <v-progress-circular indeterminate :size="60" :width="8" color="#00B520" />
        </v-row>
      </v-col>
    </v-row>
  </div>
</template>

<script lang="ts">
import {
  Component, Emit, Prop,
  Vue,
} from 'vue-property-decorator';
import { Getter, State, Action } from 'vuex-class';
import {
  LedgerTx, LedgerSignedTx,
} from '@/types';
import TxSummary from '@/components/exchange/TxSummary.vue';
import ApiService from '@/services/ApiService';
import AdvancedData from '@/components/exchange/AdvancedData.vue';
import SatoshiBig from '@/types/SatoshiBig';
import LedgerTxBuilder from '@/middleware/TxBuilder/LedgerTxBuilder';
import { WalletService } from '@/services';
import { Machine } from '@/services/utils';
import EnvironmentContextProviderService from '@/providers/EnvironmentContextProvider';
import { PegInTxState } from '@/types/pegInTx';
import * as constants from '@/store/constants';

@Component({
  components: {
    TxSummary,
    AdvancedData,
  },
})
export default class ConfirmLedgerTransaction extends Vue {
  txId = '';

  rawTx = '';

  @Prop() confirmTxState!: Machine<
    'idle'
    | 'loading'
    | 'error'
  >;

  @Prop() txBuilder!: LedgerTxBuilder;

  @State('pegInTx') pegInTxState!: PegInTxState;

  @Getter(constants.PEGIN_TX_GET_SAFE_TX_FEE, { namespace: 'pegInTx' }) safeFee!: SatoshiBig;

  @Action(constants.PEGIN_TX_STOP_ASKING_FOR_BALANCE, { namespace: 'pegInTx' }) stopAskingForBalance !: () => Promise<void>;

  @Getter(constants.PEGIN_TX_GET_WALLET_SERVICE, { namespace: 'pegInTx' }) walletService!: WalletService;

  environmentContext = EnvironmentContextProviderService.getEnvironmentContext();

  @Emit('successConfirmation')
  async toTrackId() {
    let txError = '';
    this.confirmTxState.send('loading');
    await this.walletService.isConnected()
      .then((isConnected) => {
        if (!isConnected) {
          this.walletService.reconnect().then(() => this.walletService.stopAskingForBalance());
        } else {
          this.walletService.stopAskingForBalance();
        }
      })
      .then(() => {
        if (this.pegInTxState.selectedAccount) {
          return this.txBuilder
            .buildTx(this.pegInTxState.normalizedTx, this.pegInTxState.selectedAccount);
        }
        throw new Error('The account type is not set');
      })
      .then((ledgerTx: LedgerTx) => this.walletService.sign(ledgerTx) as Promise<LedgerSignedTx>)
      .then((tx: LedgerSignedTx) => ApiService
        .broadcast(tx.signedTx))
      .then((txId) => {
        this.txId = txId;
      })
      .catch((err) => {
        this.confirmTxState.send('error');
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
    return [txError, this.txId];
  }

  @Emit('toPegInForm')
  toPegInForm() {
    this.confirmTxState.send('loading');
  }

  // eslint-disable-next-line class-methods-use-this
  cropAddress(address: string):string {
    return `${address.substr(0, 6)}...${address.substr(address.length - 6, address.length)}`;
  }

  // eslint-disable-next-line class-methods-use-this
  splitString(s: string): string[] {
    return s.match(/.{1,16}/g) ?? [];
  }

  get rskFederationAddress():string {
    return this.pegInTxState.normalizedTx.outputs[1]?.address?.trim() ?? `${this.environmentContext.getBtcText()} Powpeg address not found`;
  }

  get changeAddress(): string {
    const [, , change] = this.pegInTxState.normalizedTx.outputs;
    if (change && change.address) {
      return change.address;
    }
    return 'Change address not found';
  }

  get changeAmount() {
    const changeAmount = new SatoshiBig(this.pegInTxState.normalizedTx.outputs[2]?.amount ?? 0, 'satoshi');
    return changeAmount.toBTCTrimmedString();
  }

  async created() {
    this.rawTx = await this.txBuilder.getUnsignedRawTx(this.pegInTxState.normalizedTx);
  }
}
</script>
