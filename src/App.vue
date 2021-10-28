<template>
  <v-app style="z-index: 0 !important;" class="d-flex">
    <mobile />
    <div class="custom-background">
      <top/>
      <v-row class="d-flex justify-center">
        <router-view @bitcoinWallet="getBitcoinWallet"/>
      </v-row>
      <footer-rsk/>
    </div>
  </v-app>
</template>
<script lang="ts">
import Vue from 'vue';
import { Component, Emit } from 'vue-property-decorator';
import { Action } from 'vuex-class';
import Top from '@/components/layouts/Top.vue';
import FooterRsk from '@/components/layouts/Footer.vue';
import Mobile from '@/views/Mobile.vue';
import * as constants from '@/store/constants';
import ApiService from '@/services/ApiService';
import { PeginConfiguration } from '@/store/peginTx/types';

@Component({
  components: {
    Top,
    Mobile,
    FooterRsk,
  },
})
export default class App extends Vue {
  bitcoinWallet = '';

  @Action(constants.PEGIN_TX_ADD_SESSION_ID, { namespace: 'pegInTx' }) addSessionId !: any;

  @Action(constants.PEGIN_TX_ADD_PEGIN_CONFIGURATION, { namespace: 'pegInTx' }) addPeginConfiguration !: any;

  @Action(constants.PEGIN_TX_ADD_BITCOIN_PRICE, { namespace: 'pegInTx' }) addBitcoinPrice !: any;

  @Emit()
  getBitcoinWallet(_bitcoinWallet: string) {
    this.bitcoinWallet = _bitcoinWallet;
  }

  created() {
    ApiService.getPeginConfiguration()
      .then((config: PeginConfiguration) => {
        const peginConfiguration = {
          minValue: config.minValue,
          maxValue: config.maxValue,
          federationAddress: config.federationAddress,
          feePerKb: config.feePerKb,
          btcConfirmations: config.btcConfirmations,
        };
        this.addPeginConfiguration(peginConfiguration);
        this.addSessionId(config.sessionId);
        this.addBitcoinPrice();
      });
  }
}
</script>
