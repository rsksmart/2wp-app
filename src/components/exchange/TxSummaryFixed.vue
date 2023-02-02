<template>
  <v-container v-if="type && orientation">
    <v-row justify="center" class="mx-0 pb-4">
      <h2 class="text-center tx-text">
        Transaction summary:
      </h2>
    </v-row>
    <v-row v-if="orientation === orientationTypes.HORIZONTAL"
           class="mx-0 d-flex justify-center">
      <v-col sm="10"
             md="9"
             lg="8"
             xl="7">
        <v-row class="d-flex justify-center mb-n3">
          <v-btn class="btn-focus-out" fab x-small outlined color="green" @click="switchExpand"
                 v-bind:class="[this.over ? 'expand-btn-active' : 'expand-btn-inactive']"
                 @mouseover="over = true" @mouseleave="over = false">
            <span class="content">
              {{ expanded ? '-' : '+'}}
            </span>
          </v-btn>
        </v-row>
        <div class="box-pegin box" v-show="expanded">
          <v-row>
            <v-col class="box-col bitcoin-col" cols="6">
              <v-row class="status-title">
                <span>{{ fromTitle }}</span>
              </v-row>

              <!-- refundAddress -->
              <v-row v-if="!!summary.refundAddress" class="box-field mx-1">
                <v-col>
                  <v-row>
                    <span class="status-subtitle">Refund Address</span>
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
                    <v-col class="form-field-summary">
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

              <!-- Sender -->
              <v-row v-if="!!summary.senderAddress" class="box-field mx-1">
                <v-col>
                  <v-row>
                    <span class="status-subtitle">Sender</span>
                  </v-row>
                  <v-row>
                    <v-col class="form-field-summary">
                      <v-row>
                        <v-col cols="12"
                               class="col-address-button d-flex flex-column justify-end">
                          <span class="breakable-address status-text-ellipsis">
                            {{ summary.senderAddress }}
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
                    <v-col class="form-field-summary">
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
              <v-row v-if="summary.federationAddress" class="box-field mx-1">
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
                    <v-col class="form-field-summary">
                      <span class="status-text-ellipsis">
                        {{ federationAddress}}
                      </span>
                    </v-col>
                  </v-row>
                </v-col>
              </v-row>

              <!-- transaction hash -->
              <v-row v-if="summary.txId" class="box-field mx-1">
                <v-col>
                  <v-row>
                    <span class="status-subtitle">Transaction hash</span>
                    <v-tooltip right>
                      <template v-slot:activator="{ on, attrs }">
                        <v-icon small color="teal darken-2"
                                v-bind="attrs" v-on="on">
                          mdi-information
                        </v-icon>
                      </template>
                      <p class="tooltip-form mb-0">
                        Verify the transaction on
                        {{networkFromText}} block explorer.
                      </p>
                    </v-tooltip>
                  </v-row>
                  <v-row>
                    <v-col class="form-field-summary">
                      <v-row class="justify-end">
                        <v-col cols="11"
                               class="col-address-button d-flex flex-column">
                          <span class="breakable-address status-text-ellipsis">
                            {{ summary.txId }}
                          </span>
                        </v-col>
                        <v-col cols="1" class="col-address-button">
                          <v-btn @click="openExplorerTx" icon color="#C4C4C4" x-small>
                            <v-icon>mdi-open-in-new</v-icon>
                          </v-btn>
                        </v-col>
                      </v-row>
                    </v-col>
                  </v-row>
                </v-col>
              </v-row>

              <!-- TODO: Fee to pay -->
            </v-col>

            <v-divider inset vertical/>

            <v-col class="box-col rsk-col" cols="6">
              <v-row class="status-title justify-end">
                <span>{{ toTitle }}</span>
              </v-row>

              <!-- Recipient -->
              <v-row v-if="summary.recipientAddress" class="box-field mx-1">
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
                        This is the {{networkFromText}}
                        address where the
                        {{networkToText}} will be delivered.
                      </p>
                    </v-tooltip>
                  </v-row>
                  <v-row>
                    <v-col class="form-field-summary">
                      <v-row class="justify-end">
                        <v-col cols="11"
                               class="col-address-button d-flex flex-column">
                            <span class="breakable-address status-text-ellipsis">
                              {{recipientAddress}}
                            </span>
                        </v-col>
                        <v-col cols="1" class="col-address-button">
                          <v-btn @click="openExplorerToAddress" icon color="#C4C4C4" x-small>
                            <v-icon>mdi-open-in-new</v-icon>
                          </v-btn>
                        </v-col>
                      </v-row>
                    </v-col>
                  </v-row>
                </v-col>
              </v-row>

              <!-- will receive -->
              <v-row v-if="summary.amountReceivedString !== '0'" class="box-field mx-1">
                <v-col>
                  <v-row class="justify-end">
                    <span class="status-subtitle">Will receive</span>
                  </v-row>
                  <v-row>
                    <v-col class="form-field-summary">
                      <v-row class="justify-end mx-0 mb-2">
                        <span>{{ amountToReceive }} {{ currencyToTicker }}</span>
                      </v-row>
                      <v-row class="justify-end mx-0">
                        <span class="grayish" id="fee-usd">USD $ {{ amountToReceiveUSD }}</span>
                      </v-row>
                    </v-col>
                  </v-row>
                </v-col>
              </v-row>

              <!-- Total -->
              <v-row class="box-field mx-1">
                <v-col>
                  <v-row class="justify-end">
                    <span class="status-subtitle">Total</span>
                  </v-row>
                  <v-row>
                    <v-col class="form-field-summary">
                      <v-row class="justify-end mx-0 mb-2">
                        <span>{{ total }} {{ currencyFromTicker }}</span>
                      </v-row>
                      <v-row class="justify-end mx-0">
                        <span class="grayish" id="fee-usd">USD $ {{ totalUSD }}</span>
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
    <v-row v-if="orientation === orientationTypes.VERTICAL"
           class="mx-0 d-flex justify-center">
      {{summary}}
    </v-row>
  </v-container>
</template>

<script lang="ts">
import {
  Component, Emit, Prop, Vue,
} from 'vue-property-decorator';
import {
  NormalizedSummary,
  SatoshiBig,
  SessionState,
  TxStatusType,
  TxSummaryOrientation,
} from '@/types';
import { formatTxId, getBtcAddressExplorerUrl, getBtcTxExplorerUrl } from '@/services/utils';
import EnvironmentContextProviderService from '@/providers/EnvironmentContextProvider';
import { State } from 'vuex-class';
import { EnvironmentAccessorService } from '@/services/enviroment-accessor.service';
import * as constants from '@/store/constants';
import Big from 'big.js';

@Component
export default class TxSummaryFixed extends Vue {
  @Prop() initialExpand!: boolean;

  @Prop() summary!: NormalizedSummary;

  @Prop() type!: TxStatusType;

  @Prop() orientation !: TxSummaryOrientation;

  expanded = true;

  over = false;

  fixedUSDDecimals = 2;

  VALUE_INCOMPLETE_MESSAGE = 'Not Found';

  environmentContext = EnvironmentContextProviderService.getEnvironmentContext();

  orientationTypes = TxSummaryOrientation;

  @State('web3Session') sessionState!: SessionState;

  @Emit()
  switchExpand() {
    this.expanded = !this.expanded;
  }

  get fromTitle() {
    return this.type === TxStatusType.PEGIN ? 'Bitcoin' : 'RSK';
  }

  get toTitle() {
    return this.type === TxStatusType.PEGIN ? 'RSK' : 'Bitcoin';
  }

  get computedRefundAddress(): string {
    let refundAddress = this.VALUE_INCOMPLETE_MESSAGE;
    if (this.summary.refundAddress) {
      refundAddress = this.summary.refundAddress;
    }
    return refundAddress;
  }

  get currencyFromTicker() {
    return this.type === TxStatusType.PEGIN ? this.environmentContext.getBtcTicker()
      : this.environmentContext.getRbtcTicker();
  }

  get currencyToTicker() {
    return this.type === TxStatusType.PEGIN ? this.environmentContext.getRbtcTicker()
      : this.environmentContext.getBtcTicker();
  }

  get amount(): string {
    return this.summary.amountFromString || this.VALUE_INCOMPLETE_MESSAGE;
  }

  get amountToReceive(): string {
    return this.summary.amountReceivedString || this.VALUE_INCOMPLETE_MESSAGE;
  }

  get total(): string {
    const amount = new Big(this.summary.amountFromString);
    const fee = new Big(this.summary.fee);
    return amount.plus(fee).toString() || this.VALUE_INCOMPLETE_MESSAGE;
  }

  get amountUSD(): string {
    const amount = new SatoshiBig(this.summary.amountFromString || 0, 'btc');
    const { bitcoinPrice } = this.sessionState;
    if (!amount || !bitcoinPrice) return this.VALUE_INCOMPLETE_MESSAGE;
    return amount.toUSDFromBTCString(bitcoinPrice, this.fixedUSDDecimals);
  }

  get amountToReceiveUSD(): string {
    const amount = new SatoshiBig(this.summary.amountReceivedString || 0, 'btc');
    const { bitcoinPrice } = this.sessionState;
    if (!amount || !bitcoinPrice) return this.VALUE_INCOMPLETE_MESSAGE;
    return amount.toUSDFromBTCString(bitcoinPrice, this.fixedUSDDecimals);
  }

  get totalUSD(): string {
    const total = this.total === this.VALUE_INCOMPLETE_MESSAGE ? 0 : this.total;
    const amount = new SatoshiBig(total, 'btc');
    const { bitcoinPrice } = this.sessionState;
    if (!amount || !bitcoinPrice) return this.VALUE_INCOMPLETE_MESSAGE;
    return amount.toUSDFromBTCString(bitcoinPrice, this.fixedUSDDecimals);
  }

  get federationAddress(): string {
    return this.summary.federationAddress
      ? formatTxId(this.summary.federationAddress) : this.VALUE_INCOMPLETE_MESSAGE;
  }

  get networkFromText(): string {
    if (this.type === TxStatusType.PEGIN) {
      return this.environmentContext.getBtcText();
    }
    return this.environmentContext.getRskText();
  }

  get networkToText(): string {
    if (this.type === TxStatusType.PEGIN) {
      return this.environmentContext.getRskText();
    }
    return this.environmentContext.getBtcText();
  }

  get recipientAddress():string {
    return this.summary.recipientAddress !== '0x'
      ? this.summary.recipientAddress
      : this.VALUE_INCOMPLETE_MESSAGE;
  }

  openExplorerTx() {
    const network = EnvironmentAccessorService.getEnvironmentVariables().vueAppCoin === constants.BTC_NETWORK_MAINNET ? '' : '.testnet';
    const explorerRSK = `https://explorer${network}.rsk.co`;
    const sanitizedTxId = this.summary.txId?.startsWith('0x')
      ? this.summary.txId?.substring(2, (this.summary.txId?.length))
      : this.summary.txId;
    if (this.type === TxStatusType.PEGIN) {
      window.open(getBtcTxExplorerUrl(sanitizedTxId || ''), '_blank');
    } else {
      window.open(`${explorerRSK}/tx/${this.summary.txId}`, '_blank');
    }
  }

  @Emit()
  openExplorerToAddress() {
    const network = EnvironmentAccessorService.getEnvironmentVariables().vueAppCoin === constants.BTC_NETWORK_MAINNET ? '' : '.testnet';
    const explorerRSK = `https://explorer${network}.rsk.co`;
    if (this.type === TxStatusType.PEGIN) {
      window.open(`${explorerRSK}/address/${this.summary.recipientAddress}`, '_blank');
    } else {
      window.open(getBtcAddressExplorerUrl(this.summary.recipientAddress || ''), '_blank');
    }
  }
}
</script>
