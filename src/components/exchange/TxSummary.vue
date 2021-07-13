<template>
  <v-row class="mx-0">
    <v-col offset="2" cols="8">
      <v-row justify="center" class="mx-0 pb-4">
        <h2 class="text-center">Transaction Summary:</h2>
      </v-row>
      <v-container class="box">
        <v-row class="mx-0">
          <v-col cols="6">
            <v-row class="mx-0">
              <v-col class="pl-1 pr-0 pl-lg-4 pr-lg-4" cols="6">
                <v-row class="mx-0 mb-1">
                  <h3>Bitcoins</h3>
                </v-row>
                <v-row class="mx-0">
                  <span>{{ amount }} BTC</span>
                </v-row>
                <v-row class="mx-0">
                  <span class="grayish">USD $ {{ amountPrice }}</span>
                </v-row>
              </v-col>
              <v-col class="pl-0 pl-lg-4" cols="6">
                <v-row class="mx-0 mb-1">
                  <h3>Transaction fee</h3>
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
              <v-col class="pl-0 pl-lg-4" offset="6" cols="6">
                <v-row class="mx-0 mb-1">
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
          <v-divider vertical/>
          <v-col class="d-flex flex-column">
            <v-row class="mx-0 flex-grow-1">
              <v-col>
                <v-row class="mx-0 mb-1">
                  <h3>Destination RSK address</h3>
                </v-row>
                <v-row class="mx-0">
                  <span>{{ chunkedRecipientAddress }}</span>
                </v-row>
              </v-col>
            </v-row>
            <v-divider/>
            <v-row class="mx-0 flex-grow-1">
              <v-col>
                <v-row class="mx-0 mb-1">
                  <h3>Refund BTC address</h3>
                </v-row>
                <v-row class="mx-0">
                  <span>{{ chunkedRefundAddress }}</span>
                </v-row>
              </v-col>
            </v-row>
            <template v-if="showTxId">
              <v-divider/>
              <v-row class="mx-0 flex-grow-1">
                <v-col>
                  <v-row class="mx-0 mb-1">
                    <h3>Transaction ID</h3>
                  </v-row>
                  <v-row class="mx-0">
                    <span>{{ computedTxId }}</span>
                  </v-row>
                </v-col>
              </v-row>
            </template>
          </v-col>
        </v-row>
      </v-container>
    </v-col>
  </v-row>
</template>

<script lang="ts">
import {
  Component, Emit, Prop,
  Vue,
} from 'vue-property-decorator';
import { TxData } from '@/services/types';

@Component
export default class TxSummary extends Vue {
  @Prop() txData!: TxData;

  @Prop() price!: number;

  @Prop() txId!: string;

  @Prop() showTxId!: false;

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
}
</script>
