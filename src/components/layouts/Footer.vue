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
            <p>Copyright © 2021 IOV Labs All rights reserved</p>
          </v-col>
          <v-col cols="7" class="pt-4">
            <v-row justify="center" class="mx-0 footer-links">
              <a href="https://www.iovlabs.org/" target="_blank">
                About IOV Labs
              </a>
              <a href="https://open-rsk-dev.slack.com/messages/support">Help</a>
              <a href="https://www.rsk.co/terms-conditions" target="_blank">
                Terms & Conditions
              </a>
              <a :href="urlApi" target="_blank">Api Version: {{obtainApiVersion}}</a>
              <a :href="url" target="_blank">App Version: {{$store.getters.appVersion}}</a>
              <a v-if="false">Documentation</a>
            </v-row>
          </v-col>
          <v-col class="pt-1">
            <v-row justify="end" class="mx-0 footer-icons">
              <a href="https://twitter.com/rsksmart" target="_blank">
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
import { ApiInformation } from '@/types/ApiInformation';
import { ApiService } from '@/services';

@Component
export default class FooterRsk extends Vue {
  apiVersion = '0';

  url = `https://github.com/rsksmart/2wp-app/releases/tag/v${this.$store.getters.appVersion}`;

  urlApi = `https://github.com/rsksmart/2wp-api/releases/tag/v${this.apiVersion}`;

  socialNetworkButtons: {icon: string; link: string} [] = [
    { icon: 'mdi-slack', link: 'http://developers.rsk.co/slack' },
    { icon: 'mdi-twitter', link: 'https://twitter.com/rsksmart' },
    { icon: 'mdi-youtube', link: 'https://www.youtube.com/rsksmart' },
    { icon: 'mdi-facebook', link: 'https://www.facebook.com/RSKsmart/' },
    { icon: 'fab fa-gitter', link: 'https://gitter.im/rsksmart' },
    { icon: 'mdi-reddit', link: 'https://www.reddit.com/r/rootstock/' },
    { icon: 'fab fa-telegram', link: 'https://t.me/rskofficialcommunity' },
    { icon: 'fab fa-medium', link: 'https://medium.com/@RSKNews' },
    { icon: 'fab fa-telegram', link: 'https://t.me/rsksmartcontract' },
    { icon: 'fab fa-btc', link: 'https://bitcointalk.org/index.php?topic=5124334' },
    { icon: 'mdi-instagram', link: 'https://www.instagram.com/rsksmart/' },
  ];

  // eslint-disable-next-line class-methods-use-this
  get obtainApiVersion() {
    ApiService.getApiInformation()
      .then((res: ApiInformation) => {
        this.apiVersion = res.version;
        this.urlApi = `https://github.com/rsksmart/2wp-api/releases/tag/v${this.apiVersion}`;
      });
    return this.apiVersion;
  }
}
</script>
