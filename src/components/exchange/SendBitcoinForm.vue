<template>
  <v-row class="exchange-form">
    <v-col cols="7">
      <v-row class="mx-0 ml-2">
        <v-col cols="1" class="d-flex align-center justify-start">
          <v-img class="d-flex justify-start"
                 src="@/assets/exchange/arrow.png" height="30" contain/>
        </v-col>
        <v-col>
          <h1 class="text-left">Send Bitcoins. Get RBTC.</h1>
        </v-col>
      </v-row>
      <div class="container">
        <v-row class="mx-0 d-flex align-center">
          <span class="number">1</span>
          <p class="mb-0">Select the BTC address from which the funds will be withdrawn:</p>
        </v-row>
        <v-row class="mx-0">
          <v-col cols="9">
            <v-select v-model="btcAddressSelected" :items="utxosAddresses" color="#FFF"
                      label="Don't forget to double check the address" solo dense/>
          </v-col>
        </v-row>
      </div>
      <v-divider class="ml-6 mx-3" color="#C4C4C4"/>
      <div class="container">
        <v-row class="mx-0 d-flex align-center">
          <span class="number">2</span>
          <p class="mb-0">Type the amount you want to convert:</p>
        </v-row>
        <v-row class="mx-0 d-flex align-center container">
          <v-col cols="5" class="pa-0 input-box-outline">
            <v-col cols="8" class="pa-0 pl-1">
              <v-text-field solo hide-details full-width single-line flat
                            v-model="bitcoinAmount" type="number"/>
            </v-col>
            <v-col cols="4" class="pa-0">
              <v-row>
                <v-col cols="5" class="pa-0">
                  <v-img src="@/assets/exchange/btc.png" height="20" contain/>
                </v-col>
                <v-col cols="7" class="pa-0">
                  <span>BTC</span>
                </v-col>
              </v-row>
            </v-col>
          </v-col>
          <v-col cols="1" class="d-flex justify-center">
            <v-icon color="#008CFF">mdi-arrow-right</v-icon>
          </v-col>
          <v-col cols="5" class="pa-0 input-box-flat">
            <v-col cols="8" class="pa-0 pl-1">
              <v-text-field solo hide-details full-width single-line flat
                            v-model="rbtcAmount" type="number"/>
            </v-col>
            <v-col cols="4" class="pa-0">
              <v-row>
                <v-col cols="5" class="pa-0">
                  <v-img src="@/assets/exchange/rbtc.png" height="20" contain/>
                </v-col>
                <v-col cols="7" class="pa-0">
                  <span>RBTC</span>
                </v-col>
              </v-row>
            </v-col>
          </v-col>
        </v-row>
      </div>
      <v-divider class="ml-6 mx-3" color="#C4C4C4"/>
      <div class="container">
        <v-row class="mx-0 d-flex align-center">
          <span class="number">3</span>
          <p class="mb-0">Select the RSK address you want to receive your RBTC:</p>
        </v-row>
        <v-row class="mx-0">
          <v-col cols="7">
            <v-text-field v-model="rskAddressSelected" solo dense
                          label="Select or paste the RSK address"/>
          </v-col>
          <v-divider vertical color="#C4C4C4"/>
          <v-col class="d-flex justify-end">
            <v-row class="mx-0">
              <v-row class="mx-0 d-flex justify-center">
                <span class="text-center">Use your Software Wallet addresses </span>
              </v-row>
              <v-row class="mx-0 d-flex justify-center">
                <v-btn outlined rounded color="#00B520">
                  <span class="greenish">Connect Wallet</span>
                </v-btn>
              </v-row>
            </v-row>
          </v-col>
        </v-row>
      </div>
      <v-divider class="mx-3" color="#C4C4C4"/>
      <div class="container">
        <v-row class="mx-0 d-flex align-center">
          <span class="number">4</span>
          <p class="mb-0">Select the Transaction Fee:</p>
        </v-row>
        <v-row class="mx-0 d-flex justify-center">
          <v-col cols="11">
            <v-row class="mx-0">
              <v-slider v-model="txFeeIndex" :tick-labels="transactionFees" :max="2"
                        :color="txFeeColor" :track-color="txFeeColor" step="1"/>
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
                <span class="boldie text-left">$ 1.07</span>
              </v-col>
              <v-col cols="4" class="d-flex justify-center pa-0">
                <span class="boldie text-center">$ 1.16</span>
              </v-col>
              <v-col cols="4" class="d-flex justify-end pa-0">
                <span class="boldie text-right">$ 1.33</span>
              </v-col>
            </v-row>
          </v-col>
        </v-row>
      </div>
      <v-divider class="mx-3" color="#C4C4C4"/>
      <div class="container">
        <v-row class="mx-0 d-flex align-center">
          <span class="number">5</span>
          <p class="mb-0">Paste your BTC refund address:</p>
        </v-row>
        <v-row class="mx-0">
          <v-col cols="9">
            <v-select v-model="btcRefundAddressSelected" :items="btcNewAddresses" color="#FFF"
                      label="Don't forget to double check the address" solo dense/>
          </v-col>
        </v-row>
      </div>
    </v-col>
    <v-col cols="5">
      <v-row class="mx-0 mt-8">
        <h2>Transaction Summary:</h2>
      </v-row>
      <v-row class="mx-0 summary-box">
        <div class="container">
          <div class="container">
            <v-row class="mx-0">
              <h1>Bitcoins:</h1>
              <v-icon class="ml-2" small color="#008CFF">mdi-check-circle-outline</v-icon>
            </v-row>
            <v-row class="mx-0">
              <p>{{ bitcoinAmount }}</p>
            </v-row>
            <v-row class="mx-0">
              <span>USD $ 12.000,00</span>
            </v-row>
          </div>
          <v-divider color="#C4C4C4"/>
          <div class="container">
            <v-row class="mx-0">
              <h1>Destination RSK Address:</h1>
              <v-icon class="ml-2" small color="#008CFF">mdi-check-circle-outline</v-icon>
            </v-row>
            <v-row class="mx-0">
              <p>{{ computedRskAddress }}</p>
            </v-row>
          </div>
          <v-divider color="#C4C4C4"/>
          <v-row class="mx-0 container">
            <v-col cols="6" class="pa-0">
              <div>
                <v-row class="mx-0">
                  <h1>Transaction Fee:</h1>
                  <v-icon class="ml-2" small color="#008CFF">mdi-check-circle-outline</v-icon>
                </v-row>
                <v-row class="mx-0">
                  <p>{{ txFee }} BTC</p>
                </v-row>
                <v-row class="mx-0">
                  <span>USD $ 1,33</span>
                </v-row>
              </div>
            </v-col>
            <v-col cols="6" class="pa-0">
              <div>
                <v-row class="mx-0">
                  <h1>Transaction Total:</h1>
                  <v-icon class="ml-2" small color="#008CFF">mdi-check-circle-outline</v-icon>
                </v-row>
                <v-row class="mx-0">
                  <p>{{ txFee }} BTC</p>
                </v-row>
                <v-row class="mx-1">
                  <span>USD $ 12.001,33</span>
                </v-row>
              </div>
            </v-col>
          </v-row>
          <v-divider color="#C4C4C4"/>
          <div class="container">
            <v-row class="mx-0">
              <h1>Refund BTC Address:</h1>
              <v-icon class="ml-2" small color="#008CFF">mdi-check-circle-outline</v-icon>
            </v-row>
            <v-row class="mx-0">
              <p>{{ computedRefundBTCAddress }}</p>
            </v-row>
          </div>
        </div>
      </v-row>
      <v-row class="mx-0 mt-5 d-flex justify-end">
        <v-btn large rounded color="#00B43C" @click="toConfirmTx">
          <span class="whiteish">Send</span>
          <v-icon class="ml-2" color="#FFFFFF">mdi-send-outline</v-icon>
        </v-btn>
      </v-row>
    </v-col>
  </v-row>
</template>

<script lang="ts">
import {
  Vue,
  Component,
  Prop,
  Emit,
} from 'vue-property-decorator';
import { Utxo, UnusedWalletAddress } from '@/store/peginTx/types';
import * as constants from '@/store/constants';

@Component
export default class SendBitcoinForm extends Vue {
  bitcoinAmount = 0.0;

  txFeeIndex = 0.0;

  btcRefundAddressSelected = '';

  btcAddressSelected = '';

  rskAddressSelected = '';

  transactionFees = ['Slow', 'Average', 'Fast']

  btcRefundAddresses: string[] = [];

  @Prop(String) bitcoinWallet!: string;

  @Prop() utxos!: Utxo[];

  @Prop() btcUnusedAddresses!: UnusedWalletAddress[];

  get rbtcAmount() {
    return this.bitcoinAmount;
  }

  get computedRefundBTCAddress() {
    return this.btcRefundAddressSelected !== '' ? this.btcRefundAddressSelected : 'Not completed';
  }

  get computedRskAddress() {
    return this.rskAddressSelected !== '' ? this.rskAddressSelected : 'Not completed';
  }

  get txFeeColor() {
    let color;
    if (this.txFeeIndex === 0) color = '#F6C61B';
    if (this.txFeeIndex === 1) color = '#737778';
    if (this.txFeeIndex === 2) color = '#00B43C';
    return color;
  }

  get fullTxFee(): string {
    let txFee = '';
    if (this.txFeeIndex === 0) txFee = 'Slow - 0.00292 BTC';
    if (this.txFeeIndex === 1) txFee = 'Average - 0.00317 BTC';
    if (this.txFeeIndex === 2) txFee = 'Fast - 0.00365 BTC';
    return txFee;
  }

  get txFee(): number {
    let txFee = 0;
    if (this.txFeeIndex === 0) txFee = 0.00292;
    if (this.txFeeIndex === 1) txFee = 0.00317;
    if (this.txFeeIndex === 2) txFee = 0.00365;
    return txFee;
  }

  get walletName() {
    switch (this.bitcoinWallet) {
      case constants.WALLET_LEDGER: {
        return 'Ledger wallet';
      }
      case constants.WALLET_TREZOR: {
        return 'Trezor wallet';
      }
      case constants.WALLET_ELECTRUM: {
        return 'Electrum wallet';
      }
      case constants.WALLET_RWALLET: {
        return 'RWallet';
      }
      case constants.WALLET_DEFIANT: {
        return 'Defiant wallet';
      }
      default: {
        return 'wallet';
      }
    }
  }

  get utxosAddresses() {
    const tmp: string[] = [];
    this.utxos.forEach((utxo: Utxo) => {
      if (utxo.address !== undefined) {
        const btc = this.satoshiToBtc(Number(utxo.amount));
        tmp.push(`${utxo.address} - ${btc} BTC`);
      }
    });
    return tmp;
  }

  get btcNewAddresses() {
    const tmp: string[] = [];
    this.btcUnusedAddresses.forEach((uadr: UnusedWalletAddress, idx) => {
      if ('address' in uadr && idx < 5) {
        tmp.push(uadr.address);
      }
    });
    return tmp;
  }

  @Emit('sendBTC')
  sendBitcoin(): object {
    return {
      bitcoinAmount: this.bitcoinAmount,
      btcRefundAddressSelected: this.btcRefundAddressSelected,
      rskAddressSelected: this.rskAddressSelected,
      fullTxFee: this.txFee,
      txFee: this.fullTxFee,
    };
  }

  @Emit('confirmTx')
  toConfirmTx() {
    return this.bitcoinWallet;
  }

  @Emit()
  // eslint-disable-next-line class-methods-use-this
  satoshiToBtc(satoshis: number): number {
    return satoshis * 0.00000001;
  }
}
</script>
