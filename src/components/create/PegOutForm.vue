<template>
<v-container fluid class="exchange normalized-height container
  max-width mx-6">
  <v-col>
    <v-row>
      <h1 class="text-left">Send {{environmentContext.getRbtcTicker()}}.
        Get {{environmentContext.getBtcTicker()}}.</h1>
    </v-row>
    <v-row>
      <v-col cols="8" lg="7" >

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

@Component({
  components: {
    BtcTxSummarySide,
  },
})
export default class PegOutForm extends Vue {
  environmentContext = EnvironmentContextProviderService.getEnvironmentContext();
}
</script>
