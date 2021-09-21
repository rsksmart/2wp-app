<template>
  <v-row class="mx-0 d-flex justify-center">
    <v-col sm="8"
            md="7"
           lg="6"
           xl="4">
      <v-row justify="center" class="mx-0 pb-4">
        <h2 class="text-center tx-text">Transaction summary:</h2>
      </v-row>
      <v-row class="d-flex justify-center mb-n3">
        <a v-show="expand && !expandOver" @click="switchExpand" @mouseover="switchExpandOver"
           @mouseleave="switchExpandOver">
          <v-img src="@/assets/status/collapse-2.png" contain max-width="30"></v-img>
        </a>
        <a v-show="!expand && !expandOver" @click="switchExpand" @mouseover="switchExpandOver"
           @mouseleave="switchExpandOver">
          <v-img src="@/assets/status/collapse.png" contain max-width="30"></v-img>
        </a>
        <a v-show="expand && expandOver" @click="switchExpand">
          <v-img src="@/assets/status/collapse-2-green.png" contain max-width="30"></v-img>
        </a>
        <a v-show="!expand && expandOver" @click="switchExpand">
          <v-img src="@/assets/status/collapse-green.png" contain max-width="30"></v-img>
        </a>
      </v-row>
      <v-expand-transition>
        <div class="box" v-show="expand">
          <v-row class="mx-0 py-2">
            <v-col cols="4 py-0 ">
              <v-row class="mx-0">
                <v-col>
                  <v-col class="mb-2">
                    <v-row class="mx-0">
                      <h3>Bitcoins</h3>
                    </v-row>
                    <v-row class="mx-0">
                      <span>{{ amount }} BTC</span>
                    </v-row>
                    <v-row class="mx-0">
                      <span class="grayish" id="amount-usd">USD $ {{ amountUSD }}</span>
                    </v-row>
                  </v-col>
                  <v-col class="mb-2">
                    <v-row class="mx-0">
                      <h3>Transaction Fee</h3>
                    </v-row>
                    <v-row class="mx-0">
                      <span>{{ fee }} BTC</span>
                    </v-row>
                    <v-row class="mx-0">
                      <span class="grayish" id="fee-usd">USD $ {{ feeUSD }}</span>
                    </v-row>
                  </v-col>
                  <v-col>
                    <v-row class="mx-0">
                      <h3>Transaction total</h3>
                    </v-row>
                    <v-row class="mx-0">
                      <span>{{ feePlusAmount }} BTC</span>
                    </v-row>
                    <v-row class="mx-0">
                      <span class="grayish" id="total-usd">USD $ {{ feePlusAmountUSD }}</span>
                    </v-row>
                  </v-col>
                </v-col>
              </v-row>
            </v-col>
            <v-divider inset vertical/>
            <v-col cols="8" class="px-0 pl-lg-4 pt-0 pb-0">
              <v-container class="pr-md-0">
                <v-row class="mx-0" align="start">
                  <h3 class="mr-1">Destination RSK address</h3>
                  <v-tooltip right>
                    <template v-slot:activator="{ on, attrs }">
                      <v-icon small color="teal darken-2" v-bind="attrs" v-on="on">
                        mdi-information
                      </v-icon>
                    </template>
                    <p class="tooltip-form mb-0">
                      This is the RSK address where the RBTC will be delivered.
                    </p>
                  </v-tooltip>
                </v-row>
                <v-row class="mx-0">
                  <v-col cols="auto"
                         class="d-flex flex-column justify-end ma-0 pa-0">
                    <span class="breakable-address">{{ txData.recipient }}</span>
                  </v-col>
                  <v-col cols="auto"
                         class="d-flex flex-column justify-end ma-0 pa-0 ml-lg-1">
                    <v-btn @click="toRskExplorer" icon color="#C4C4C4" x-small>
                      <v-icon>mdi-open-in-new</v-icon>
                    </v-btn>
                  </v-col>
                </v-row>
              </v-container>
              <v-divider/>
              <v-container>
                <v-row class="mx-0" align="start">
                  <h3 class="mr-1">Refund BTC Address</h3>
                  <v-tooltip right>
                    <template v-slot:activator="{ on, attrs }">
                      <v-icon small color="teal darken-2" v-bind="attrs" v-on="on">
                        mdi-information
                      </v-icon>
                    </template>
                    <p class="tooltip-form mb-0">
                      Rejected transactions will be refunded to this Bitcoin address.
                    </p>
                  </v-tooltip>
                </v-row>
                <v-row class="mx-0">
                  <span class="breakable-address">{{ txData.refundAddress }}</span>
                </v-row>
              </v-container>
              <template v-if="showTxId">
                <v-divider/>
                <div class="container">
                  <v-row class="mx-0">
                    <h3>Bitcoin transaction ID</h3>
                  </v-row>
                  <v-row class="mx-0">
                    <span>{{ computedTxId }}</span>
                  </v-row>
                </div>
              </template>
              <template>
                <v-divider/>
                <v-container class="container">
                  <v-row class="mx-0" align="start">
                    <h3 class="mr-1">PowPeg Bitcoin Address</h3>
                    <v-tooltip right>
                      <template v-slot:activator="{ on, attrs }">
                        <v-icon small color="teal darken-2" v-bind="attrs" v-on="on">
                          mdi-information
                        </v-icon>
                      </template>
                      <p class="tooltip-form mb-0">
                        This is the Bitcoin address where your bitcoins are sent for conversion.
                      </p>
                      <p class="tooltip-form mb-0">
                        Validate this in your device before confirming the transaction.
                      </p>
                    </v-tooltip>
                  </v-row>
                  <v-row class="mx-0">
                    <span class="breakable-address">{{ rskFederationAddress }}</span>
                  </v-row>
                </v-container>
              </template>
            </v-col>
          </v-row>
        </div>
      </v-expand-transition>
    </v-col>
  </v-row>
</template>

<script lang="ts">
import {
  Component, Emit, Prop,
  Vue,
} from 'vue-property-decorator';
import Big from 'big.js';
import { TxData } from '@/types';
import * as constants from '@/store/constants';

@Component
export default class TxSummary extends Vue {
  @Prop() txData!: TxData;

  @Prop() price!: number;

  @Prop() txId!: string;

  @Prop() showTxId!: false;

  @Prop() initialExpand!: boolean;

  @Prop() rskFederationAddress!: string;

  txIdValue = '';

  expand = false;

  expandOver = false;

  fixedUSDDecimals = 2;

  get amount() {
    return this.txData.amount ? this.satoshiToBtc(this.txData.amount).toString() : 'Not found';
  }

  get amountUSD() {
    const amountUSD = Big(this.satoshiToBtc(this.txData.amount)).mul(Big(this.price));
    return amountUSD ? amountUSD.toFixed(this.fixedUSDDecimals) : '0';
  }

  get fee() {
    return this.txData.feeBTC ? Big(this.txData.feeBTC).toFixed(8) : 'Not found';
  }

  get feeUSD() {
    const feeUSD = Big(this.txData.feeBTC).mul(Big(this.price));
    return feeUSD ? feeUSD.toFixed(this.fixedUSDDecimals) : '0';
  }

  get feePlusAmount() {
    const feePlusAmount = Big(this.satoshiToBtc(this.txData.amount)).plus(Big(this.txData.feeBTC));
    return feePlusAmount ? feePlusAmount.toFixed(8) : 'Not found';
  }

  get feePlusAmountUSD() {
    const feePlusAmountUSD = Big(this.amountUSD).plus(Big(this.feeUSD));
    return feePlusAmountUSD ? feePlusAmountUSD.toFixed(this.fixedUSDDecimals) : 0;
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
    return this.txIdValue ? `${this.txIdValue.substr(0, 24)}...${this.txIdValue.substr(60, 64)}` : 'Not found';
  }

  @Emit()
  // eslint-disable-next-line class-methods-use-this
  satoshiToBtc(satoshis: number): number {
    const btcs: Big = Big(satoshis.toString()).div(100_000_000);
    return Number(btcs.toFixed(8));
  }

  @Emit()
  switchExpand() {
    this.expand = !this.expand;
  }

  @Emit()
  switchExpandOver() {
    this.expandOver = !this.expandOver;
  }

  @Emit()
  toRskExplorer() {
    const network = process.env.VUE_APP_COIN === constants.BTC_NETWORK_MAINNET ? '' : '.testnet';
    window.open(`https://explorer${network}.rsk.co/address/${this.txData.recipient}`, '_blank');
  }

  created() {
    this.expand = this.initialExpand;
    this.txIdValue = this.txId;
  }
}
</script>
