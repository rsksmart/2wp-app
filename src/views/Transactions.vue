<template>
  <div class="transactions">
    <v-row class="mx-0 my-10 d-flex justify-center">
      <h1 class="text-center">Transaction Status</h1>
    </v-row>
    <v-row class="mx-0 d-flex justify-center">
      <v-col cols="3">
        <v-text-field rounded dense outlined hide-details color="#C4C4C4" label="Tracking ID"/>
      </v-col>
    </v-row>
    <v-row class="mx-0 mb-8">
      <v-img src="@/assets/transactions/timeline.png" height="130" contain/>
    </v-row>
    <tx-summary :txData="txData" :price="price" :txId="txId" :showTxId="true"/>
  </div>
</template>

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator';
import TxSummary from '@/components/exchange/TxSummary.vue';

@Component({
  components: {
    TxSummary,
  },
})
export default class Transactions extends Vue {
  txData = {};

  price = 0;

  txId = '';
}
</script>
