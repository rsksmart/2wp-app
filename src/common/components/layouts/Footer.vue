<template>
    <v-footer padless color="white" class="footer-rsk d-flex justify-center align-end">
      <v-col cols="11" class="pb-0">
        <v-row justify="center" align="start" class="mx-0 py-md-0 py-xl-6">
          <v-col>
              <v-row class="footer-logo mx-0" align="end">
                <span>Built by</span>
                <v-col class="pa-0">
                  <v-img position="center left"
                         :src="require('@/assets/logo-iov.svg')"
                         alt="IOV Labs"
                         width="100" contain class="rsk-main-logo"/>
                </v-col>
              </v-row>
            <p>Copyright © 2023 IOV Labs All rights reserved</p>
          </v-col>
          <v-col cols="7" class="pt-4">
            <v-row justify="center" class="mx-0 footer-links">
              <a href="https://www.iovlabs.org/" target="_blank">
                About IOV Labs
              </a>
              <a :href="helpUrl"
                            target="_blank" rel="noopener">Help</a>
              <a :href="discordUrl"
                            target="_blank" rel="noopener">Support</a>
              <a :href="`https://github.com/rsksmart/2wp-api/releases/tag/v${apiVersion}`"
                            target="_blank" rel="noopener">Api Version: {{apiVersion}}</a>
              <a :href="`https://github.com/rsksmart/2wp-app/releases/tag/v${appVersion}`"
                            target="_blank" rel="noopener">App Version: {{appVersion}}</a>
            </v-row>
          </v-col>
          <v-col class="pt-1">
            <v-row justify="end" class="mx-0 footer-icons">
              <v-btn variant="plain" href="https://twitter.com/rootstock_io" target="_blank"
                density="compact"
                :icon="mdiTwitter">
              </v-btn>
              <v-btn variant="plain" href="https://github.com/rsksmart/2wp-app"  target="_blank"
                density="compact"
                :icon="mdiGithub">
              </v-btn>
              <v-btn variant="plain"
                density="compact"
                :href="discordUrl" target="_blank"
                :icon="mdiDiscord"
                rel="noopener">
              </v-btn>
            </v-row>
          </v-col>
        </v-row>
      </v-col>
    </v-footer>
</template>

<script lang="ts">
import { computed, ref } from 'vue';
import { useStore } from 'vuex';
import { mdiTwitter, mdiGithub, mdiDiscord } from '@mdi/js';
import { ApiInformation } from '@/common/types/ApiInformation';
import { ApiService } from '@/common/services';
import { useRoute } from 'vue-router';
import { useGetter } from '@/common/store/helper';
import * as constants from '@/common/store/constants';

export default {
  name: 'FooterRsk',
  setup() {
    const apiVersion = ref('0');
    const store = useStore();
    const appVersion = computed<string>(() => store.getters.appVersion);
    const route = useRoute();
    const isLedger = useGetter<boolean>('web3Session', constants.SESSION_IS_LEDGER_CONNECTED);
    const isTrezor = useGetter<boolean>('web3Session', constants.SESSION_IS_TREZOR_CONNECTED);
    const isMetamask = useGetter<boolean>('web3Session', constants.SESSION_IS_METAMASK_CONNECTED);
    const isRloginDefined = useGetter<boolean>('web3Session', constants.SESSION_IS_RLOGIN_DEFINED);

    const urlApp = computed(() => `https://github.com/rsksmart/2wp-app/releases/tag/v${appVersion.value}`);
    const urlApi = computed(() => `https://github.com/rsksmart/2wp-api/releases/tag/v${apiVersion.value}`);
    const discordUrl = 'https://discord.com/channels/842021106956238848/1123675841369489438';

    function getDevPortalSlug() {
      const [, feature, wallet] = route.path.split('/');
      if (feature === 'pegin' && wallet) {
        return `${feature}/${wallet}`;
      }
      if (feature === 'status') {
        return '';
      }
      if (feature === 'pegout' && isRloginDefined.value) {
        if (isLedger.value) {
          return `${feature}/ledger`;
        }
        if (isTrezor.value) {
          return `${feature}/trezor`;
        }
        if (isMetamask.value) {
          return `${feature}/metamask`;
        }
        return `${feature}/liquality`;
      }
      return feature;
    }

    const helpUrl = computed(() => `https://dev.rootstock.io/guides/two-way-peg-app/${getDevPortalSlug()}`);

    ApiService.getApiInformation()
      .then((res: ApiInformation) => {
        apiVersion.value = res.version;
      });

    return {
      urlApi,
      urlApp,
      helpUrl,
      discordUrl,
      appVersion,
      apiVersion,
      mdiTwitter,
      mdiDiscord,
      mdiGithub,
    };
  },
};
</script>
