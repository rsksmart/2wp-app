<template>
  <div>
    <v-dialog v-model="useWeb3Wallet" width="673">
      <v-card class="dialog">
        <v-btn icon text class="close-btn" color="#ECF9EE" @click="useWeb3Wallet = false">
          <v-icon color="#000">mdi-close</v-icon>
        </v-btn>
        <div class="container-extra">
          <v-row class="mx-0 d-flex justify-center">
            <h2 class="text-center">Select Wallet</h2>
          </v-row>
          <div class="container">
            <v-row class="mx-0">
              <v-col>
                <v-btn text color="transparent" width="200" @click="connectToMetamask"
                       class="pa-0 ma-0 d-flex justify-center" :disabled="!isMetamask">
                  <v-row class="mx-0">
                    <v-col cols="5" class="d-flex justify-center">
                      <v-img :src="metamaskImg" height="40" contain/>
                    </v-col>
                    <v-col class="d-flex align-center">
                      <p class="ma-0" v-bind:class="{'gray-greenish': !isMetamask}">Metamask</p>
                    </v-col>
                  </v-row>
                </v-btn>
              </v-col>
              <v-col>
                <v-btn text color="transparent" width="200" disabled
                       class="pa-0 ma-0 d-flex justify-center">
                  <v-row class="mx-0">
                    <v-col cols="5" class="d-flex justify-center">
                      <v-img src="@/assets/web3/my-crypto-disabled.png"
                             height="40" width="40" contain/>
                    </v-col>
                    <v-col class="d-flex align-center">
                      <p class="ma-0 gray-greenish">MyCrypto</p>
                    </v-col>
                  </v-row>
                </v-btn>
              </v-col>
            </v-row>
            <v-row class="mx-0">
              <v-col>
                <v-btn text color="transparent" width="200" disabled
                       class="pa-0 ma-0 d-flex justify-center">
                  <v-row class="mx-0">
                    <v-col cols="5" class="d-flex justify-center">
                      <v-img src="@/assets/web3/my-ether-disabled.png" height="40" contain/>
                    </v-col>
                    <v-col class="pr-0 d-flex align-center">
                      <p class="ma-0 gray-greenish">MyEther Wallet</p>
                    </v-col>
                  </v-row>
                </v-btn>
              </v-col>
            </v-row>
          </div>
          <v-row class="d-flex justify-center">
            <p class="ma-0 mr-2">No wallet yet?</p>
            <a href="https://developers.rsk.co/wallet/use/metamask/" target="_blank" rel="noopener">
              Get one here!
            </a>
          </v-row>
          <v-row class="mx-0 pt-8">
            <h3>What is a wallet?</h3>
          </v-row>
          <v-row class="mx-0">
            <p class="text-justify">
              Wallets are used to send, receive, and store digital assets like Ether. Wallets
              come in many forms. They are either built into your browser, an extension added to
              your browser, a piece of hardware plugged into your computer or even an app on your
              phone.
            </p>
          </v-row>
        </div>
      </v-card>
    </v-dialog>
    <v-dialog v-model="metamaskConf" width="673">
      <v-card class="dialog">
        <v-btn icon text class="close-btn" color="#ECF9EE" @click="metamaskConf = false">
          <v-icon color="#000">mdi-close</v-icon>
        </v-btn>
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
                  <strong class="ml-1">Main Ethereum Network.</strong>
                </p>
              </v-col>
            </v-row>
            <v-row class="mx-0 d-flex justify-center">
              <v-col cols="1">
                <span class="number greenish">2</span>
              </v-col>
              <v-col>
                <p class="text-justify mb-0">Select<strong class="ml-1">Custom RPC.</strong></p>
              </v-col>
            </v-row>
            <v-row class="mx-0 d-flex justify-center">
              <v-col cols="1">
                <span class="number greenish">3</span>
              </v-col>
              <v-col>
                <p class="text-justify mb-0">Fill in the enabled fields like below:</p>
                <div class="black-box">
                  <v-row class="mx-0">
                    <p class="mx-0">Network Name:
                      <strong class="ml-1">
                        {{environmentContext.getRskText()}}
                      </strong>
                    </p>
                  </v-row>
                  <v-row class="mx-0">
                    <p class="mx-0">New RPC URL:
                      <strong class="ml-1">{{vueAppRskNodeHost}}</strong>
                    </p>
                  </v-row>
                  <v-row class="mx-0">
                    <p class="mx-0">Symbol: <strong class="ml-1">
                    {{environmentContext.getRbtcTicker()}}</strong></p>

                  </v-row>
                  <v-row class="mx-0">
                    <p class="mx-0">Block Explorer URL:
                      <strong class="ml-1">{{rskBlockExplorer}}</strong>
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
                <p class="text-justify mb-0">Click on <strong class="ml-1">Save.</strong></p>
              </v-col>
            </v-row>
            <v-row class="mx-0 d-flex justify-end">
              <v-btn rounded outlined color="#000000" width="104" @click="getWalletAddress">
                Go to status page
              </v-btn>
            </v-row>
          </div>
        </div>
      </v-card>
    </v-dialog>
  </div>
</template>

<script lang="ts">
import * as constants from '@/common/store/constants';
import MetaMask from '@/assets/web3/metamask.png';
import MetaMaskDisabled from '@/assets/web3/metamask-disabled.png';
import EnvironmentContextProviderService from '@/common/providers/EnvironmentContextProvider';
import { EnvironmentAccessorService } from '@/common/services/enviroment-accessor.service';
import { computed, ref } from 'vue';
import { useAction } from '@/common/store/helper';

export default {
  name: 'Wallet',
  props: {
    configure: Boolean,
  },
  setup(props, context) {
    const useWeb3Wallet = ref(true);
    const metamaskConf = ref(false);
    const environmentContext = EnvironmentContextProviderService.getEnvironmentContext();
    const vueAppRskNodeHost = EnvironmentAccessorService.getEnvironmentVariables().vueAppRskNodeHost;
    const rskBlockExplorer = EnvironmentAccessorService.getEnvironmentVariables().vueAppRskExplorer;

    const sessionConnect = useAction('web3Session', constants.SESSION_CONNECT_WEB3);
    const getAccount = useAction('web3Session', constants.WEB3_SESSION_GET_ACCOUNT);

    const isMetamask = computed<Boolean>( () => window.ethereum.isMetaMask);
    const metamaskImg = computed(() => {
      return isMetamask.value ? MetaMask : MetaMaskDisabled;
    });

    function connectToMetamask() {
      if (props.configure) {
        useWeb3Wallet.value = false;
        metamaskConf.value = true;
      } else {
        useWeb3Wallet.value = true;
        metamaskConf.value = false;
        getWalletAddress();
      }
    }

    function getWalletAddress() {
      if (isMetamask.value) {
        sessionConnect();
        getAccount();
        useWeb3Wallet.value = false;
      }
      metamaskConf.value = false;
      context.emit('web3Address');
    }

    return {
      useWeb3Wallet,
      connectToMetamask,
      isMetamask,
      metamaskImg,
      metamaskConf,
      environmentContext,
      rskBlockExplorer,
      vueAppRskNodeHost,
      getWalletAddress,
    };
  }
}
</script>