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
          <v-img src="@/assets/exchange/rootstock_black.png" height="40" contain/>
        </v-row>
        <v-row class="mx-0 d-flex justify-center">
          <h4 class="text-center">
          <div class="number">1</div>Confirm on {{environmentContext.getRskText()}}</h4>
        </v-row>
      </v-col>
      <v-col cols="3">
        <v-row class="mx-0">
          <v-img src="@/assets/exchange/trezor/transfer.png" height="40" contain/>
        </v-row>
        <v-row class="mx-0 d-flex justify-center">
          <h4 class="text-center"><div class="number">2</div>Confirm funds transfer</h4>
        </v-row>
      </v-col>
      <v-col v-if="parseFloat(changeAmount) > 0" cols="3">
        <v-row class="mx-0">
          <v-img src="@/assets/exchange/trezor/change.png" height="40" contain/>
        </v-row>
        <v-row class="mx-0 d-flex justify-center">
          <h4 class="text-center"><div class="number">3</div>Confirm change address</h4>
        </v-row>
      </v-col>
      <v-col cols="3">
        <v-row class="mx-0">
          <v-img src="@/assets/exchange/trezor/fee.png" height="40" contain/>
        </v-row>
        <v-row class="mx-0 d-flex justify-center">
          <h4 class="text-center">
            <div class="number">
              {{ parseFloat(changeAmount) > 0 ? 4 : 3 }}
            </div>
            Confirm transaction fee
          </h4>
        </v-row>
      </v-col>
    </v-row>
    <v-row justify="center" class="mx-0">
      <v-col cols="3">
        <fieldset class="confirmation-box">
          <legend align="center" class="px-4">See on Trezor</legend>
          <v-row justify="center" class="mt-5 mx-0"><span>Confirm</span></v-row>
          <v-row justify="center" align="start" class="mt-5 mx-0 text-center">
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
          <legend align="center" class="px-4">See on Trezor</legend>
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
      <v-col v-if="parseFloat(changeAmount) > 0" cols="3">
        <fieldset class="confirmation-box">
          <legend align="center" class="px-4">See on Trezor</legend>
          <v-row justify="center" class="mt-5 mx-0">Confirm sending</v-row>
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
          <v-row justify="center" class="mt-5 mb-3 mx-0">Confirm</v-row>
        </fieldset>
      </v-col>
      <v-col cols="3">
        <fieldset class="confirmation-box">
          <legend align="center" class="px-4">See on Trezor</legend>
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
  Component, Emit, Prop,
  Vue,
} from 'vue-property-decorator';
import { Getter, State, Action } from 'vuex-class';
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

@Component({
  components: {
    TxSummaryFixed,
    AdvancedData,
  },
})
export default class ConfirmTrezorTransaction extends Vue {
  scriptTag?: HTMLScriptElement;

  txId = '';

  rawTx = '';

  typeSummary = TxStatusType.PEGIN;

  orientationSummary = TxSummaryOrientation.HORIZONTAL;

  @Prop() confirmTxState!: Machine<
    'idle'
    | 'loading'
    | 'error'
    | 'goingHome'
  >;

  @Prop() txBuilder!: TrezorTxBuilder;

  @State('pegInTx') pegInTxState!: PegInTxState;

  @Action(constants.PEGIN_TX_STOP_ASKING_FOR_BALANCE, { namespace: 'pegInTx' }) stopAskingForBalance !: () => Promise<void>;

  @Getter(constants.PEGIN_TX_GET_SAFE_TX_FEE, { namespace: 'pegInTx' }) safeFee!: SatoshiBig;

  @Getter(constants.PEGIN_TX_GET_WALLET_SERVICE, { namespace: 'pegInTx' }) walletService!: WalletService;

  @Getter(constants.PEGIN_TX_GET_REFUND_ADDRESS, { namespace: 'pegInTx' }) refundAddress!: string;

  @Getter(constants.PEGIN_TX_GET_ACCOUNT_BALANCE_TEXT, { namespace: 'pegInTx' }) accountBalanceText!: string;

  environmentContext = EnvironmentContextProviderService.getEnvironmentContext();

  @Emit('successConfirmation')
  async toTrackId() {
    let txError = '';
    this.confirmTxState.send('loading');
    await this.walletService.stopAskingForBalance()
      .then(() => this.txBuilder.buildTx(this.pegInTxState.normalizedTx))
      .then((tx: TrezorTx) => this.walletService.sign(tx) as Promise<TrezorSignedTx>)
      .then((trezorSignedTx: TrezorSignedTx) => ApiService
        .broadcast(trezorSignedTx.payload.serializedTx))
      .then((txId) => {
        this.txId = txId;
      })
      .catch((err) => {
        this.confirmTxState.send('error');
        txError = err.message;
      });
    return [txError, this.txId];
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

  get confirmTrezorTxSummary(): NormalizedSummary {
    return {
      amountFromString: this.pegInTxState.amountToTransfer.toBTCTrimmedString(),
      amountReceivedString: this.pegInTxState.amountToTransfer.toBTCTrimmedString(),
      fee: Number(this.safeFee.toBTCTrimmedString()),
      recipientAddress: this.pegInTxState.rskAddressSelected,
      refundAddress: this.refundAddress,
      selectedAccount: this.accountBalanceText,
      federationAddress: this.pegInTxState.peginConfiguration.federationAddress,
    };
  }

  async created() {
    this.rawTx = await this.txBuilder.getUnsignedRawTx(this.pegInTxState.normalizedTx);
  }

  beforeMount() {
    const amountFromString = this.pegInTxState.amountToTransfer.toBTCTrimmedString();
    this.scriptTag = document.createElement('script');
    this.scriptTag.type = 'text/javascript';
    this.scriptTag.text = 'clarity("set", "pegin_using_trezor", "1");';
    this.scriptTag.text = `clarity("set", "pegin_using_trezor_value", "${amountFromString}");`;
    document.body.appendChild(this.scriptTag);
  }
}
</script>
