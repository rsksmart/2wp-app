<template>
  <v-row class="mx-0 d-flex justify-center">
    <v-col sm="10"
            md="9"
           lg="8"
           xl="7">
      <v-row justify="center" class="mx-0 pb-4">
        <h2 class="text-center tx-text">Transaction summary:</h2>
      </v-row>
      <v-row class="d-flex justify-center mb-n3">
        <v-btn class="btn-focus-out" fab x-small outlined color="green" @click="switchExpand"
               v-bind:class="[this.over ? 'expand-btn-active' : 'expand-btn-inactive']"
               @mouseover="over = true" @mouseleave="over = false">
          <span class="content">
            {{ expanded ? '-' : '+'}}
          </span>
        </v-btn>
      </v-row>

      <div class="box-pegin box">
        <v-row>
         <!-- >>>>>>>>>>>>>> BITCOIN >>>>>>>>>>>>> -->
          <v-col class="box-col bitcoin-col" cols="6">
            <v-row class="status-title">
              <span>{{ fromTitle }}</span>
            </v-row>

            <!-- sender -->
            <v-row v-if="!!computedRefundAddress" class="box-field mx-1">
              <v-col>
                <v-row>
                    <span class="status-subtitle">Sender</span>
                    <v-tooltip right>
                        <template v-slot:activator="{ on, attrs }">
                            <v-icon small color="teal darken-2"
                            v-bind="attrs" v-on="on">
                            mdi-information
                            </v-icon>
                        </template>
                        <p class="tooltip-form mb-0">
                            Rejected transactions will be refunded to this
                              {{environmentContext.getBtcText()}} address.
                        </p>
                    </v-tooltip>
                </v-row>
                <v-row>
                  <v-col class="form-field">
                    <v-row>
                      <v-col cols="12"
                        class="col-address-button d-flex flex-column justify-end">
                        <span class="breakable-address status-text-ellipsis">
                          {{ computedRefundAddress }}
                        </span>
                      </v-col>
                    </v-row>
                  </v-col>
                </v-row>
              </v-col>
            </v-row>

            <!-- sent -->
            <v-row class="box-field mx-1">
              <v-col>
                <v-row>
                  <span class="status-subtitle">Sent</span>
                </v-row>
                <v-row>
                  <v-col class="form-field">
                    <v-row class="mx-0 mb-2">
                      <span id="amount">
                        {{ amount }} {{ currencyFromTicker }}
                      </span>
                    </v-row>
                    <v-row class="mx-0">
                      <span class="grayish" id="amount-usd">
                        USD $ {{ amountUSD }}
                      </span>
                    </v-row>
                  </v-col>
                </v-row>
              </v-col>
            </v-row>

            <!-- PowPeg Address -->
            <v-row class="box-field mx-1">
              <v-col>
                <v-row>
                    <span class="status-subtitle">PowPeg Address</span>
                    <v-tooltip right>
                        <template v-slot:activator="{ on, attrs }">
                          <v-icon small color="teal darken-2"
                          v-bind="attrs" v-on="on">
                              mdi-information
                          </v-icon>
                        </template>
                        <p class="tooltip-form mb-0">
                        This is the {{environmentContext.getBtcText()}}
                        address where your {{environmentContext.getBtcTicker()}}s
                        are sent for conversion.
                        </p>
                        <p class="tooltip-form mb-0">
                        Validate this in your device before
                        confirming the transaction.
                        </p>
                    </v-tooltip>
                </v-row>
                <v-row>
                  <v-col class="form-field">
                    <span class="status-text-ellipsis">
                      {{ rskFederationAddress }}
                    </span>
                  </v-col>
                </v-row>
              </v-col>
            </v-row>

            <!-- transaction hash -->
            <v-row v-if="showTxId" class="box-field mx-1">
              <v-col>
                <v-row>
                  <span class="status-subtitle">Transaction hash</span>
                </v-row>
                <v-row>
                  <v-col class="form-field">
                   <span class="status-text-ellipsis">{{ computedTxId }}</span>
                  </v-col>
                </v-row>
              </v-col>
            </v-row>
          </v-col>

          <v-divider inset vertical/>

          <!-- >>>>>>>>>>>>>> RSK >>>>>>>>>>>>> -->
          <v-col class="box-col rsk-col" cols="6">
            <v-row class="status-title justify-end">
              <span>{{ toTitle }}</span>
            </v-row>

            <!-- Recipient -->
            <v-row class="box-field mx-1">
              <v-col>
                <v-row class="justify-end">
                    <span class="status-subtitle">Recipient</span>
                    <v-tooltip right>
                      <template v-slot:activator="{ on, attrs }">
                          <v-icon small color="teal darken-2"
                          v-bind="attrs" v-on="on">
                          mdi-information
                          </v-icon>
                      </template>
                      <p class="tooltip-form mb-0">
                          This is the {{environmentContext.getRskText()}}
                            address where the
                          {{environmentContext.getRbtcTicker()}} will be delivered.
                      </p>
                    </v-tooltip>
                </v-row>
                <v-row>
                  <v-col class="form-field">
                    <v-row class="justify-end">
                      <v-col cols="11"
                        class="col-address-button d-flex flex-column">
                          <span class="breakable-address status-text-ellipsis">
                            {{
                            peginTxState.rskAddressSelected !== '0x'
                            ?
                            peginTxState.rskAddressSelected
                            :
                            VALUE_INCOMPLETE_MESSAGE
                            }}
                          </span>
                        </v-col>
                        <v-col cols="1" class="col-address-button">
                          <v-btn @click="toRskExplorer" icon color="#C4C4C4" x-small>
                              <v-icon>mdi-open-in-new</v-icon>
                          </v-btn>
                        </v-col>
                    </v-row>
                  </v-col>
                </v-row>
              </v-col>
            </v-row>

            <!-- will receibe -->
            <v-row class="box-field mx-1">
              <v-col>
                <v-row class="justify-end">
                  <span class="status-subtitle">Will receive</span>
                </v-row>
                <v-row>
                  <v-col class="form-field">
                    <v-row class="justify-end mx-0 mb-2">
                      <span>{{ amount }} {{ currencyToTicker }}</span>
                    </v-row>
                    <v-row class="justify-end mx-0">
                      <span class="grayish" id="fee-usd">USD $ {{ feeUSD }}</span>
                    </v-row>
                  </v-col>
                </v-row>
              </v-col>
            </v-row>

            <!-- Fee to pay -->
            <v-row class="box-field mx-1">
              <v-col>
                <v-row class="justify-end">
                  <span class="status-subtitle">Fee to pay</span>
                </v-row>
                <v-row>
                  <v-col class="form-field">
                    <v-row class="justify-end mx-0 mb-2">
                      <span>
                        {{ feePlusAmount }} {{ currencyFromTicker }}
                      </span>
                    </v-row>
                  <v-row class="justify-end mx-0">
                      <span class="grayish" id="total-usd">
                        USD $ {{ feePlusAmountUSD }}
                      </span>
                    </v-row>
                  </v-col>
                </v-row>
              </v-col>
            </v-row>

          </v-col>
        </v-row>
      </div>
    </v-col>
  </v-row>
</template>

<script lang="ts">
import {
  Component, Emit, Vue, Prop,
} from 'vue-property-decorator';
import Big from 'big.js';
import { State, Getter } from 'vuex-class';
import * as constants from '@/store/constants';
import SatoshiBig from '@/types/SatoshiBig';
import { EnvironmentAccessorService } from '@/services/enviroment-accessor.service';
import EnvironmentContextProviderService from '@/providers/EnvironmentContextProvider';
import { PegInTxState } from '@/types/pegInTx';
import { formatTxId } from '@/services/utils';

@Component
export default class TxSummary extends Vue {
  @Prop() initialExpand!: boolean;

  @Prop() showTxId!: boolean;

  @Prop() txId!: string;

  @Prop() isPegIn!: boolean;

  @Prop() statusRefundAddress!: string;

  expanded = true;

  over = false;

  fixedUSDDecimals = 2;

  VALUE_INCOMPLETE_MESSAGE = 'Not Found';

  environmentContext = EnvironmentContextProviderService.getEnvironmentContext();

  @State('pegInTx') peginTxState!: PegInTxState;

  @Getter(constants.PEGIN_TX_GET_REFUND_ADDRESS, { namespace: 'pegInTx' }) refundAddress!: string;

  @Getter(constants.PEGIN_TX_GET_SAFE_TX_FEE, { namespace: 'pegInTx' }) safeFee!: SatoshiBig;

  @Getter(constants.PEGIN_TX_GET_STATUS_TX_ID, { namespace: 'pegInTx' }) txIdValue!: string;

  @Emit()
  switchExpand() {
    this.expanded = !this.expanded;
  }

  get amount(): string {
    if (!this.peginTxState.amountToTransfer) return this.VALUE_INCOMPLETE_MESSAGE;
    return this.peginTxState.amountToTransfer.toBTCString();
  }

  get amountUSD(): string {
    const { amountToTransfer, bitcoinPrice } = this.peginTxState;
    if (!amountToTransfer || !bitcoinPrice) return this.VALUE_INCOMPLETE_MESSAGE;
    return amountToTransfer.toUSDFromBTCString(bitcoinPrice, this.fixedUSDDecimals);
  }

  get feeBTC():SatoshiBig {
    return this.safeFee;
  }

  get fee(): string {
    if (!this.feeBTC) return this.VALUE_INCOMPLETE_MESSAGE;
    return this.feeBTC.toBTCString();
  }

  get feeUSD(): string {
    if (!this.feeBTC || !this.peginTxState.bitcoinPrice) return this.VALUE_INCOMPLETE_MESSAGE;
    return this.feeBTC.toUSDFromBTCString(this.peginTxState.bitcoinPrice, this.fixedUSDDecimals);
  }

  get feePlusAmount(): string {
    if (!this.peginTxState.amountToTransfer || !this.feeBTC) return this.VALUE_INCOMPLETE_MESSAGE;
    return this.peginTxState.amountToTransfer.plus(this.feeBTC).toBTCString();
  }

  get feePlusAmountUSD(): string {
    if (!this.amount || !this.feeBTC || !this.peginTxState.bitcoinPrice) {
      return this.VALUE_INCOMPLETE_MESSAGE;
    }
    return Big(this.amountUSD).plus(Big(this.feeUSD)).toFixed(this.fixedUSDDecimals);
  }

  get chunkedRecipientAddress(): string {
    const recipient = this.peginTxState.rskAddressSelected;
    return recipient ? `${recipient.substr(0, 25)}...${recipient.substr(38, 42)}` : this.VALUE_INCOMPLETE_MESSAGE;
  }

  get computedTxId(): string {
    let result;
    if (this.txIdValue) {
      result = formatTxId(this.txIdValue);
    } else if (this.txId) {
      result = formatTxId(this.txId);
    } else {
      result = this.VALUE_INCOMPLETE_MESSAGE;
    }
    return result;
  }

  get computedRefundAddress(): string {
    let result;
    const refundAddr = this.statusRefundAddress ? this.statusRefundAddress : this.refundAddress;
    if (refundAddr !== '0x') {
      result = refundAddr;
    } else {
      result = this.VALUE_INCOMPLETE_MESSAGE;
    }
    return result;
  }

  get rskFederationAddress() {
    return this.peginTxState.peginConfiguration.federationAddress;
  }

  get currencyFromTicker() {
    return this.isPegIn ? this.environmentContext.getBtcTicker()
      : this.environmentContext.getRbtcTicker();
  }

  get currencyToTicker() {
    return this.isPegIn ? this.environmentContext.getRbtcTicker()
      : this.environmentContext.getBtcTicker();
  }

  get fromTitle() {
    return this.isPegIn ? 'Bitcoin' : 'RSK';
  }

  get toTitle() {
    return this.isPegIn ? 'RSK' : 'Bitcoin';
  }

  @Emit()
  toRskExplorer() {
    const network = EnvironmentAccessorService.getEnvironmentVariables().vueAppCoin === constants.BTC_NETWORK_MAINNET ? '' : '.testnet';
    window.open(`https://explorer${network}.rsk.co/address/${this.peginTxState.rskAddressSelected}`, '_blank');
  }

  created() {
    this.expanded = this.initialExpand;
  }
}
</script>
