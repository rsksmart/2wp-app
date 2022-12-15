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
        <rsk-wallet-connection @openAddressDialog="openAddressDialog"/>
        <v-divider color="#C4C4C4"/>
        <rbtc-input-amount/>
        <v-divider color="#C4C4C4"/>
        <v-container class="form-step pb-0 pt-3 mb-3">
          <v-row align="start mx-0">
            <v-col cols="auto" class="pl-0">
              <div v-bind:class="[focus ?
              'number-filled' : 'number']">3</div>
            </v-col>
            <v-col class="pl-0 ma-0 pb-0">
              <p v-bind:class="{'boldie': focus}">
                Recipient address:
              </p>
              <v-row class="ma-0 pa-0">
                <v-col cols="6" class="pa-0" >
                  <v-text-field class="disabled-input" :value="recipientAddress"
                                disabled color="#F8F5F5"
                                solo hide-details full-width single-line flat/>
                </v-col>
              </v-row>
            </v-col>
          </v-row>
        </v-container>
        <v-divider color="#C4C4C4"/>
        <rsk-fee-select/>
      </v-col>
      <v-col cols="4" lg="5" class="d-flex align-center justify-center">
        Summary (TO-DO)
      </v-col>
    </v-row>
    <v-row v-if="showAddressDialog">
      <address-dialog :showAddressDialog="showAddressDialog"
      @toSign="signMessage"
      @closeDialog="closeAddressDialog"/>
    </v-row>
  </v-col>
</v-container>
</template>

<script lang="ts">
import { Component, Vue, Emit } from 'vue-property-decorator';
import EnvironmentContextProviderService from '@/providers/EnvironmentContextProvider';
import BtcTxSummarySide from '@/components/create/BtcTxSummarySide.vue';
import RbtcInputAmount from '@/components/pegout/RbtcInputAmount.vue';
import RskWalletConnection from '@/components/pegout/RskWalletConnection.vue';
import RskFeeSelect from '@/components/pegout/RskFeeSelect.vue';
import AddressDialog from '@/components/pegout/AddressDialog.vue';

@Component({
  components: {
    AddressDialog,
    BtcTxSummarySide,
    RbtcInputAmount,
    RskWalletConnection,
    RskFeeSelect,
  },
})
export default class PegOutForm extends Vue {
  environmentContext = EnvironmentContextProviderService.getEnvironmentContext();

  recipientAddress = '';

  showAddressDialog = false;

  focus = false;

  @Emit()
  closeAddressDialog() {
    this.showAddressDialog = false;
  }

  signMessage() {
    this.recipientAddress = '0xtesttesttesttesttest';
    this.showAddressDialog = false;
  }

  @Emit()
  openAddressDialog() {
    this.showAddressDialog = true;
  }
}
</script>
