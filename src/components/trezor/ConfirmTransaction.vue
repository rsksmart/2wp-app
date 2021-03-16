<template>
  <div class="transactions">
    <v-row class="mx-0 d-flex justify-center">
      <h1 class="text-center">Confirm transaction output on your device</h1>
    </v-row>
    <v-row class="mx-0 my-8 d-flex justify-center">
      <p class="text-center">
        Make sure the amount, address and transaction fee displayed on Trezor are correct.
        <br>
        To prevent malware attacks, double-check the address with the recipient.
        <br>
        Please press done when you finished.
      </p>
    </v-row>
    <v-row class="mx-0">
      <v-col>
        <v-row class="mx-0 d-flex justify-center">
          <v-img src="@/assets/exchange/trezor/rsk.png" height="40" contain/>
        </v-row>
        <v-row class="mx-0 d-flex justify-center">
          <h4 class="text-center"><span class="number">1</span>Confirm RSK information</h4>
        </v-row>
      </v-col>
      <v-col>
        <v-row class="mx-0">
          <v-img src="@/assets/exchange/trezor/transfer.png" height="40" contain/>
        </v-row>
        <v-row class="mx-0 d-flex justify-center">
          <h4 class="text-center"><span class="number">2</span>Confirm funds transfer</h4>
        </v-row>
      </v-col>
      <v-col>
        <v-row class="mx-0">
          <v-img src="@/assets/exchange/trezor/change.png" height="40" contain/>
        </v-row>
        <v-row class="mx-0 d-flex justify-center">
          <h4 class="text-center"><span class="number">3</span>Confirm change address</h4>
        </v-row>
      </v-col>
      <v-col>
        <v-row class="mx-0">
          <v-img src="@/assets/exchange/trezor/fee.png" height="40" contain/>
        </v-row>
        <v-row class="mx-0 d-flex justify-center">
          <h4 class="text-center"><span class="number">4</span>Confirm Transaction Fee</h4>
        </v-row>
      </v-col>
    </v-row>
    <v-divider/>
    <v-row class="mx-0 my-8">
      <tx-summary :txData="txData" :price="price" :showTxId="false"/>
    </v-row>
    <v-row class="mx-0 d-flex justify-center">
      <v-btn rounded outlined color="#00B520" width="110" @click="toTrackId">
        <span>Done</span>
      </v-btn>
    </v-row>
  </div>
</template>

<script lang="ts">
import {
  Component, Emit, Prop,
  Vue,
} from 'vue-property-decorator';
import TrezorTxBuilder from '@/services/TrezorTxBuilder';
import { TrezorTx, TxData } from '@/services/types';
import TxSummary from '@/components/exchange/TxSummary.vue';

@Component({
  components: {
    TxSummary,
  },
})
export default class ConfirmTransaction extends Vue {
  txId = '';

  @Prop() tx!: TrezorTx;

  @Prop() txBuilder!: TrezorTxBuilder;

  @Prop() txData!: TxData;

  @Prop() price!: number;

  @Emit('successConfirmation')
  async toTrackId() {
    await this.txBuilder.sign()
      .then((payload) => {
        console.log(payload);
        this.txId = 'e775bc7b79af4e6133be5c28fed84b5a2415af2bdc780bfae8f48f51d813560b';
      })
      .catch(console.error);
    return this.txId;
  }
}
</script>
