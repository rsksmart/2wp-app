<template>
  <v-app style="z-index: 0 !important;" class="d-flex">
    <mobile />
    <div class="custom-background">
      <top/>
      <v-row class="d-flex justify-center">
        <router-view/>
      </v-row>
      <footer-rsk/>
    </div>
  </v-app>
</template>
<script lang="ts">
import Vue from 'vue';
import { Component } from 'vue-property-decorator';
import { Action } from 'vuex-class';
import Top from '@/components/layouts/Top.vue';
import FooterRsk from '@/components/layouts/Footer.vue';
import Mobile from '@/views/Mobile.vue';
import * as constants from '@/store/constants';

@Component({
  components: {
    Top,
    Mobile,
    FooterRsk,
  },
})
export default class App extends Vue {
  @Action(constants.PEGIN_TX_INIT, { namespace: 'pegInTx' }) init !: () => void;

  created() {
    this.init();
  }
}
</script>
