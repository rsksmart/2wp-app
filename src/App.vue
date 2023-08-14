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
    script-src-elem 'self' 'unsafe-inline' https://www.clarity.ms;
    img-src data: https:;
    connect-src 'self' 'unsafe-inline' ${envVariables.vueAppApiBaseUrl} ${envVariables.vueAppRskNodeHost} https://api.coingecko.com https://www.clarity.ms;
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

  appendClarity(): void {
    const { vueAppClarityId } = EnvironmentAccessorService.getEnvironmentVariables();
    this.scriptTag = document.createElement('script');
    this.scriptTag.type = 'text/javascript';
    this.scriptTag.text = '(function(c,l,a,r,i,t,y){'
      + 'c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};'
      + 't=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;'
      + 'y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);'
       + `})(window, document, 'clarity', 'script', '${vueAppClarityId}');`;
    document.body.appendChild(this.scriptTag);
  }

  created() {
    this.getBtcPrice();
    this.appendClarity();
    this.appendCSP();
  }
}
</script>
