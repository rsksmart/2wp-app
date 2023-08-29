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
import Top from '@/common/components/layouts/Top.vue';
import FooterRsk from '@/common/components/layouts/Footer.vue';
import Mobile from '@/common/views/Mobile.vue';
import { EnvironmentAccessorService } from '@/common/services/enviroment-accessor.service';
import { Action } from 'vuex-class';
import * as constants from '@/common/store/constants';
import { vuetifyNonce } from '@/common/plugins/vuetify';

@Component({
  components: {
    Top,
    Mobile,
    FooterRsk,
  },
})
export default class App extends Vue {
  scriptTag?: HTMLScriptElement;

  @Action(constants.SESSION_ADD_BITCOIN_PRICE, { namespace: 'web3Session' }) getBtcPrice!: () => void;

  // eslint-disable-next-line class-methods-use-this
  get contentSecurityPolicy(): string {
    const envVariables = EnvironmentAccessorService.getEnvironmentVariables();
    let response = '';
    response = `
    style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://cdn.jsdelivr.net https://cdnjs.cloudflare.com;
    script-src 'self' 'nonce-${vuetifyNonce}' 'unsafe-eval';
    script-src-elem 'self' 'unsafe-inline' https://script.hotjar.com https://static.hotjar.comhttps://api.coingecko.com/;
    img-src data: https:;
    connect-src 'self' 'unsafe-inline' https://*.hotjar.com https://*.hotjar.io wss://*.hotjar.com; ${envVariables.vueAppApiBaseUrl} ${envVariables.vueAppRskNodeHost} https://api.coingecko.com;
    object-src 'none';
    frame-src https://connect.trezor.io;
    worker-src 'none';
    `;
    return response;
  }

  appendCSP():void {
    const metaTag: HTMLMetaElement = document.createElement<'meta'>('meta');
    metaTag.httpEquiv = 'Content-Security-policy';
    metaTag.content = this.contentSecurityPolicy;
    document.head.appendChild(metaTag);
  }

  appendHotjar(): void {
    const hotjarID = EnvironmentAccessorService.getEnvironmentVariables().vueAppHotjarId;
    this.scriptTag = document.createElement('script');
    this.scriptTag.type = 'text/javascript';
    this.scriptTag.text = '(function(h,o,t,j,a,r){'
      + 'h.hj=h.hj||function(){(h.hj.q=h.hj.q||[]).push(arguments)};'
      + `h._hjSettings={hjid:'${hotjarID}',hjsv:6};`
      + 'a=o.getElementsByTagName("head")[0];'
      + 'r=o.createElement("script");r.async=1;'
      + 'r.src=t+h._hjSettings.hjid+j+h._hjSettings.hjsv;'
      + 'a.appendChild(r);'
      + '})(window,document,"https://static.hotjar.com/c/hotjar-",".js?sv=");';
    document.body.appendChild(this.scriptTag);
  }

  created() {
    this.getBtcPrice();
    this.appendHotjar();
    this.appendCSP();
  }
}
</script>
