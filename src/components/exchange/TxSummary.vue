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
        <button v-show="expanded" @click="switchExpand"
                @mouseover="isMouseOver = true" @mouseleave="isMouseOver = false">
          <v-img v-show="!isMouseOver" src="@/assets/status/collapse-2.png"
                 contain eager max-width="30" />
          <v-img v-show="isMouseOver" src="@/assets/status/collapse-2-green.png"
                 contain eager max-width="30" />
        </button>
        <button v-show="!expanded" @click="switchExpand"
                @mouseover="isMouseOver = true" @mouseleave="isMouseOver = false">
          <v-img v-show="!isMouseOver" src="@/assets/status/collapse.png"
                 contain eager max-width="30" />
          <v-img v-show="isMouseOver" src="@/assets/status/collapse-green.png"
                 contain eager max-width="30" />
        </button>
      </v-row>
      <v-expand-transition>
        <div class="box" v-show="expanded">
          <v-row class="mx-0 py-2">
            <v-col cols="4 py-0 ">
              <v-row class="mx-0">
                <v-col>
                  <v-col class="mb-2">
                    <v-row class="mx-0">
                      <h3>{{environmentContext.getBtcText()}}s</h3>
                    </v-row>
                    <v-row class="mx-0">
                      <span>{{ amount }} {{environmentContext.getBtcTicker()}}</span>
                    </v-row>
                    <v-row class="mx-0">
                      <span class="grayish" id="amount-usd"> USD $ {{ amountUSD }}</span>
                    </v-row>
                  </v-col>
                  <!-- <v-col class="mb-2">
                    <v-row class="mx-0">
                      <h3>Transaction fee</h3>
                    </v-row>
                    <v-row class="mx-0">
                      <span>{{ fee }} {{environmentContext.getBtcTicker()}}</span>
                    </v-row>
                    <v-row class="mx-0">
                      <span class="grayish" id="fee-usd">USD $ {{ feeUSD }}</span>
                    </v-row>
                  </v-col> -->
                  <v-col>
                    <v-row class="mx-0">
                      <h3>Transaction total</h3>
                    </v-row>
                    <v-row class="mx-0">
                      <span>{{ feePlusAmount }} {{environmentContext.getBtcTicker()}}</span>
                    </v-row>
                    <v-row class="mx-0">
                      <span class="grayish" id="total-usd">USD $ {{ feePlusAmountUSD }}</span>
                    </v-row>
                  </v-col>
                </v-col>
              </v-row>
            </v-col>
            <v-divider inset vertical/>
            <!-- <v-col cols="8" class="px-0 pl-lg-4 pt-0 pb-0">
              <v-container class="pr-md-0">
                <v-row class="mx-0" align="start">
                  <h3 class="mr-1">Destination {{environmentContext.getRskText()}} address</h3>
                  <v-tooltip right>
                    <template v-slot:activator="{ on, attrs }">
                      <v-icon small color="teal darken-2" v-bind="attrs" v-on="on">
                        mdi-information
                      </v-icon>
                    </template>
                    <p class="tooltip-form mb-0">
                      This is the {{environmentContext.getRskText()}} address where the
                      {{environmentContext.getRbtcTicker()}} will be delivered.
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
                  <h3 class="mr-1">Refund {{environmentContext.getBtcText()}} address</h3>
                  <v-tooltip right>
                    <template v-slot:activator="{ on, attrs }">
                      <v-icon small color="teal darken-2" v-bind="attrs" v-on="on">
                        mdi-information
                      </v-icon>
                    </template>
                    <p class="tooltip-form mb-0">
                      Rejected transactions will be refunded to this
                      {{environmentContext.getBtcText()}} address.
                    </p>
                  </v-tooltip>
                </v-row>
                <v-row class="mx-0">
                  <span class="breakable-address">{{ computedRefundAddress }}</span>
                </v-row>
              </v-container>
              <template v-if="showTxId">
                <v-divider/>
                <div class="container">
                  <v-row class="mx-0">
                    <h3>{{environmentContext.getBtcText()}} transaction id</h3>
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
                    <h3 class="mr-1">PowPeg {{environmentContext.getBtcText()}} Address</h3>
                    <v-tooltip right>
                      <template v-slot:activator="{ on, attrs }">
                        <v-icon small color="teal darken-2" v-bind="attrs" v-on="on">
                          mdi-information
                        </v-icon>
                      </template>
                      <p class="tooltip-form mb-0">
                        This is the {{environmentContext.getBtcText()}}
                        address where your {{environmentContext.getBtcTicker()}}s
                        are sent for conversion.
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
            </v-col> -->
          </v-row>
        </div>
      </v-expand-transition>
    </v-col>
  </v-row>
</template>

<script lang="ts">
import {
  Component, Emit, Vue,
} from 'vue-property-decorator';
import { State, Getter } from 'vuex-class';
import { TxData } from '@/types';
import * as constants from '@/store/constants';
import { EnvironmentAccessorService } from '@/services/enviroment-accessor.service';
import EnvironmentContextProviderService from '@/providers/EnvironmentContextProvider';

@Component
export default class TxSummary extends Vue {
  txIdValue = '';

  expanded = false;
  
  expandOver = false;

  @State('txData') txData!: TxData;

  @State('price') price!: number;

  @State('txId') txId!: string;

  @State('showTxId') showTxId!: boolean;

  @State('initialExpand') initialExpand!: boolean;

  @State('rskFederationAddress') rskFederationAddress!: string;

  @Getter(constants.TX_SUMMARY_GET_AMOUNT_USD, { namespace: 'txSummary' }) amountUSD!: () => string;

  @Getter(constants.TX_SUMMARY_GET_FEE, { namespace: 'txSummary' }) fee!: () => string;

  @Getter(constants.TX_SUMMARY_GET_FEE_USD, { namespace: 'txSummary' }) feeUSD!: () => string;

  @Getter(constants.TX_SUMMARY_GET_FEE_PLUS_AMOUNT, { namespace: 'txSummary' }) feePlusAmount!: () => string;

  environmentContext = EnvironmentContextProviderService.getEnvironmentContext();

  get amount(): string {
    if (!this.txData.amount) return constants.VALUE_INCOMPLETE_MESSAGE;
    return this.txData.amount.toBTCString();
  }

  @Getter(constants.TX_SUMMARY_GET_CHUNKED_REFUND_ADDRESS, { namespace: 'txSummary' }) chunkedRecipientAddress!: () => string;

  @Getter(constants.TX_SUMMARY_GET_COMPUTED_TX_ID, { namespace: 'txSummary' }) computedTxId!: () => string;
  
  @Getter(constants.TX_SUMMARY_GET_COMPUTED_REFUND_ADDRESS, { namespace: 'txSummary' }) computedRefundAddress!: () => string;

  @Emit()
  switchExpand() {
    this.expanded = !this.expanded;
  }

  @Emit()
  toRskExplorer() {
    const network = EnvironmentAccessorService.getEnvironmentVariables().vueAppCoin === constants.BTC_NETWORK_MAINNET ? '' : '.testnet';
    window.open(`https://explorer${network}.rsk.co/address/${this.txData.recipient}`, '_blank');
  }

  created() {
    this.expanded = this.initialExpand;
    this.txIdValue = this.txId;
  }
}
</script>