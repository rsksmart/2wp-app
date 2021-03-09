<template>
  <div>
    <v-dialog v-model="useWeb3Wallet" width="673">
      <v-card class="dialog">
        <div class="container-extra">
          <v-row class="mx-0 d-flex justify-center">
            <h2 class="text-center">Select Wallet</h2>
          </v-row>
          <div class="container">
            <v-row class="mx-0">
              <v-col>
                <v-btn text color="transparent" width="200" @click="connectToMetamask"
                       class="pa-0 ma-0 d-flex justify-center">
                  <v-row class="mx-0">
                    <v-col cols="5" class="d-flex justify-center">
                      <v-img src="@/assets/web3/metamask.png" height="40" contain/>
                    </v-col>
                    <v-col class="d-flex align-center">
                      <p class="ma-0">Metamask</p>
                    </v-col>
                  </v-row>
                </v-btn>
              </v-col>
              <v-col>
                <v-btn text color="transparent" width="200" class="pa-0 ma-0 d-flex justify-center">
                  <v-row class="mx-0">
                    <v-col cols="5" class="d-flex justify-center">
                      <v-img src="@/assets/web3/my-crypto.png" height="40" width="40" contain/>
                    </v-col>
                    <v-col class="d-flex align-center">
                      <p class="ma-0">MyCrypto</p>
                    </v-col>
                  </v-row>
                </v-btn>
              </v-col>
            </v-row>
            <v-row class="mx-0">
              <v-col>
                <v-btn text color="transparent" width="200" class="pa-0 ma-0 d-flex justify-center">
                  <v-row class="mx-0">
                    <v-col cols="5" class="d-flex justify-center">
                      <v-img src="@/assets/web3/my-ether.png" height="40" contain/>
                    </v-col>
                    <v-col class="pr-0 d-flex align-center">
                      <p class="ma-0">MyEther Wallet</p>
                    </v-col>
                  </v-row>
                </v-btn>
              </v-col>
              <v-col>
                <v-btn text color="transparent" width="200" class="pa-0 ma-0 d-flex justify-center">
                  <v-row class="mx-0">
                    <v-col cols="5" class="d-flex justify-center">
                      <v-img src="@/assets/web3/rWallet.png" height="40" contain/>
                    </v-col>
                    <v-col class="d-flex align-center">
                      <p class="ma-0">rWallet</p>
                    </v-col>
                  </v-row>
                </v-btn>
              </v-col>
            </v-row>
          </div>
          <v-row class="mx-0 pt-8">
            <h3>What is a wallet?</h3>
          </v-row>
          <v-row class="mx-0">
            <p class="text-justify">
              Wallets are used to send, receive, and store digital assets like Ether. Wallets come
              in many forms. They are either built into your browser, an extension added to your
              browser, a piece of hardware plugged into your computer or even an app on your phone.
            </p>
          </v-row>
        </div>
      </v-card>
    </v-dialog>
    <v-dialog v-model="metamaskConf" width="673">
      <v-card class="dialog">
        <div class="container-extra">
          <v-row class="mx-0 d-flex justify-center">
            <h2 class="text-center">Change Network in Metamask</h2>
          </v-row>
          <div class="container">
            <v-row class="mx-0 d-flex justify-center">
              <v-col cols="1">
                <span class="number greenish">1</span>
              </v-col>
              <v-col>
                <p class="text-justify mb-0">Click on top where it says:
                  <b class="ml-1">Main Ethereum Network.</b>
                </p>
              </v-col>
            </v-row>
            <v-row class="mx-0 d-flex justify-center">
              <v-col cols="1">
                <span class="number greenish">2</span>
              </v-col>
              <v-col>
                <p class="text-justify mb-0">Select<b class="ml-1">Custom RPC.</b></p>
              </v-col>
            </v-row>
            <v-row class="mx-0 d-flex justify-center">
              <v-col cols="1">
                <span class="number greenish">3</span>
              </v-col>
              <v-col>
                <p class="text-justify mb-0">Fill in the enabled fields like below:</p>
                <div class="green-box">
                  <v-row class="mx-0">
                    <p class="mx-0">Network Name: <b class="ml-1">RSK Mainnet</b></p>
                  </v-row>
                  <v-row class="mx-0">
                    <p class="mx-0">New RPC URL:
                      <b class="ml-1">https://public-node.testnet.rsk.co</b>
                    </p>
                  </v-row>
                  <v-row class="mx-0">
                    <p class="mx-0">Symbol: <b class="ml-1">RBTC</b></p>
                  </v-row>
                  <v-row class="mx-0">
                    <p class="mx-0">Block Explorer URL:
                      <b class="ml-1">https://public-node.testnet.rsk.co</b>
                    </p>
                  </v-row>
                </div>
              </v-col>
            </v-row>
            <v-row class="mx-0 d-flex justify-center">
              <v-col cols="1">
                <span class="number greenish">4</span>
              </v-col>
              <v-col>
                <p class="text-justify mb-0">Click on <b class="ml-1">Save.</b></p>
              </v-col>
            </v-row>
            <v-row class="mx-0 d-flex justify-end">
              <v-btn rounded outlined color="#00B520" width="104" @click="getWalletAddress">
                Done
              </v-btn>
            </v-row>
          </div>
        </div>
      </v-card>
    </v-dialog>
  </div>
</template>

<script lang="ts">
import {
  Vue, Component, Prop, Emit,
} from 'vue-property-decorator';
import { Action } from 'vuex-class';
import * as constants from '@/store/constants';

@Component
export default class Wallet extends Vue {
  @Prop(Boolean) configure!: boolean;

  @Action(constants.SESSION_CONNECT_WEB3, { namespace: 'web3Session' }) sessionConnect !: any;

  @Action(constants.WEB3_SESSION_GET_ACCOUNT, { namespace: 'web3Session' }) getAccount !: any;

  useWeb3Wallet = true;

  metamaskConf = false;

  @Emit()
  connectToMetamask() {
    if (this.configure) {
      this.useWeb3Wallet = false;
      this.metamaskConf = true;
    } else {
      this.useWeb3Wallet = false;
      this.metamaskConf = false;
      this.getWalletAddress();
    }
  }

  @Emit('web3Address')
  getWalletAddress() {
    this.sessionConnect();
    this.getAccount();
    this.metamaskConf = false;
  }
}
</script>
