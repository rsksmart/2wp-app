<template>
  <div class="exchange-form">
    <send-bitcoin-dialog :bitcoinWallet="bitcoinWallet"/>
    <template v-if="setUpFlag">
      <set-up :setUpFlag="setUpFlag" @succeed="setUpFlag = false"/>
    </template>
    <template v-if="!setUpFlag">
      <div class="container">
        <v-row class="mx-0 ml-2">
          <h1>Send Bitcoins through Ledger</h1>
        </v-row>
        <div class="container">
          <v-row class="mx-0">
            <h2>Amount:</h2>
          </v-row>
          <v-row class="mx-0">
            <p>How much BTC would you like to send?</p>
          </v-row>
          <v-row class="mx-0 d-flex align-center">
            <v-col cols="2" class="input-box pr-0">
              <v-text-field solo hide-details full-width single-line flat
                            v-model="bitcoinAmount" type="number"/>
              <div class="btc-label text-center">
                BTC
              </div>
            </v-col>
            <v-col cols="1" class="d-flex justify-center">
              <span class="shadow whiteish text-center">=</span>
            </v-col>
            <v-col cols="2" class="input-box pr-0">
              <v-text-field solo hide-details full-width single-line flat
                            v-model="rbtcAmount" type="number"/>
              <div class="rbtc-label text-center">
                <span class="whiteish">RBTC</span>
              </div>
            </v-col>
            <v-col cols="4">
              <div class="note pa-2">
                <p class="mb-0">
                  Note: You need to send a minimum amount of 0.01 BTC and not more than 10 BTC for
                  conversion.
                </p>
              </div>
            </v-col>
          </v-row>
        </div>
      </div>
      <v-divider class="mx-3" color="#1732A4"/>
      <div class="container">
        <v-row class="mx-0">
          <h2>Recipient RSK Address:</h2>
        </v-row>
        <v-row class="mx-0">
          <p>Paste the address you want to send your RBTC.</p>
        </v-row>
        <v-row class="mx-0">
          <v-col cols="6">
            <v-select v-model="rskAddressSelected" :items="rskAddresses" color="#FFF"
                      label="Don't forget to double check the address" solo dense rounded/>
          </v-col>
          <v-col cols="3" class="d-flex justify-end">
            <v-btn outlined rounded color="#1732A4">
              Connect Wallet
            </v-btn>
          </v-col>
        </v-row>
      </div>
      <v-divider class="mx-3" color="#1732A4"/>
      <div class="container">
        <v-row class="mx-0">
          <h2>Transaction Fee:</h2>
        </v-row>
        <v-row class="mx-0">
          <p>Select the corresponding rate</p>
        </v-row>
        <v-row class="mx-0">
          <v-col cols="8">
            <v-row class="mx-0">
              <v-slider v-model="txFeeIndex" :tick-labels="transactionFees" :max="2"
                        :color="txFeeColor" :track-color="txFeeColor" step="1"
                        ticks="always" tick-size="5"/>
            </v-row>
            <v-row class="mx-0">
              <v-col cols="4" class="d-flex justify-start pa-0">
                <span class="text-left">0.00292 BTC</span>
              </v-col>
              <v-col cols="4" class="d-flex justify-center pa-0">
                <span class="text-center">0.00317 BTC</span>
              </v-col>
              <v-col cols="4" class="d-flex justify-end pa-0">
                <span class="text-right">0.00365 BTC</span>
              </v-col>
            </v-row>
            <v-row class="mx-0">
              <v-col cols="4" class="d-flex justify-start pa-0">
                <span class="text-left">$ 1.07</span>
              </v-col>
              <v-col cols="4" class="d-flex justify-center pa-0">
                <span class="text-center">$ 1.16</span>
              </v-col>
              <v-col cols="4" class="d-flex justify-end pa-0">
                <span class="text-right">$ 1.33</span>
              </v-col>
            </v-row>
          </v-col>
        </v-row>
      </div>
      <v-divider class="mx-3" color="#1732A4"/>
      <div class="container">
        <v-row class="mx-0">
          <h2>Refund Address:</h2>
        </v-row>
        <v-row class="mx-0">
          <p>Add the refund BTC address in case the transaction is declined.</p>
        </v-row>
        <v-row class="mx-0">
          <v-col cols="6">
            <v-select v-model="btcRefundAddressSelected" :items="btcRefundAddresses" color="#FFF"
                      label="Don't forget to double check the address" solo dense rounded/>
          </v-col>
        </v-row>
      </div>
      <v-divider class="mx-3" color="#1732A4"/>
      <div class="container">
        <v-row class="mx-0">
          <v-col cols="3">
            <h2>Transaction Summary:</h2>
          </v-col>
          <v-col cols="1" class="d-flex justify-center">
            <v-icon x-large color="#F6C61B">mdi-information</v-icon>
          </v-col>
          <v-col cols="5">
            <div class="note pa-2">
              <p class="mb-0">
                Note: If you click on the icon, it will redirect you to the DevPortal where they
                explain what the 2WP process consists of.
              </p>
            </div>
          </v-col>
        </v-row>
        <v-row class="mx-0">
          <v-col cols="8" class="pl-0">
            <div class="input-box-inverted">
              <span class="label">BTC</span>
              <v-text-field solo hide-details full-width single-line flat readonly
                            v-model="bitcoinAmount"/>
            </div>
          </v-col>
        </v-row>
        <v-row class="mx-0">
          <v-col cols="8" class="pl-0">
            <div class="input-box-inverted">
              <span class="label">Deposit BTC Address</span>
              <v-text-field solo hide-details full-width single-line flat readonly
                            v-model="btcRefundAddressSelected"/>
            </div>
          </v-col>
        </v-row>
        <v-row class="mx-0">
          <v-col cols="8" class="pl-0">
            <div class="input-box-inverted">
              <span class="label">Destination RSK Address</span>
              <v-text-field solo hide-details full-width single-line flat readonly
                            v-model="rskAddressSelected"/>
            </div>
          </v-col>
        </v-row>
        <v-row class="mx-0">
          <v-col cols="8" class="pl-0">
            <div class="input-box-inverted">
              <span class="label">Destination RSK Address</span>
              <v-text-field solo hide-details full-width single-line flat readonly
                            v-model="txFee"/>
            </div>
          </v-col>
        </v-row>
      </div>
      <v-row class="mx-0 d-flex justify-end">
        <v-col cols="3" class="d-flex justify-end">
          <v-btn rounded solo dense color="#126DF2">
            <span class="whiteish">SEND</span>
            <v-icon color="#FFF" class="ml-2">mdi-arrow-right</v-icon>
          </v-btn>
        </v-col>
      </v-row>
    </template>
  </div>
</template>

<script lang="ts">
import {
  Vue,
  Component,
  Prop,
  Watch,
} from 'vue-property-decorator';
import SendBitcoinDialog from '@/components/exchange/SendBitcoinDialog.vue';
import SetUp from '@/components/ledger/SetUp.vue';
import * as constants from '@/store/constants';

@Component({
  components: {
    SendBitcoinDialog,
    SetUp,
  },
})
export default class SendBitcoinLedger extends Vue {
  setUpFlag = true;

  bitcoinAmount = 0.0;

  txFeeIndex = 0.0;

  btcRefundAddressSelected = '';

  rskAddressSelected = '';

  transactionFees = ['Slow', 'Average', 'Fast']

  rskAddresses = ['2N5pURPUbPswwLwwiBmBs66WgRbAsyZ69j6', '3M5pURPUbPswwLwwiBmBs66WgRbAsyZ69j7']

  btcRefundAddresses = ['4O5pURPUbPswwLwwiBmBs66WgRbAsyZ69j8', '5P5pURPUbPswwLwwiBmBs66WgRbAsyZ69j9']

  @Prop(String) bitcoinWallet!: string;

  get rbtcAmount() {
    return this.bitcoinAmount;
  }

  get txFeeColor() {
    let color;
    if (this.txFeeIndex === 0) color = 'red';
    if (this.txFeeIndex === 1) color = 'orange';
    if (this.txFeeIndex === 2) color = 'green';
    return color;
  }

  get txFee() {
    let txFee;
    if (this.txFeeIndex === 0) txFee = 'Slow - 0.00292 BTC';
    if (this.txFeeIndex === 1) txFee = 'Average - 0.00317 BTC';
    if (this.txFeeIndex === 2) txFee = 'Fast - 0.00365 BTC';
    return txFee;
  }

  @Watch('bitcoinWallet')
  onBitcoinWalletSelection() {
    if (this.bitcoinWallet === constants.WALLET_LEDGER) console.log('ledger on Send Bitcoin ledger!');
  }
}
</script>
