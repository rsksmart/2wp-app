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
import Top from '@/components/layouts/Top.vue';
import FooterRsk from '@/components/layouts/Footer.vue';
import Mobile from '@/views/Mobile.vue';

@Component({
  components: {
    Top,
    Mobile,
    FooterRsk,
  },
})
export default class App extends Vue {
  scriptTag?: any;

  mounted() {
    this.scriptTag = document.createElement('script');
    this.scriptTag.type = 'text/javascript';
    this.scriptTag.text = '(function(h,o,t,j,a,r){' +
      'h.hj=h.hj||function(){(h.hj.q=h.hj.q||[]).push(arguments)};' +
      `h._hjSettings={hjid:'${process.env.VUE_APP_HOTJAR_ID}',hjsv:6};` +
      'a=o.getElementsByTagName("head")[0];' +
      'r=o.createElement("script");r.async=1;' +
      'r.src=t+h._hjSettings.hjid+j+h._hjSettings.hjsv;' +
      'a.appendChild(r);' +
    '})(window,document,"https://static.hotjar.com/c/hotjar-",".js?sv=");';

    document.body.appendChild(this.scriptTag);
  }
}
</script>
