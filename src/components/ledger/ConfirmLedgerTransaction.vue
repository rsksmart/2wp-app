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
        Press <strong>sign</strong> when you finish.
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
      <v-col id="instruction-3" cols="3" xl="3">
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
          <h4 class="text-center"><span class="number">4</span>Confirm transaction fee</h4>
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
            Amount: {{txData.amount.toBTCTrimmedString()}}
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
      <v-col cols="3" >
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
            Fees: {{txData.feeBTC.toBTCTrimmedString()}}
          </v-row>
          <v-row justify="center" class="mt-5 mb-3 mx-0">Accept and send</v-row>
        </fieldset>
      </v-col>
    </v-row>
    <v-divider/>
    <v-row class="mx-0 my-8">
      <tx-summary :txData="txData" :price="price" :showTxId="false" :initial-expand="true"
                  :rskFederationAddress="rskFederationAddress"/>
    </v-row>
    <v-row class="mx-0 my-8">
      <advanced-data :rawTx="rawTx" :initial-expand="false"/>
    </v-row>
    <v-row v-if="confirmTxState.matches(['idle', 'error', 'goingHome'])" class="ma-0">
      <v-col cols="2" class="d-flex justify-start ma-0 py-0">
        <v-btn rounded outlined color="#00B520" width="110" @click="backHome"
               :disabled="confirmTxState.matches(['error', 'goingHome', 'loading'])">
          <span>Go home</span>
        </v-btn>
      </v-col>
      <v-col cols="10" class="d-flex justify-end ma-0 py-0">
        <v-btn rounded color="#00B520" width="110" @click="toTrackId"
               :disabled="confirmTxState.matches(['error', 'goingHome', 'loading'])">
          <span class="whiteish">Sign</span>
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
    <template v-if="showUnverifiedInputsDialog">
      <unverified-inputs-dialog :showDialog="showUnverifiedInputsDialog"/>
    </template>
  </div>
</template>

<script lang="ts">
import {
  Component, Emit, Prop,
  Vue,
} from 'vue-property-decorator';
import { Action } from 'vuex-class';
import { NormalizedTx, TxData } from '@/types';
import TxSummary from '@/components/exchange/TxSummary.vue';
import ApiService from '@/services/ApiService';
import UnverifiedInputsDialog from '@/components/ledger/UnverifiedInputsDialog.vue';
import AdvancedData from '@/components/exchange/AdvancedData.vue';
import * as constants from '@/store/constants';
import SatoshiBig from '@/types/SatoshiBig';
import LedgerTxBuilder from '@/middleware/TxBuilder/LedgerTxBuilder';
import { WalletService } from '@/services/WalletService';
import { Machine } from '@/services/utils';
import EnvironmentContextProviderService from '@/providers/EnvironmentContextProvider';

@Component({
  components: {
    TxSummary,
    UnverifiedInputsDialog,
    AdvancedData,
  },
})
export default class ConfirmLedgerTransaction extends Vue {
  txId = '';

  txError = '';

  confirmTxState: Machine<
    'idle'
    | 'loading'
    | 'error'
    | 'goingHome'
    > = new Machine('idle');

  rawTx = '';

  @Prop() tx!: NormalizedTx;

  @Prop() txBuilder!: LedgerTxBuilder;

  @Prop() walletService!: WalletService;

  @Prop() txData!: TxData;

  @Prop() price!: number;

  environmentContext = EnvironmentContextProviderService.getEnvironmentContext();

  @Action(constants.PEGIN_TX_CLEAR_SESSION_ID, { namespace: 'pegInTx' }) clearSessionId !: () => void;

  get showUnverifiedInputsDialog() {
    return this.txBuilder.accountType === constants.BITCOIN_SEGWIT_ADDRESS && this.confirmTxState.matches(['loading']);
  }

  @Emit('successConfirmation')
  async toTrackId() {
    this.confirmTxState.send('loading');
    await this.walletService.stopAskingForBalance()
      .then(() => this.txBuilder.buildTx())
      .then(() => this.txBuilder.sign())
      .then((tx) => ApiService
        .broadcast(tx.signedTx))
      .then((txId) => {
        this.txId = txId;
        this.clearSessionId();
      })
      .catch((err) => {
        this.confirmTxState.send('error');
        if (err.statusCode === 27013) {
          this.txError = 'Transaction cancelled by user.';
        } else {
          this.txError = err.message;
        }
      });
    return [this.txError, this.txId];
  }

  backHome() {
    this.confirmTxState.send('goingHome');
    this.$router.go(0);
  }

  @Emit('toPegInForm')
  async toPegInForm() {
    this.confirmTxState.send('loading');
    return 'SendBitcoinForm';
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
    return this.tx?.outputs[1]?.address?.trim() ?? `${this.environmentContext.getBtcText()} Powpeg address not found`;
  }

  get changeAddress(): string {
    return this.txBuilder.changeAddress !== ''
      ? this.txBuilder.changeAddress
      : 'Change address not found';
  }

  get changeAmount() {
    const changeAmount = new SatoshiBig(this.tx?.outputs[2]?.amount ?? 0, 'satoshi');
    return changeAmount.toBTCTrimmedString();
  }

  async created() {
    this.rawTx = await this.txBuilder.getUnsignedRawTx();
  }
}
</script>
