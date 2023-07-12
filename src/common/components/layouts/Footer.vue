<template>
    <v-footer padless color="white" class="footer-rsk d-flex justify-center">
      <v-col cols="11" class="pb-0">
        <v-row justify="center" align="start" class="mx-0 py-md-0 py-xl-6">
          <v-col>
              <v-row class="footer-logo mx-0" align="end">
                <span>Built by</span>
                <v-col class="pa-0">
                  <v-img position="center left"
                         src="@/assets/logo-iov.svg"
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
              <a href="https://dev.rootstock.io/guides/two-way-peg-app/" target="_blank">Help</a>
              <a href="https://open-rsk-dev.slack.com/messages/support" target="_blank">Support</a>
              <a href="https://rootstock.io/terms-conditions/" target="_blank">
                Terms & Conditions
              </a>
              <a :href="urlApi" target="_blank">Api Version: {{apiVersion}}</a>
              <a :href="url" target="_blank">App Version: {{$store.getters.appVersion}}</a>
            </v-row>
          </v-col>
          <v-col class="pt-1">
            <v-row justify="end" class="mx-0 footer-icons">
              <a href="https://twitter.com/rootstock_io" target="_blank">
                <v-icon>mdi-twitter</v-icon>
              </a>
              <a href="https://github.com/rsksmart/2wp-app" target="_blank">
                <v-icon>mdi-github</v-icon>
              </a>
              <a href="https://open-rsk-dev.slack.com/messages/support" target="_blank">
                <v-icon>mdi-slack</v-icon>
              </a>
            </v-row>
          </v-col>
        </v-row>
      </v-col>
    </v-footer>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import { ApiInformation } from '@/common/types/ApiInformation';
import { ApiService } from '@/common/services';

@Component
export default class FooterRsk extends Vue {
  apiVersion = '0';

  url = `https://github.com/rsksmart/2wp-app/releases/tag/v${this.$store.getters.appVersion}`;

  urlApi = `https://github.com/rsksmart/2wp-api/releases/tag/v${this.apiVersion}`;

  obtainApiVersion() {
    ApiService.getApiInformation()
      .then((res: ApiInformation) => {
        this.apiVersion = res.version;
        this.urlApi = `https://github.com/rsksmart/2wp-api/releases/tag/v${this.apiVersion}`;
      });
    return this.apiVersion;
  }

  created() {
    this.obtainApiVersion();
  }
}
</script>
