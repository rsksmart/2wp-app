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
              <a href="https://open-rsk-dev.slack.com/messages/support" target="_blank">Help</a>
              <a href="https://rootstock.io/terms-conditions/" target="_blank">
                Terms & Conditions
              </a>
              <a href="https://github.com/rsksmart/2wp-app/releases/tag/v1.4.1" target="_blank">Api Version: {{apiVersion}}</a>
              <a href="https://github.com/rsksmart/2wp-app/releases/tag/v1.4.1" target="_blank">App Version: {{appVersion}}</a>
              <a v-if="false">Documentation</a>
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
                href="https://open-rsk-dev.slack.com/messages/support" target="_blank"
                :icon="mdiSlack">
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
import { mdiTwitter, mdiSlack, mdiGithub } from '@mdi/js';
import { ApiInformation } from '@/common/types/ApiInformation';
import { ApiService } from '@/common/services';

export default {
  name: 'FooterRsk',
  setup() {
    const apiVersion = ref('0');
    const store = useStore();
    const appVersion = computed<string>(() => store.getters.appVersion);

    const url = computed(() => `https://github.com/rsksmart/2wp-app/releases/tag/v${appVersion.value}`);
    const urlApi = computed(() => `https://github.com/rsksmart/2wp-api/releases/tag/v${apiVersion.value}`);

    ApiService.getApiInformation()
      .then((res: ApiInformation) => {
        apiVersion.value = res.version;
      });

    return {
      urlApi,
      url,
      appVersion,
      apiVersion,
      mdiTwitter,
      mdiSlack,
      mdiGithub,
    };
  },
};
</script>
