<template>
  <v-container fluid class="exchange normalized-height container
  max-width mx-6">
    <select-bitcoin-wallet/>
    <template v-if="showDialog">
      <btc-to-rbtc-dialog :showDialog="showDialog" @closeDialog="closeDialog"/>
    </template>
  </v-container>
</template>

<script lang="ts">
import { Component, Emit, Vue } from 'vue-property-decorator';
import SelectBitcoinWallet from '@/common/components/exchange/SelectBitcoinWallet.vue';
import BtcToRbtcDialog from '@/common/components/exchange/BtcToRbtcDialog.vue';

@Component({
  components: {
    SelectBitcoinWallet,
    BtcToRbtcDialog,
  },
})
export default class PegIn extends Vue {
  showDialog = false;

  @Emit()
  closeDialog() {
    this.showDialog = false;
  }

  beforeMount() {
    this.showDialog = localStorage.getItem('BTRD_COOKIE_DISABLED') !== 'true';
  }
}
</script>
