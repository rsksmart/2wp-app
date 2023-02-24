<template>
  <div class="py-4">
    <v-row class="align-start mx-0">
      <v-col cols="auto" class="pl-0">
        <div v-bind:class="[focus ?
              'number-filled' : 'number']">1</div>
      </v-col>
      <v-col class="pl-0">
        <p v-bind:class="{'boldie': focus}">
          Connect your Rootstock wallet :
        </p>
        <v-row class="mx-0 mt-4">
          <template v-if="useWeb3Wallet && web3Address">
             <div class="container">
              <v-row class="mx-0">
                <span>Wallet connected</span>
              </v-row>
              <v-row class="mx-0 d-flex align-center">
                <p class="mb-0 account">{{ address }}</p>
              </v-row>
              <v-row class="mx-0">
                <v-btn class="pa-0" text @click="disconnectWallet">
                  <span class="blueish">Disconnect wallet</span>
                </v-btn>
              </v-row>
            </div>
          </template>
          <template v-else>
            <v-col cols="7" class="wallet-label-container pl-0 pb-0">
              <v-row class="blue-box input-box-outline mx-0 pa-0 pl-0" >
                <v-text-field
                  v-model="address"
                  class="wallet-address-input"
                  solo dense
                  disabled
                  flat
                  hide-details
                  :label="`Select or paste the ${this.environmentContext.getRbtcTicker()} address`"
                  @focus="focus = true"
                  @blur="focus = false"/>
              </v-row>
            </v-col>
            <v-col cols="1" class="d-flex justify-center pb-0">
              <div class="divider"/>
            </v-col>
            <v-col cols="4" class="pb-0 px-0">
              <v-row class="mx-0 d-flex justify-center">
                <v-btn outlined rounded color="#00B520" width="100%" height="38"
                  class="select-wallet-button"
                  @click="connectWallet" >
                  <span class="greenish">Connect wallet</span>
                </v-btn>
              </v-row>
            </v-col>
          </template>
        </v-row>
      </v-col>
    </v-row>
  </div>
</template>

<script lang="ts">
import { Component, Emit, Vue } from 'vue-property-decorator';
import { Action, State } from 'vuex-class';
import { PegOutTxState, SessionState } from '@/types';
import * as constants from '@/store/constants';
import EnvironmentContextProviderService from '@/providers/EnvironmentContextProvider';

@Component({})
export default class RskWalletConnection extends Vue {
  focus = false;

  useWeb3Wallet = false;

  isValidPegOutAddress = true;

  @State('pegOutTx') pegOutTxState!: PegOutTxState;

  @State('web3Session') web3SessionState!: SessionState;

  @Action(constants.SESSION_CONNECT_WEB3, { namespace: 'web3Session' }) connectWeb3 !: () => Promise<void>;

  @Action(constants.WEB3_SESSION_CLEAR_ACCOUNT, { namespace: 'web3Session' }) clearAccount !: () => void;

  @Action(constants.WEB3_SESSION_ADD_BALANCE, { namespace: 'web3Session' }) getBalance !: () => Promise<void>;

  environmentContext = EnvironmentContextProviderService.getEnvironmentContext();

  get web3Address() {
    return this.web3SessionState.account ?? '';
  }

  disconnectWallet() {
    this.focus = true;
    this.clearAccount();
    this.switchSignature();
  }

  connectWallet(): Promise<void> {
    this.useWeb3Wallet = true;
    this.focus = true;
    return this.connectWeb3()
      .then(() => {
        this.focus = false;
        this.getBalance();
        this.switchSignature();
      })
      .catch(() => {
        this.focus = false;
        this.clearAccount();
      });
  }

  @Emit('switchDeriveButton')
  switchSignature(): boolean {
    return this.web3SessionState.account !== undefined;
  }

  get address(): string {
    return this.web3SessionState.account ? this.web3SessionState.account : '';
  }
}
</script>
