<template>
  <div class="transactions">
    <v-row class="mx-0 d-flex justify-center">
      <v-col cols="10" lg="8" xl="6" class="d-flex justify-center">
        <h1 class="text-center">Confirm transaction on your device</h1>
      </v-col>
    </v-row>
    <v-row class="mx-0 my-8 d-flex justify-center">
      <p class="text-center">
        Make sure the amount, address and transaction fee displayed on Trezor are correct.
        <br>
        To prevent malware attacks, double-check the address with the recipient.
        <br>
        Press <strong>sign</strong> when you finished.
      </p>
    </v-row>
    <v-row class="mx-0">
      <v-col cols="3" xl="2">
        <v-row class="mx-0 d-flex justify-center">
          <v-img src="@/assets/exchange/trezor/rsk.png" height="40" contain/>
        </v-row>
        <v-row class="mx-0 d-flex justify-center">
          <h4 class="text-center"><span class="number">1</span>Confirm RSK information</h4>
        </v-row>
      </v-col>
      <v-col cols="3" xl="3">
        <v-row class="mx-0">
          <v-img src="@/assets/exchange/trezor/transfer.png" height="40" contain/>
        </v-row>
        <v-row class="mx-0 d-flex justify-center">
          <h4 class="text-center"><span class="number">2</span>Confirm funds transfer</h4>
        </v-row>
      </v-col>
      <v-col cols="3" xl="3">
        <v-row class="mx-0">
          <v-img src="@/assets/exchange/trezor/change.png" height="40" contain/>
        </v-row>
        <v-row class="mx-0 d-flex justify-center">
          <h4 class="text-center"><span class="number">3</span>Confirm change address</h4>
        </v-row>
      </v-col>
      <v-col cols="3" xl="2">
        <v-row class="mx-0">
          <v-img src="@/assets/exchange/trezor/fee.png" height="40" contain/>
        </v-row>
        <v-row class="mx-0 d-flex justify-center">
          <h4 class="text-center"><span class="number">4</span>Confirm Transaction Fee</h4>
        </v-row>
      </v-col>
    </v-row>
    <v-row class="mx-0 d-flex justify-center">
      <v-col cols="3" xl="2" class="px-lg-10" >
        <v-row class="mx-0 d-flex justify-center">
          <fieldset class="confirmation-box px-10">
            <legend class="px-3 d-flex justify-center">See on Trezor</legend>
            <v-row class="mt-5 d-flex justify-center" >
              <span>
                Confirm OP_RETURN
              </span>
              <v-tooltip right>
                <template v-slot:activator="{ on, attrs }">
                  <v-icon small color="black" v-bind="attrs" v-on="on" class="ml-2 pb-2">
                    mdi-information
                  </v-icon>
                </template>
                <p class="tooltip-form mb-0">
                  The OP_RETURN is an opcode used to mark a transaction output as null, and store
                  the rsk POWpeg information there.
                </p>
              </v-tooltip>
            </v-row>
            <v-row class="mt-5 mb-3 d-flex justify-center" >Confirm</v-row>
          </fieldset>
        </v-row>
      </v-col>
      <v-col cols="3" xl="3" class="px-lg-10" >
        <v-row class="mx-0 d-flex justify-center">
          <fieldset class="confirmation-box px-10">
            <legend class="px-3 d-flex justify-center">See on Trezor</legend>
            <v-row class="mt-5 d-flex justify-center" >Confirm sending</v-row>
            <v-row class="mt-5 d-flex justify-center" >Amount {{btcAmount}}</v-row>
            <v-row class="mt-5 d-flex justify-center" >
            <span>
              {{rskFederationAddress}}
            </span>
            </v-row>
            <v-row class="mt-5 mb-3 d-flex justify-center" >Confirm</v-row>

          </fieldset>
        </v-row>
      </v-col>
      <v-col cols="3" xl="3" class="px-lg-10" >
        <v-row class="mx-0 d-flex justify-center">
          <fieldset class="confirmation-box px-10">
            <legend class="px-3 d-flex justify-center">See on Trezor</legend>
            <v-row class="mt-5 d-flex justify-center" >Confirm sending</v-row>
            <v-row class="mt-5 d-flex justify-center" >Amount {{changeAmount}}</v-row>
            <v-row class="mt-5 d-flex justify-center" >
            <span>
              {{changeAddress}}
            </span>
            </v-row>
            <v-row class="mt-5 mb-3 d-flex justify-center" >Confirm</v-row>
          </fieldset>
        </v-row>
      </v-col>
      <v-col cols="3" xl="2" class="px-lg-10" >
        <v-row class="mx-0 d-flex justify-center">
          <fieldset class="confirmation-box px-10">
            <legend class="px-3 d-flex justify-center">See on Trezor</legend>
            <v-row class="mt-5 d-flex justify-center" >Really send amount</v-row>
            <v-row class="mt-5 d-flex justify-center" >FEE {{txData.feeBTC}}</v-row>
            <v-row class="mt-5 mb-3 d-flex justify-center" >Confirm</v-row>
          </fieldset>
        </v-row>
      </v-col>
    </v-row>
    <v-divider/>
    <v-row class="mx-0 my-8">
      <tx-summary :txData="txData" :price="price" :showTxId="false" :initial-expand="true"
                  :rskFederationAddress="rskFederationAddress"/>
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
            <span>Sign</span>
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
import Big from 'big.js';
import TrezorTxBuilder from '@/middleware/TxBuilder/TrezorTxBuilder';
import { ConfirmTxState, TrezorTx, TxData } from '@/types';
import TxSummary from '@/components/exchange/TxSummary.vue';
import ApiService from '@/services/ApiService';

@Component({
  components: {
    TxSummary,
  },
})
export default class ConfirmTransaction extends Vue {
  txId = '';

  txError = '';

  confirmTxState: ConfirmTxState = 'idle';

  rskFederationAddress = '';

  @Prop() tx!: TrezorTx;

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

  get changeAddress() {
    return this.txBuilder.changeAddress;
  }

  get btcAmount() {
    const amount = new Big(this.txData.amount);
    return amount.div(100_000_000).toFixed(8);
  }

  get changeAmount() {
    const amount = new Big(this.tx.outputs[2].amount);
    return amount.div(100_000_000).toFixed(8);
  }

  created() {
    this.rskFederationAddress = this.tx?.outputs[1]?.address?.trim() ?? 'RSK POWpeg address not found';
  }
}
</script>
