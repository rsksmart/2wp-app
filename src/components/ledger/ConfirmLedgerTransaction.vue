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
          <h4 class="text-center"><span class="number">1</span>Confirm RSK information</h4>
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
          <h4 class="text-center"><span class="number">4</span>Confirm Transaction Fee</h4>
        </v-row>
      </v-col>
    </v-row>
    <v-row justify="center" class="mx-0">
      <v-col cols="3" xl="3" class="px-lg-10" >
        <v-row class="mx-0 d-flex justify-center">
          <fieldset class="confirmation-box px-10">
            <legend class="px-3 d-flex justify-center">See on Ledger</legend>
            <v-row class="mt-5 d-flex justify-center" >Review output #1</v-row>
            <v-row class="mt-5 d-flex justify-center" >Amount: 0</v-row>
            <v-row justify="center" align="start" class="mt-5" >
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
            <v-row class="mt-5 mb-3 d-flex justify-center" >Accept</v-row>
          </fieldset>
        </v-row>
      </v-col>
      <v-col cols="3" xl="3" class="px-lg-10" >
        <v-row class="mx-0 d-flex justify-center">
          <fieldset class="confirmation-box px-10">
            <legend class="px-3 d-flex justify-center">See on Ledger</legend>
            <v-row class="mt-5 d-flex justify-center" >Review output #2</v-row>
            <v-row class="mt-5 d-flex justify-center" >
              Amount: {{txData.amount.toBTCTrimmedString()}}
            </v-row>
            <v-row class="mt-5 d-flex justify-center">
              <span>
                {{cropAddress(rskFederationAddress)}}
              </span>
            </v-row>
            <v-row class="mt-5 mb-3 d-flex justify-center" >Accept</v-row>
          </fieldset>
        </v-row>
      </v-col>
      <v-col cols="3" xl="3" class="px-lg-10" >
        <v-row class="mx-0 d-flex justify-center">
          <fieldset class="confirmation-box px-10">
            <legend class="px-3 d-flex justify-center">See on Ledger</legend>
            <v-row class="mt-5 d-flex justify-center" >Review output #3</v-row>
            <v-row class="mt-5 d-flex justify-center" >Amount: {{changeAmount}}</v-row>
            <v-row class="mt-5 d-flex justify-center" >
              <span>
              {{cropAddress(changeAddress)}}
              </span>
            </v-row>
            <v-row class="mt-5 mb-3 d-flex justify-center" >Accept</v-row>
          </fieldset>
        </v-row>
      </v-col>
      <v-col cols="3" xl="3" class="px-lg-10" >
        <v-row class="mx-0 d-flex justify-center">
          <fieldset class="confirmation-box px-10">
            <legend class="px-3 d-flex justify-center">See on Ledger</legend>
            <v-row class="mt-5 d-flex justify-center" >Confirm Transaction</v-row>
            <v-row class="mt-5 d-flex justify-center" >
              Fee: {{txData.feeBTC.toBTCTrimmedString()}}
            </v-row>
            <v-row class="mt-5 mb-3 d-flex justify-center" >Accept</v-row>
          </fieldset>
        </v-row>
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
import { Getter } from 'vuex-class';
import { ConfirmTxState, TrezorTx, TxData } from '@/types';
import TxSummary from '@/components/exchange/TxSummary.vue';
import LedgerTxBuilder from '@/middleware/TxBuilder/LedgerTxBuilder';
import ApiService from '@/services/ApiService';
import UnverifiedInputsDialog from '@/components/ledger/UnverifiedInputsDialog.vue';
import AdvancedData from '@/components/exchange/AdvancedData.vue';
import * as constants from '@/store/constants';
import SatoshiBig from '@/types/SatoshiBig';

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

  confirmTxState: ConfirmTxState = 'idle';

  rskFederationAddress = '';

  rawTx = '';

  @Prop() tx!: TrezorTx;

  @Prop() txBuilder!: LedgerTxBuilder;

  @Prop() txData!: TxData;

  @Prop() price!: number;

  @Getter(constants.PEGIN_TX_GET_CHANGE_ADDRESS, { namespace: 'pegInTx' }) getChangeAddress!: (accountType: string) => string;

  get showUnverifiedInputsDialog() {
    return this.txBuilder.accountType === constants.BITCOIN_SEGWIT_ADDRESS && this.confirmTxState === 'loading';
  }

  @Emit('successConfirmation')
  async toTrackId() {
    this.confirmTxState = 'loading';
    await this.txBuilder.sign()
      .then((tx) => ApiService
        .broadcast(tx.signedTx))
      .then((txId) => {
        this.txId = txId;
      })
      .catch((err) => {
        this.confirmTxState = 'error';
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
    this.confirmTxState = 'loading';
    return 'SendBitcoinForm';
  }

  // eslint-disable-next-line class-methods-use-this
  cropAddress(address: string):string {
    return `${address.substr(0, 6)}...${address.substr(address.length - 6, address.length)}`;
  }

  get changeAddress() {
    return this.getChangeAddress(this.txBuilder.accountType);
  }

  get changeAmount() {
    const amount = new SatoshiBig(this.tx?.outputs[2]?.amount ?? 0, 'satoshi');
    return amount.toBTCTrimmedString();
  }

  created() {
    this.rskFederationAddress = this.tx?.outputs[1]?.address?.trim() ?? 'RSK POWpeg address not found';
    this.rawTx = this.txBuilder.getRawTx();
  }
}
</script>
