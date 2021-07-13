<template>
  <v-row class="mx-0">
    <v-col cols="2"/>
    <v-col cols="8">
      <v-row class="mx-0 d-flex justify-center">
        <h2 class="text-center">Transaction Summary:</h2>
      </v-row>
      <v-row class="d-flex justify-center">
        <v-btn v-show="expand" class="mb-n4" @click="switchExpand"
               fab small outlined color="#00B43C" rounded>
          <b>-</b>
        </v-btn>
        <v-btn v-show="!expand" @click="switchExpand"
               class="mb-n4" fab small outlined color="#00B43C" rounded>
          <b>+</b>
        </v-btn>
      </v-row>
      <v-expand-transition>
        <div class="box" v-show="expand">
          <v-row class="mx-0">
            <v-col cols="6">
              <v-row class="mx-0">
                <v-col cols="6">
                  <v-row class="mx-0">
                    <h3>Bitcoins</h3>
                  </v-row>
                  <v-row class="mx-0">
                    <span>{{ amount }} BTC</span>
                  </v-row>
                  <v-row class="mx-0">
                    <span class="grayish">USD $ {{ amountPrice }}</span>
                  </v-row>
                </v-col>
                <v-col cols="6">
                  <v-row class="mx-0">
                    <h3>Transaction Fee</h3>
                  </v-row>
                  <v-row class="mx-0">
                    <span>{{ fee }} BTC</span>
                  </v-row>
                  <v-row class="mx-0">
                    <span class="grayish">USD $ {{ feeUSD }}</span>
                  </v-row>
                </v-col>
              </v-row>
              <v-row class="mx-0">
                <v-col cols="6"/>
                <v-col cols="6">
                  <v-row class="mx-0">
                    <h3>Transaction total</h3>
                  </v-row>
                  <v-row class="mx-0">
                    <span>{{ fullTx }} BTC</span>
                  </v-row>
                  <v-row class="mx-0">
                    <span class="grayish">USD $ {{ fullTxUSD }}</span>
                  </v-row>
                </v-col>
              </v-row>
            </v-col>
            <v-divider inset vertical/>
            <v-col cols="5" class="d-flex align-center">
              <div>
                <div class="container">
                  <v-row class="mx-0">
                    <h3>Destination RSK Address</h3>
                  </v-row>
                  <v-row class="mx-0">
                    <span>{{ chunkedRecipientAddress }}</span>
                  </v-row>
                </div>
                <v-divider/>
                <div class="container">
                  <v-row class="mx-0">
                    <h3>Refund BTC Address</h3>
                  </v-row>
                  <v-row class="mx-0">
                    <span>{{ chunkedRefundAddress }}</span>
                  </v-row>
                </div>
                <template v-if="showTxId">
                  <v-divider/>
                  <div class="container">
                    <v-row class="mx-0">
                      <h3>Transaction ID</h3>
                    </v-row>
                    <v-row class="mx-0">
                      <span>{{ computedTxId }}</span>
                    </v-row>
                  </div>
                </template>
              </div>
            </v-col>
          </v-row>
        </div>
      </v-expand-transition>
    </v-col>
    <v-col cols="2"/>
  </v-row>
</template>

<script lang="ts">
import {
  Component, Emit, Prop,
  Vue,
} from 'vue-property-decorator';
import { TxData } from '@/types';

@Component
export default class TxSummary extends Vue {
  @Prop() txData!: TxData;

  @Prop() price!: number;

  @Prop() txId!: string;

  @Prop() showTxId!: false;

  expand = false;

  get amount() {
    return this.txData.amount ? this.satoshiToBtc(this.txData.amount) : 'Not found';
  }

  get amountPrice() {
    const amountPrice = this.satoshiToBtc(this.txData.amount) * this.price;
    return amountPrice ? amountPrice.toFixed(2) : 0;
  }

  get fee() {
    return this.txData.feeBTC ? this.txData.feeBTC.toFixed(6) : 'Not found';
  }

  get feeUSD() {
    const feePrice = this.satoshiToBtc(this.txData.feeBTC) * this.price;
    return feePrice ? feePrice.toFixed(2) : 0;
  }

  get fullTx() {
    const feePlusAmount = this.satoshiToBtc(this.txData.amount) + this.txData.feeBTC;
    return feePlusAmount ? feePlusAmount.toFixed(6) : 'Not found';
  }

  get fullTxUSD() {
    const feePlusAmount = this.satoshiToBtc(this.txData.amount) + this.txData.feeBTC;
    const feePlusAmountPrice = feePlusAmount * this.price;
    return feePlusAmountPrice ? feePlusAmountPrice.toFixed(2) : 0;
  }

  get chunkedRecipientAddress() {
    return this.txData.recipient ? `${this.txData.recipient.substr(0, 25)}...${this
      .txData.recipient.substr(38, 42)}` : 'Not found';
  }

  get chunkedRefundAddress() {
    return this.txData.refundAddress ? `${this.txData.refundAddress.substr(0, 24)}...${this
      .txData.refundAddress.substr(31, 35)}` : 'Not found';
  }

  get computedTxId() {
    return this.txId ? `${this.txId.substr(0, 24)}...${this.txId.substr(60, 64)}` : 'Not found';
  }

  @Emit()
  // eslint-disable-next-line class-methods-use-this
  satoshiToBtc(satoshis: number): number {
    return satoshis * 0.00000001;
  }

  @Emit()
  switchExpand() {
    this.expand = !this.expand;
  }
}
</script>
