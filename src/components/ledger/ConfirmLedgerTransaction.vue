<template>
  <div class="transactions">
    <v-row class="mx-0">
      <v-col cols="1" lg="2" xl="3" align-self="center" class="d-flex flex-column align-start">
        <v-btn rounded outlined color="#00B520" class="return-to-form-button"
               icon width="38" height="38" @click="toPegInForm">
          <v-icon class="return-to-form-button-content">mdi-chevron-left</v-icon>
        </v-btn>
      </v-col>
      <v-col cols="10" lg="8" xl="6" class="d-flex flex-column align-center">
        <h1 class="text-center">Confirm transaction on your device</h1>
      </v-col>
    </v-row>
    <v-row class="mx-0 my-8 d-flex justify-center">
      <p class="text-center">
        Make sure the amount, address and transaction fee displayed the Ledger device are correct.
        <br>
        To prevent malware attacks, double-check the address with the recipient.
        <br>
        Press <strong>sign</strong> when you finish.
      </p>
    </v-row>
    <v-row id="instructions" class="mx-0">
      <v-col id="instruction-1" cols="3" class="px-lg-10">
        <v-row justify="center" class="mx-0">
          <v-img src="@/assets/exchange/trezor/rsk.png" height="40" contain/>
        </v-row>
        <v-row class="mx-0 d-flex justify-center">
          <h4 class="text-center"><span class="number">1</span>Confirm RSK information</h4>
        </v-row>
      </v-col>
      <v-col id="instruction-2" cols="3" class="px-lg-10">
        <v-row justify="center" class="mx-0">
          <v-img src="@/assets/exchange/trezor/transfer.png" height="40" contain/>
        </v-row>
        <v-row class="mx-0 d-flex justify-center">
          <h4 class="text-center"><span class="number">2</span>Confirm funds transfer</h4>
        </v-row>
      </v-col>
      <v-col id="instruction-3" cols="3" class="px-lg-10">
        <v-row justify="center" class="mx-0">
          <v-img src="@/assets/exchange/trezor/change.png" height="40" contain/>
        </v-row>
        <v-row class="mx-0 d-flex justify-center">
          <h4 class="text-center"><span class="number">3</span>Confirm change address</h4>
        </v-row>
      </v-col>
      <v-col id="instruction-4" cols="3" class="px-lg-10">
        <v-row justify="center" class="mx-0">
          <v-img src="@/assets/exchange/trezor/fee.png" height="40" contain/>
        </v-row>
        <v-row class="mx-0 d-flex justify-center">
          <h4 class="text-center"><span class="number">4</span>Confirm Transaction Fee</h4>
        </v-row>
      </v-col>
    </v-row>
    <v-divider/>
    <v-row class="mx-0 my-8">
      <tx-summary :txData="txData" :price="price" :showTxId="false" :initial-expand="true" />
    </v-row>
    <v-row class="mx-0 d-flex justify-center">
      <v-btn v-if="!loadingState" rounded outlined color="#00B520" width="110" @click="toTrackId">
        <span>Sign</span>
      </v-btn>
      <v-col v-if="loadingState">
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
import { TrezorTx, TxData } from '@/types';
import TxSummary from '@/components/exchange/TxSummary.vue';
import LedgerTxBuilder from '@/middleware/TxBuilder/LedgerTxBuilder';
import ApiService from '@/services/ApiService';
import UnverifiedInputsDialog from '@/components/ledger/UnverifiedInputsDialog.vue';
import * as constants from '@/store/constants';

@Component({
  components: {
    TxSummary,
    UnverifiedInputsDialog,
  },
})
export default class ConfirmLedgerTransaction extends Vue {
  txId = '';

  txError = '';

  loadingState = false;

  @Prop() tx!: TrezorTx;

  @Prop() txBuilder!: LedgerTxBuilder;

  @Prop() txData!: TxData;

  @Prop() price!: number;

  get showUnverifiedInputsDialog() {
    return this.txBuilder.accountType === constants.BITCOIN_SEGWIT_ADDRESS && this.loadingState;
  }

  @Emit('successConfirmation')
  async toTrackId() {
    this.loadingState = true;
    await this.txBuilder.sign()
      .then((tx) => ApiService
        .broadcast(tx.signedTx))
      .then((txId) => {
        this.txId = txId;
      })
      .catch((err) => {
        console.log(err);
        if (err.statusCode === 27013) {
          this.txError = 'Transaction cancelled by user.';
        } else {
          this.txError = err.message;
        }
      });
    return [this.txError, this.txId];
  }

  @Emit('toPegInForm')
  async toPegInForm() {
    this.loadingState = true;
    return 'SendBitcoinForm';
  }
}
</script>
