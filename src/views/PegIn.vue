<template>
  <v-container fluid class="exchange normalized-height container
  max-width mx-6">
    <select-bitcoin-wallet/>
    <template v-if="showDialog">
      <disclaimer-dialog :showDialog="showDialog" @closeDialog="closeDialog"
      :from="from" :to="to" :cookie="cookie" :hours="hours"
      :blockConfirmations="blockConfirmations" :network="network"/>
    </template>
  </v-container>
</template>

<script lang="ts">
import { Component, Emit, Vue } from 'vue-property-decorator';
import SelectBitcoinWallet from '@/components/exchange/SelectBitcoinWallet.vue';
import EnvironmentContextProviderService from '@/providers/EnvironmentContextProvider';
import DisclaimerDialog from '@/components/exchange/DisclaimerDialog.vue';

@Component({
  components: {
    SelectBitcoinWallet,
    DisclaimerDialog,
  },
})
export default class PegIn extends Vue {
  showDialog = false;

  environmentContext = EnvironmentContextProviderService.getEnvironmentContext();

  from = this.environmentContext.getBtcTicker();

  to = this.environmentContext.getRbtcTicker();

  cookie = 'BTRD_COOKIE_DISABLED';

  hours = 17;

  blockConfirmations = 100;

  network = this.environmentContext.getBtcText();

  @Emit()
  closeDialog() {
    this.showDialog = false;
  }

  beforeMount() {
    this.showDialog = localStorage.getItem(this.cookie) !== 'true';
  }
}
</script>
