<template>
  <v-app style="z-index: 0 !important; position: relative;" class="d-flex">
    <mobile />
    <div class="custom-background">
      <top/>
      <v-row class="d-flex justify-center ma-0">
        <router-view/>
      </v-row>
      <footer-rsk/>
    </div>
  </v-app>
</template>
<script lang="ts">
import { computed } from 'vue';
import Top from '@/common/components/layouts/Top.vue';
import FooterRsk from '@/common/components/layouts/Footer.vue';
import Mobile from '@/common/views/Mobile.vue';
import { EnvironmentAccessorService } from '@/common/services/enviroment-accessor.service';
import * as constants from '@/common/store/constants';
import { useAction } from '@/common/store/helper';
import { vuetifyNonce } from '@/common/plugins/vuetify';

export default {
  name: 'App',
  components: {
    Top,
    FooterRsk,
    Mobile,
  },
  setup() {
    let scriptTag: HTMLScriptElement;
    const getBtcPrice = useAction('web3Session', constants.SESSION_ADD_BITCOIN_PRICE);

    const contentSecurityPolicy = computed((): string => {
      const envVariables = EnvironmentAccessorService.getEnvironmentVariables();
      let response = '';
      response = `
      style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://cdn.jsdelivr.net https://cdnjs.cloudflare.com;
      script-src 'self' 'nonce-${vuetifyNonce}' 'unsafe-eval';
      script-src-elem 'self' 'unsafe-inline' https://www.clarity.ms https://*.clarity.ms https://api.coingecko.com/;
      img-src data: https:;
      connect-src 'self' 'unsafe-inline' https://*.clarity.ms ${envVariables.vueAppApiBaseUrl} ${envVariables.vueAppRskNodeHost} https://api.coingecko.com https://www.clarity.ms;
      object-src 'none';
      frame-src https://connect.trezor.io;
      worker-src 'none';
      `;
      return response;
    });

    function appendCSP():void {
      const metaTag: HTMLMetaElement = document.createElement<'meta'>('meta');
      metaTag.httpEquiv = 'Content-Security-policy';
      metaTag.content = contentSecurityPolicy.value;
      document.head.appendChild(metaTag);
    }

    function appendClarity(): void {
      const { vueAppClarityId } = EnvironmentAccessorService.getEnvironmentVariables();
      scriptTag = document.createElement('script');
      scriptTag.type = 'text/javascript';
      scriptTag.text = '(function(c,l,a,r,i,t,y){'
        + 'c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};'
        + 't=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;'
        + 'y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);'
         + `})(window, document, 'clarity', 'script', '${vueAppClarityId}');`;
      document.body.appendChild(scriptTag);
    }

    getBtcPrice();
    appendClarity();
    appendCSP();
    return {};
  },
};
</script>
