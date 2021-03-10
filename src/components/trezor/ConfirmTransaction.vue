<template>
  <div>
    <v-row class="mx-0">
      <h1>Confirm transaction output on your device</h1>
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
        <v-img src="@/assets/exchange/trezor/confirm-00.png" height="400" contain/>
      </v-col>
      <v-col cols="2" class="d-flex justify-center align-end">
        <v-btn rounded outlined color="#00B520" @click="toTrackId">
          <span>Done</span>
        </v-btn>
      </v-col>
      <v-col>
        <v-img src="@/assets/exchange/trezor/confirm-01.png" height="400" contain/>
      </v-col>
    </v-row>
  </div>
</template>

<script lang="ts">
import {
  Component, Emit, Prop,
  Vue,
} from 'vue-property-decorator';
import TrezorTxBuilder from '@/services/TrezorTxBuilder';
import { TrezorTx } from '@/services/types';

@Component
export default class ConfirmTransaction extends Vue {
  txId = '';

  @Prop(String) tx!: TrezorTx;

  @Prop() txBuilder!: TrezorTxBuilder;

  @Emit()
  singTx() {
    this.txBuilder.sign();
  }

  @Emit('successConfirmation')
  toTrackId() {
    return this.txId;
  }
}
</script>
