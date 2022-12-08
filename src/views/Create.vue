<template>
  <v-container fluid class="exchange container max-width mx-6">
    <send-bitcoin @back="back"/>
  </v-container>
</template>

<script lang="ts">
import {
  Component, Emit, Vue,
} from 'vue-property-decorator';
import { Action } from 'vuex-class';
import { BtcWallet } from '@/types/pegInTx';
import * as constants from '@/store/constants';
import SendBitcoin from '@/components/create/SendBitcoin.vue';

@Component({
  components: {
    SendBitcoin,
  },
})
export default class Create extends Vue {
  @Action(constants.PEGIN_TX_ADD_BITCOIN_WALLET, { namespace: 'pegInTx' }) setBitcoinWallet !: (wallet: BtcWallet) => void;

  @Action(constants.PEGIN_TX_CLEAR_STATE, { namespace: 'pegInTx' }) clear !: () => void;

  @Action(constants.PEGIN_TX_INIT, { namespace: 'pegInTx' }) initPegin !: () => void;

  @Action(constants.PEGOUT_TX_INIT, { namespace: 'pegOutTx' }) init !: () => void;

  @Emit()
  back() {
    this.clear();
    this.init();
    this.initPegin();
    this.$router.push({ name: 'Home' });
  }
}
</script>
