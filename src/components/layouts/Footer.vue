<template>
  <div class="footer-rsk mt-12">
    <v-footer padless color="black" class="pt-7 px-12">
      <v-col cols="10" offset="1" xl="8" offset-xl="2" class="container px-12">
        <v-row class="d-flex justify-start px-0 mx-0">
          <v-col cols="3" class="mx-0 px-0" >
            <v-img src="https://www.rsk.co/img/powered_by_iov.svg" height="20" width="250" contain/>
          </v-col>
        </v-row>
        <v-row class="mt-2 mb-12">
          <v-col cols="3" class="footer-info pr-12">
            <p>
              Rsk is the most secure smart contract network in the world and enables
              decentralized applications secured by the Bitcoin Network to empower people and
              improve the quality of life of millions.
            </p>
            <v-btn
              elevation="2"
              rounded
              href="https://developers.rsk.co/"
              target="_blank"
              color="#00b520"
              class="footer-button px-8"
            >
              <span>Start now</span>
            </v-btn>
          </v-col>
          <v-col cols="3" md="2" ></v-col>
          <v-col cols="3" md="4" class="footer-info">
            <v-row>
              <a href="https://github.com/rsksmart/2wp-app"
                 target="_blank"
                 rel="nofollow noopener noreferrer">
                <p>Repository</p>
              </a>
            </v-row>
            <v-row>
              <a href="https://github.com/rsksmart/2wp-app"
                 target="_blank"
                 rel="nofollow noopener noreferrer">
                <p>Use Testnet</p>
              </a>
            </v-row>
            <v-row>
              <v-btn
                elevation="2"
                href="https://developers.rsk.co/"
                target="_blank"
                color="#00b520"
                class="footer-button px-8"
              >
                <span>Documentation</span>
              </v-btn>
            </v-row>
          </v-col>
          <v-col cols="3">
            <v-row class="footer-info">
              <a href="https://www.iovlabs.org/"
                 target="_blank"
                 rel="nofollow noopener noreferrer">
                <p>
                  About IOVlabs
                </p>
              </a>
            </v-row>
            <v-row class="footer-info">
              <a href="https://www.iovlabs.org/contact.html"
                 target="_blank"
                 rel="nofollow noopener noreferrer">
                <p>
                  Contact IOVlabs
                </p>
              </a>
            </v-row>
            <v-row class="footer-info">
              <a href="https://blog.rsk.co/"
                 target="_blank"
                 rel="nofollow noopener noreferrer">
                <p>
                  Blog
                </p>
              </a>
            </v-row>
            <v-row class="footer-info-strong">
              <a href="https://www.rsk.co/Brand_Guidelines/RSK_BrandManual_V6.pdf"
                 target="_blank"
                 rel="nofollow noopener noreferrer">
                <p>
                  Brand Guidelines
                </p>
              </a>
            </v-row>
            <v-row class="footer-info-strong">
              <a href="https://www.rsk.co/terms-conditions"
                 target="_blank"
                 rel="nofollow noopener noreferrer">
                <p>
                  Terms & Conditions
                </p>
              </a>
            </v-row>
            <v-row class="footer-info-strong">
              <a href="https://www.rsk.co/privacy-policy"
                 target="_blank"
                 rel="nofollow noopener noreferrer">
                <p>
                  Privacy Policy
                </p>
              </a>
            </v-row>
          </v-col>
        </v-row>
        <v-row class="d-flex justify-end pt-8">
          <v-btn
            v-for="(btn, idx) in socialNetworkButtons"
            :key="`${btn.icon}-${idx}`"
            class="mx-1 black--text"
            fab
            color="white"
            width="30"
            height="30"
            :href="btn.link"
          >
            <v-icon size="20px">
              {{ btn.icon }}
            </v-icon>
          </v-btn>
        </v-row>
        <v-row>
          <v-col class="d-flex justify-start px-0 mx-0 rsk-copyright">
            <p>Copyright © 2015 RSK Labs. All rights reserved.</p>
          </v-col>
          <v-col class="d-flex justify-end px-0 mx-0 rsk-pk">
            <p >
              RSK Public Key (69F6 F997 2497 8762 D541 8AE4 58D2 260D 5998 6758)</p>
          </v-col>
        </v-row>
      </v-col>
    </v-footer>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';

@Component
export default class FooterRsk extends Vue {
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
}
</script>
