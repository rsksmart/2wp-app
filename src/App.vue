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
  watch,
} from 'vue';
import Top from '@/common/components/layouts/Top.vue';
import FooterRsk from '@/common/components/layouts/Footer.vue';
import TermsDialog from '@/common/components/common/TermsDialog.vue';
import { EnvironmentAccessorService } from '@/common/services/enviroment-accessor.service';
import * as constants from '@/common/store/constants';
import { useAction } from '@/common/store/helper';
import { vuetifyNonce } from '@/common/plugins/vuetify';
import { createAppKit, useAppKitTheme } from '@reown/appkit/vue';
import { Ethers5Adapter } from '@reown/appkit-adapter-ethers5';
import { rootstockTestnet } from '@reown/appkit/networks';
import { useTheme } from 'vuetify';

export default {
  name: 'App',
  components: {
    Top,
    FooterRsk,
    TermsDialog,
  },
  setup() {
    const envVariables = EnvironmentAccessorService.getEnvironmentVariables();
    const projectId = envVariables.reownProjectId;
    const metadata = {
      name: 'PowPeg App',
      description: 'Bridging Bitcoin and Rootstock',
      url: '',
      icons: [],
    };

    createAppKit({
      projectId,
      metadata,
      adapters: [new Ethers5Adapter()],
      networks: [rootstockTestnet],
      enableNetworkSwitch: false,
      debug: true,
      features: {
        socials: false,
        email: false,
        onramp: false,
        swaps: false,
        send: false,
      },
    });

    const appTheme = useTheme();
    const appKitTheme = useAppKitTheme();

    watch(appTheme.global.name, () => {
      appKitTheme.setThemeMode(appTheme.global.name.value as 'dark' | 'light');
    });

    let scriptTag: HTMLScriptElement;
    let hotjarScriptTag: HTMLScriptElement;
    const getFeatures = useAction('web3Session', constants.SESSION_ADD_FEATURES);
    const getBtcPrice = useAction('pegInTx', constants.PEGIN_TX_ADD_BITCOIN_PRICE);
    const showTermsAndConditions = ref(false);
    const contentSecurityPolicy = computed((): string => {
      let response = '';
      response = `
      style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://cdn.jsdelivr.net https://cdnjs.cloudflare.com;
      script-src 'self' 'nonce-${vuetifyNonce}' 'unsafe-eval';
      script-src-elem 'self' 'unsafe-inline' https://script.hotjar.com https://www.clarity.ms/s/* https://static.hotjar.com https://*.hotjar.com https://*.hotjar.io https://api.coingecko.com/ https://*.clarity.ms https://www.clarity.ms/ https://www.gstatic.com/ https://www.google.com/recaptcha/;
      img-src data: https: data: blob: https://walletconnect.org https://walletconnect.com https://secure.walletconnect.com https://secure.walletconnect.org;
      connect-src 'self' 'unsafe-inline' https://www.google.com/recaptcha/ https://www.clarity.ms/s/0.7.16/clarity.js wss://* https://*.hotjar.com https://*.hotjar.io https://www.clarity.ms/s/* wss://*.hotjar.com ${envVariables.vueAppApiBaseUrl} ${envVariables.vueAppRskNodeHost} ${envVariables.cspConfiguration} https://api.coingecko.com/ https://*.clarity.ms https://www.clarity.ms/* https://rpc.walletconnect.com https://rpc.walletconnect.org https://relay.walletconnect.com https://relay.walletconnect.org wss://relay.walletconnect.com wss://relay.walletconnect.org https://pulse.walletconnect.com https://pulse.walletconnect.org https://api.web3modal.com https://api.web3modal.org https://public-node.testnet.rsk.co/ https://public-node.rsk.co;
      object-src 'none';
      frame-src https://connect.trezor.io https://www.google.com/ https://verify.walletconnect.com https://verify.walletconnect.org https://secure.walletconnect.com https://secure.walletconnect.org;
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
