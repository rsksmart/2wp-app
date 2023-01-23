<template>
  <v-container fluid class="exchange normalized-height container
  max-width mx-6 pt-6">
    <component :is="currentComponent"/>
  </v-container>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import PegOutForm from '@/components/pegout/PegOutForm.vue';
import { Action } from 'vuex-class';
import * as constants from '@/store/constants';

@Component({
  components: {
    PegOutForm,
  },
})
export default class PegOut extends Vue {
  @Action(constants.PEGOUT_TX_INIT, { namespace: 'pegOutTx' }) init !: () => Promise<void>;

  currentComponent = 'PegOutForm';

  created() {
    this.init();
  }
}
</script>
