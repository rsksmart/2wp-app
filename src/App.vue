<template>
  <v-app class="h-screen">
    <div class="d-flex flex-column h-100">
      <top />
      <div class="bg-background flex-grow-1">
        <router-view @update:showDialog="showTermsDialog" />
      </div>
      <terms-dialog v-model:showDialog="showTermsAndConditions" />
      <footer-rsk class="flex-grow-0" @update:showDialog="showTermsDialog" />
    </div>
  </v-app>
</template>

<script lang="ts">
import {
  computed, onBeforeMount, ref,
} from 'vue';
import Top from '@/common/components/layouts/Top.vue';
import FooterRsk from '@/common/components/layouts/Footer.vue';
import TermsDialog from '@/common/components/common/TermsDialog.vue';
import { EnvironmentAccessorService } from '@/common/services/enviroment-accessor.service';
import * as constants from '@/common/store/constants';
import { useAction } from '@/common/store/helper';
import { vuetifyNonce } from '@/common/plugins/vuetify';

export default {
  name: 'App',
  components: {
    Top,
    FooterRsk,
    TermsDialog,
  },
  setup() {
    let scriptTag: HTMLScriptElement;
    let hotjarScriptTag: HTMLScriptElement;
    const getFeatures = useAction('web3Session', constants.SESSION_ADD_FEATURES);
    const getBtcPrice = useAction('pegInTx', constants.PEGIN_TX_ADD_BITCOIN_PRICE);
    const showTermsAndConditions = ref(false);
    const contentSecurityPolicy = computed((): string => {
      const envVariables = EnvironmentAccessorService.getEnvironmentVariables();
      let response = '';
      response = `
      style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://cdn.jsdelivr.net https://cdnjs.cloudflare.com;
      script-src 'self' 'nonce-${vuetifyNonce}' 'unsafe-eval';
      script-src-elem 'self' 'unsafe-inline' https://script.hotjar.com https://www.clarity.ms/s/* https://static.hotjar.com https://*.hotjar.com https://*.hotjar.io https://api.coingecko.com/ https://*.clarity.ms https://www.clarity.ms/ https://www.gstatic.com/ https://www.google.com/recaptcha/;
      img-src data: https:;
      connect-src 'self' 'unsafe-inline' https://www.google.com/recaptcha/ https://www.clarity.ms/s/0.7.16/clarity.js wss://* https://*.hotjar.com https://*.hotjar.io https://www.clarity.ms/s/* wss://*.hotjar.com ${envVariables.vueAppApiBaseUrl} ${envVariables.vueAppRskNodeHost} ${envVariables.cspConfiguration} https://api.coingecko.com/ https://*.clarity.ms https://www.clarity.ms/* https://lps.dev.flyover.rif.technology;
      object-src 'none';
      frame-src https://connect.trezor.io https://www.google.com/;
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
      const envVariables = EnvironmentAccessorService.getEnvironmentVariables();
      scriptTag = document.createElement('script');
      scriptTag.type = 'text/javascript';
      scriptTag.text = '(function(c,l,a,r,i,t,y){'
        + 'c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};'
        + 't=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;'
        + 'y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);'
        + `})(window, document, 'clarity', 'script', '${envVariables.vueAppClarityId}');`;
      document.body.appendChild(scriptTag);
    }

    function appendHotjar(): void {
      const envVariables = EnvironmentAccessorService.getEnvironmentVariables();
      hotjarScriptTag = document.createElement('script');
      hotjarScriptTag.type = 'text/javascript';
      hotjarScriptTag.text = '(function(h,o,t,j,a,r){'
      + 'h.hj=h.hj||function(){(h.hj.q=h.hj.q||[]).push(arguments)};'
      + `h._hjSettings={hjid:'${envVariables.vueAppHotjarId}',hjsv:6};`
      + 'a=o.getElementsByTagName("head")[0];'
      + 'r=o.createElement("script");r.async=1;'
      + 'r.src=t+h._hjSettings.hjid+j+h._hjSettings.hjsv;'
      + 'a.appendChild(r);'
      + '})(window,document,"https://static.hotjar.com/c/hotjar-",".js?sv=");';
      document.body.appendChild(hotjarScriptTag);
    }

    function showTermsDialog(show: boolean) {
      showTermsAndConditions.value = show;
    }

    onBeforeMount(() => {
      getFeatures();
      getBtcPrice();
    });

    appendHotjar();
    appendClarity();
    appendCSP();

    return {
      showTermsDialog,
      showTermsAndConditions,
    };
  },
};
</script>
