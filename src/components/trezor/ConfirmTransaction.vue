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
        Press <strong>sign</strong> when you finish.
      </p>
    </v-row>
    <v-row id="instructions-trezor" justify="center" class="mx-0">
      <v-col cols="3">
        <v-row class="mx-0 d-flex justify-center">
          <v-img src="@/assets/exchange/trezor/rsk.png" height="40" contain/>
        </v-row>
        <v-row class="mx-0 d-flex justify-center">
          <h4 class="text-center"><div class="number">1</div>Confirm RSK information</h4>
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
      <v-col cols="3">
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
          <h4 class="text-center"><div class="number">4</div>Confirm Transaction Fee</h4>
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
                The OP_RETURN is an output with information required for the RSK network.
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
          <v-row justify="center" class="mt-5 mb-3 mx-0">Confirm</v-row>
        </fieldset>
      </v-col>
      <v-col cols="3">
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
            Fee: {{txData.feeBTC.toBTCTrimmedString()}}
          </v-row>
          <v-row justify="center" class="mt-5 mb-3 mx-0">Confirm</v-row>
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
    <v-row class="ma-0 d-flex justify-center">
      <v-col cols="4" class="ma-0 d-flex align-center">
        <v-col cols="6" class="d-flex justify-center ma-0 pa-0">
          <v-btn v-if="confirmTxState === 'idle' || confirmTxState === 'error'"
                 rounded outlined color="#00B520" width="110" @click="toPegInForm">
            <span>Back</span>
          </v-btn>
        </v-col>
        <v-col cols="6" class="d-flex justify-center ma-0 pa-0">
          <v-btn v-if="confirmTxState === 'idle' || confirmTxState === 'error'"
                 rounded color="#00B520" width="110" @click="toTrackId"
                 :disabled="confirmTxState === 'error'">
            <span class="whiteish">Sign</span>
          </v-btn>
        </v-col>
      </v-col>
    </v-row>
    <v-row class="mx-0 d-flex justify-center">
      <v-col v-if="confirmTxState === 'loading'">
        <v-row class="mx-0 mb-5 d-flex justify-center">
          See your Trezor device to confirm your transaction!
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
import TrezorTxBuilder from '@/middleware/TxBuilder/TrezorTxBuilder';
import { ConfirmTxState, NormalizedTx, TxData } from '@/types';
import TxSummary from '@/components/exchange/TxSummary.vue';
import ApiService from '@/services/ApiService';
import SatoshiBig from '@/types/SatoshiBig';
import AdvancedData from '@/components/exchange/AdvancedData.vue';

@Component({
  components: {
    TxSummary,
    AdvancedData,
  },
})
export default class ConfirmTransaction extends Vue {
  txId = '';

  txError = '';

  confirmTxState: ConfirmTxState = 'idle';

  rawTx = '';

  @Prop() tx!: NormalizedTx;

  @Prop() txBuilder!: TrezorTxBuilder;

  @Prop() txData!: TxData;

  @Prop() price!: number;

  @Emit('successConfirmation')
  async toTrackId() {
    this.confirmTxState = 'loading';
    await this.txBuilder.sign()
      .then((trezorSignedTx) => ApiService
        .broadcast(trezorSignedTx.payload.serializedTx))
      .then((txId) => {
        this.txId = txId;
      })
      .catch((err) => {
        this.confirmTxState = 'error';
        this.txError = err.message;
      });
    return [this.txError, this.txId];
  }

  @Emit('toPegInForm')
  async toPegInForm() {
    this.confirmTxState = 'loading';
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

  get opReturnData(): string {
    const opReturnDataOutput = this.tx?.outputs[0] ?? { script_type: '' };
    return opReturnDataOutput.op_return_data
      ? `${opReturnDataOutput.op_return_data.substr(0, 45)}...`
      : 'OP_RETURN data not found';
  }

  get rskFederationAddress():string {
    return this.tx?.outputs[1]?.address?.trim() ?? 'RSK Powpeg address not found';
  }

  get changeAddress(): string {
    return this.txBuilder.changeAddress !== ''
      ? this.txBuilder.changeAddress
      : 'Change address not found';
  }

  get changeAmount(): string {
    const changeAmount = new SatoshiBig(this.tx?.outputs[2]?.amount ?? 0, 'satoshi');
    return changeAmount.toBTCTrimmedString();
  }

  get computedFullAmount(): string {
    const changeAmount = new SatoshiBig(this.tx?.outputs[2]?.amount ?? 0, 'satoshi');
    return this.txData.amount.plus(this.txData.feeBTC)
      .plus(changeAmount)
      .toBTCTrimmedString();
  }

  created() {
    this.rawTx = this.txBuilder.getUnsignedRawTx();
  }
}
</script>
