<template>
  <v-container fluid class="transactions summary-container normalized-height mx-6">
    <div class="box">
        <v-row class="mx-0 py-2">
            <v-col cols="6 px-0">
                <v-row>
                    <v-container>
                        <span class="status-title">Bitcoin</span>
                    </v-container>
                </v-row>

                <v-row class="mx-0">
                    <v-col>
                        <v-col var="!!computedRefundAddress" v-if="true">
                            <v-row class="mx-0" align="start">
                                <span class="status-subtitle mr-1">Sender</span>
                                <!--
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
                                -->
                            </v-row>
                            <v-row class="form-field mx-0">
                                <span var="computedRefundAddress" class="breakable-address">0x8d7fDaAA49Cb8E7639486d7385Fd3C2bF63BE1Bb</span>
                            </v-row>
                        </v-col>

                        <v-col>
                            <v-row class="mx-0">
                                <span class="status-subtitle">Sent</span>
                            </v-row>
                            <v-container class="form-field">
                                <v-row class="mx-0 mb-2">
                                    <span id="amount">0.0050000 TBTC</span>
                                </v-row>
                                <v-row class="mx-0">
                                    <span class="grayish" id="amount-usd"> USD $ 96.46</span>
                                </v-row>
                            </v-container>
                        </v-col>

                        <template>
                            <v-container>
                                <v-row class="mx-0" align="start">
                                    <span class="status-subtitle mr-1">PowPeg Address</span>
                                <!--
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
                                -->
                                </v-row>
                                <v-row class="form-field mx-0">
                                    <span var="rskFederationAddress" class="status-text-ellipsis">0xa0f205c2d83a12a6228f8abd299df290c3a89db37975e4849efc4d911a97d37d</span>
                                </v-row>
                            </v-container>
                        </template>

                        <template var="showTxId" v-if="true">
                            <v-container>
                                <v-row class="mx-0">
                                    <span class="status-subtitle">Transaction hash</span>
                                </v-row>
                                <v-row class="form-field mx-0">
                                    <span 
                                    class="status-text-ellipsis" 
                                    var="computedTxId">0xa0f205c2d83a12a6228f8abd299df290c3a89db37975e4849efc4d911a97d37d</span>
                                </v-row>
                            </v-container>
                        </template>

                    </v-col>
                </v-row>
            </v-col>

            <v-divider inset vertical/>

            <v-col cols="6 px-0">
                <v-row>
                    <v-container>
                        <span class="status-title status-rsk">RSK</span>
                    </v-container>
                </v-row>

                <v-row class="mx-0">
                    <v-col>
                        <v-col>
                            <v-row class="mx-0" align="start">
                                <span class="status-subtitle mr-1">Recipient</span>
                                <!--
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
                                -->
                            </v-row>
                            <v-row class="form-field mx-0">
                                <v-col cols="auto"
                                        class="d-flex flex-column justify-end ma-0 pa-0">
                                    <span var="peginTxState.rskAddressSelected" class="breakable-address">
                                        <!-- {{
                                        peginTxState.rskAddressSelected !== '0x'
                                        ?
                                        peginTxState.rskAddressSelected
                                        :
                                        VALUE_INCOMPLETE_MESSAGE
                                        }}--> 
                                        0x8d7fDaAA49Cb8E7639486d7385Fd3C2bF63BE1Bb
                                        </span>
                                </v-col>
                                <v-col cols="auto"
                                        class="d-flex flex-column justify-end ma-0 pa-0 ml-lg-1">
                                    <v-btn @click="toRskExplorer" icon color="#C4C4C4" x-small>
                                        <v-icon>mdi-open-in-new</v-icon>
                                    </v-btn>
                                </v-col>
                            </v-row>
                        </v-col>

                        <v-col>
                            <v-row class="mx-0">
                               <span class="status-subtitle">Will receive</span>
                            </v-row>
                            <v-container class="form-field">
                                <v-row class="mx-0 mb-2">
                                    <span var="fee">0.000016 {{environmentContext.getBtcTicker()}}</span>
                                </v-row>
                                <v-row class="mx-0">
                                    <span class="grayish" var="feeUSD" id="fee-usd">USD $ 0.20</span>
                                </v-row>
                            </v-container>
                        </v-col>

                        <v-col>
                            <v-row class="mx-0">
                                <span class="status-subtitle">Fee to pay</span>
                            </v-row>
                            <v-container class="form-field">
                                <v-row class="mx-0 mb-2">
                                    <span>0.0050 {{environmentContext.getBtcTicker()}}</span>
                                </v-row>
                                <v-row class="mx-0">
                                    <span class="grayish" var="feePlusAmountUSD" id="total-usd">USD $ 98.66</span>
                                </v-row>
                            </v-container>
                        </v-col>
                    </v-col>
                </v-row>
            </v-col>
        </v-row>
    </div>
  </v-container>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import EnvironmentContextProviderService from '@/providers/EnvironmentContextProvider';

@Component({})
export default class Summary extends Vue {
    environmentContext = EnvironmentContextProviderService.getEnvironmentContext();
    toRskExplorer() {}
}
</script>
