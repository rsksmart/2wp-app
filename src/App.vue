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
import { vuetifyNonce } from '@/common/plugins/vuetify';
import { useAction } from '@/common/store/helper';

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
      script-src-elem 'self' 'unsafe-inline' https://script.hotjar.com https://static.hotjar.com;
      img-src data: https:;
      connect-src 'self' ${envVariables.vueAppApiBaseUrl} ${envVariables.vueAppRskNodeHost} https://api.coingecko.com ;
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

    function appendHotjar(): void {
      const hotjarID = EnvironmentAccessorService.getEnvironmentVariables().vueAppHotjarId;
      scriptTag = document.createElement('script');
      scriptTag.type = 'text/javascript';
      scriptTag.text = '(function(h,o,t,j,a,r){'
        + 'h.hj=h.hj||function(){(h.hj.q=h.hj.q||[]).push(arguments)};'
        + `h._hjSettings={hjid:'${hotjarID}',hjsv:6};`
        + 'a=o.getElementsByTagName("head")[0];'
        + 'r=o.createElement("script");r.async=1;'
        + 'r.src=t+h._hjSettings.hjid+j+h._hjSettings.hjsv;'
        + 'a.appendChild(r);'
        + '})(window,document,"https://static.hotjar.com/c/hotjar-",".js?sv=");';
      document.body.appendChild(scriptTag);
    }

    getBtcPrice();
    appendHotjar();
    appendCSP();

    return {};
  },
};
</script>
