<template>
  <v-container fluid class="exchange container max-width mx-6">
    <send-bitcoin @back="back"/>
  </v-container>
</template>

<script lang="ts">
import * as constants from '@/common/store/constants';
import SendBitcoin from '@/pegin/components/create/SendBitcoin.vue';
import { useAction } from '@/common/store/helper';
import { useRouter } from 'vue-router';

export default {
  name: 'Create',
  components: {
    SendBitcoin,
  },
  setup() {
    const clear = useAction('pegInTx', constants.PEGIN_TX_CLEAR_STATE);
    const initPegin = useAction('pegInTx', constants.PEGIN_TX_INIT);
    const init = useAction('pegOutTx', constants.PEGOUT_TX_INIT);

    function back() {
      const router = useRouter();
      clear();
      init();
      initPegin();
      router.push({ name: 'Home' });
    }

    return {
      back,
    };
  }
}

// @Component({
//   components: {
//     SendBitcoin,
//   },
// })
// class Create extends Vue {
//   @Action(constants.PEGIN_TX_ADD_BITCOIN_WALLET, { namespace: 'pegInTx' }) setBitcoinWallet !: (wallet: BtcWallet) => void;
//
//   @Action(constants.PEGIN_TX_CLEAR_STATE, { namespace: 'pegInTx' }) clear !: () => void;
//
//   @Action(constants.PEGIN_TX_INIT, { namespace: 'pegInTx' }) initPegin !: () => void;
//
//   @Action(constants.PEGOUT_TX_INIT, { namespace: 'pegOutTx' }) init !: () => void;
//
//   @Emit()
//   back() {
//     this.clear();
//     this.init();
//     this.initPegin();
//     this.$router.push({ name: 'Home' });
//   }
// }
</script>
