<template>
<v-container fluid class="form normalized-height container
  max-width mx-6 mt-6">
  <v-col>
    <v-row class="d-flex justify-center">
      <h2 class="d-flex justify-center">Send {{environmentContext.getRbtcTicker()}}.
        Get {{environmentContext.getBtcTicker()}}.</h2>
    </v-row>
    <v-row>
      <v-col cols="8" lg="7" >
        <rsk-wallet-connection/>
        <v-divider color="#C4C4C4"/>
        <rbtc-input-amount/>
        <v-divider color="#C4C4C4"/>
        <v-container class="form-step">
          <v-row align="start mx-0">
            <v-col cols="auto" class="pl-0">
              <div v-bind:class="[focus ?
              'number-filled' : 'number']">3</div>
            </v-col>
            <v-col class="pl-0 mb-4">
              <p v-bind:class="{'boldie': focus}">
                Recipient address:
              </p>
              {{recipientAddress}}
            </v-col>
          </v-row>
        </v-container>
        <v-divider color="#C4C4C4"/>
        <rsk-fee-select/>
      </v-col>
      <v-col cols="4" lg="5" >
        <btc-tx-summary-side/>
      </v-col>
    </v-row>
  </v-col>
</v-container>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import EnvironmentContextProviderService from '@/providers/EnvironmentContextProvider';
import BtcTxSummarySide from '@/components/create/BtcTxSummarySide.vue';
import RbtcInputAmount from '@/components/pegout/RbtcInputAmount.vue';
import RskWalletConnection from '@/components/pegout/RskWalletConnection.vue';
import RskFeeSelect from '@/components/pegout/RskFeeSelect.vue';

@Component({
  components: {
    BtcTxSummarySide,
    RbtcInputAmount,
    RskWalletConnection,
    RskFeeSelect,
  },
})
export default class PegOutForm extends Vue {
  environmentContext = EnvironmentContextProviderService.getEnvironmentContext();

  recipientAddress = '0xtesttesttesttesttest';

  focus = false;
}
</script>
