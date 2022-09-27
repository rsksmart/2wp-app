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
        Press <strong>sign</strong> when you finish.
      </p>
    </v-row>
    <v-row id="instructions-trezor" justify="center" class="mx-0">
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
    <v-row justify="center" class="mx-0">
       <v-col cols="4">
      </v-col>
      <v-col cols="4">
        <fieldset class="confirmation-box">
          <legend align="center" class="px-4">See on liquality</legend>
          <v-row justify="left" class="mt-5 mx-3 line-box-bottom">
            <v-col cols="3" class="d-flex flex-column align-left px-0">
              <h3>
                {{
                this.pegInTxState.normalizedTx.outputs[0].amount
                + ' ' +
                environmentContext.getBtcTicker()
                }}
              </h3>
            </v-col>
            <v-col cols="1" class="d-flex flex-column align-left">
              <v-tooltip right>
                <template v-slot:activator="{ on, attrs }">
                  <v-icon
                    small
                    class="icon-left"
                    color="teal darken-2"
                    v-bind="attrs"
                    v-on="on"
                  >
                    mdi-information
                  </v-icon>
                </template>
                <p class="tooltip-form mb-0">
                 This output only contains metadata required by
                 RSK to process the peg-in, therefore it doesn't
                 include any value.
                </p>
              </v-tooltip>
            </v-col>
          </v-row>

           <v-row justify="left" class="mx-3 line-box-bottom">
            <v-col class="pa-0 pb-2 d-flex flex-column align-left">
              <span class="breakable-address my-5">
                {{ this.pegInTxState.normalizedTx.outputs[1].address }}
              </span>
              <h3>
                {{ this.pegInTxState.normalizedTx.outputs[1].amount +
                ' '
                + environmentContext.getBtcTicker()
                }}
              </h3>
            </v-col>
          </v-row>

          <v-row v-if="this.pegInTxState.normalizedTx.outputs[2]"
          justify="left" class="mx-3 line-box-bottom">
            <v-col class="pa-0 pb-4 d-flex flex-column align-left">
              <span class="breakable-address my-5">
                {{ this.pegInTxState.normalizedTx.outputs[2].address }}
              </span>
              <div class="d-flex">
                <div class="liquality-info-container">
                  <h3>
                    {{ this.pegInTxState.normalizedTx.outputs[2].amount +
                    ' '
                    + environmentContext.getBtcTicker()
                    }}
                  </h3>
                </div>
                <div class="liquality-info-container">
                  <span class="chip">
                    My Wallet
                  </span>
                </div>
              </div>
            </v-col>
          </v-row>

          <v-row justify="left" class="mx-5 my-3">
            <v-col class="pa-0 pb-2 d-flex flex-column align-left">
              <span class="grayish">
                Fee: {{ fee + ' ' + environmentContext.getBtcTicker() }}
              </span>
            </v-col>
          </v-row>
        </fieldset>
      </v-col>
      <v-col cols="4">
      </v-col>
    </v-row>
    <v-divider/>
    <v-row class="mx-0 my-8">
      <tx-summary :showTxId="false" :initial-expand="true"/>
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
          See Liquality wallet to confirm your transaction!
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
  LiqualitySignedTx,
  LiqualityTx,
  LiqualityError,
} from '@/types';
import TxSummary from '@/components/exchange/TxSummary.vue';
import ApiService from '@/services/ApiService';
import SatoshiBig from '@/types/SatoshiBig';
import AdvancedData from '@/components/exchange/AdvancedData.vue';
import { WalletService } from '@/services';
import { Machine } from '@/services/utils';
import EnvironmentContextProviderService from '@/providers/EnvironmentContextProvider';
import { PegInTxState } from '@/types/pegInTx';
import * as constants from '@/store/constants';
import LiqualityTxBuilder from '@/middleware/TxBuilder/LiqualityTxBuilder';

@Component({
  components: {
    TxSummary,
    AdvancedData,
  },
})
export default class ConfirmLiqualityTransaction extends Vue {
  txId = '';

  rawTx = '';

  showErrorDialog = false;

  showTxErrorDialog = false;

  deviceError = 'test';

  errorType = '';

  urlToMoreInformation = '';

  messageToUserOnLink = '';

  @Prop() confirmTxState!: Machine<
    'idle'
    | 'loading'
    | 'error'
    | 'goingHome'
    >;

  VALUE_INCOMPLETE_MESSAGE = 'Not Found';

  @Prop() txBuilder!: LiqualityTxBuilder;

  @State('pegInTx') pegInTxState!: PegInTxState;

  @Action(constants.PEGIN_TX_STOP_ASKING_FOR_BALANCE, { namespace: 'pegInTx' }) stopAskingForBalance !: () => Promise<void>;

  @Getter(constants.PEGIN_TX_GET_SAFE_TX_FEE, { namespace: 'pegInTx' }) safeFee!: SatoshiBig;

  @Getter(constants.PEGIN_TX_GET_WALLET_SERVICE, { namespace: 'pegInTx' }) walletService!: WalletService;

  environmentContext = EnvironmentContextProviderService.getEnvironmentContext();

  @Emit('successConfirmation')
  async toTrackId() {
    let txError = '';
    try {
      this.confirmTxState.send('loading');
      const connected = await this.walletService.isConnected();
      if (!connected) {
        await this.walletService.reconnect();
      }
      await this.walletService.stopAskingForBalance()
        .then(() => this.txBuilder.buildTx(this.pegInTxState.normalizedTx))
        .then((tx: LiqualityTx) => this.walletService.sign(tx) as Promise<LiqualitySignedTx>)
        .then((liqualitySignedTx: LiqualitySignedTx) => ApiService
          .broadcast(liqualitySignedTx.signedTx))
        .then((txId) => {
          this.txId = txId;
        }, () => {
          const error = new LiqualityError();
          error.message = 'Liquality is closed or Account is not selected';
          throw error;
        })
        .catch((err) => {
          this.confirmTxState.send('error');
          txError = err.message;
        });
      return [txError, this.txId];
    } catch (e) {
      const error = new LiqualityError();
      return [error.message, this.txId, error.urlToMoreInformation,
        error.errorType, error.messageToUserOnLink];
    }
  }

  get feeBTC():SatoshiBig {
    return this.safeFee;
  }

  get fee(): string {
    if (!this.feeBTC) return this.VALUE_INCOMPLETE_MESSAGE;
    return this.feeBTC.toBTCString();
  }

  backHome() {
    this.confirmTxState.send('goingHome');
    this.$router.go(0);
  }

  @Emit('toPegInForm')
  async toPegInForm() {
    this.confirmTxState.send('loading');
    return 'PegInForm';
  }

  // eslint-disable-next-line class-methods-use-this
  cropAddress(address: string):string {
    return `${address.substr(0, 6)}...${address.substr(address.length - 6, address.length)}`;
  }

  // eslint-disable-next-line class-methods-use-this
  splitString(s: string): string[] {
    return s.match(/.{1,16}/g) ?? [];
  }

  get opReturnData(): string {
    const opReturnDataOutput = this.pegInTxState.normalizedTx.outputs[0] ?? { script_type: '' };
    return opReturnDataOutput.op_return_data
      ? `${opReturnDataOutput.op_return_data.substr(0, 45)}...`
      : 'OP_RETURN data not found';
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

  get changeAmount(): string {
    const changeAmount = new SatoshiBig(this.pegInTxState.normalizedTx.outputs[2]?.amount ?? 0, 'satoshi');
    return changeAmount.toBTCTrimmedString();
  }

  get computedFullAmount(): string {
    const changeAmount = new SatoshiBig(this.pegInTxState.normalizedTx.outputs[2]?.amount ?? 0, 'satoshi');
    return this.pegInTxState.amountToTransfer.plus(this.safeFee)
      .plus(changeAmount)
      .toBTCTrimmedString();
  }

  async created() {
    this.rawTx = await this.txBuilder.getUnsignedRawTx(this.pegInTxState.normalizedTx);
  }
}
</script>
