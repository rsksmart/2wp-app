<template>
  <div class="py-4" >
    <v-row class="align-start ma-0">
      <v-col cols="auto" class="pl-0">
        <div v-bind:class="[focus ?
              'number-filled' : 'number']">1</div>
      </v-col>
      <v-col class="pl-0 pb-0">
        <p v-bind:class="{'boldie': focus}">
          Connect your Rootstock wallet:
        </p>
        <v-row class="ma-0 mt-4">
          <template v-if="useWeb3Wallet && web3Address">
            <v-col cols="5" class="pl-1">
              <v-row class="ma-0">
                <p class="account">
                  {{ address }}
                  {{ balance.toRBTCTrimmedString() }}
                  {{ environmentContext.getRbtcTicker() }}
                </p>
              </v-row>
            </v-col>
            <v-col cols="2" class="d-flex justify-center">
              <div class="divider" style="height: 38px;"></div>
            </v-col>
            <v-col cols="3" class="pa-0 align-self-center">
              <v-row class="derive-button ma-0 pl-4">
                <v-btn
                  @click="disconnectWallet"
                  variant="outlined" rounded
                  height="38">
                  <span>
                    Disconnect wallet
                  </span>
                </v-btn>
              </v-row>
            </v-col>
          </template>
          <template v-else>
            <v-col cols="5" class="wallet-label-container">
              <v-row class="ma-0 pa-0 pl-1" >
                <v-text-field
                  class="wallet-address-input"
                  density="compact"
                  variant="solo"
                  disabled
                  flat
                  hide-details
                  :placeholder="
                  `Connect your wallet to select the ${environmentContext.getRbtcTicker()} address`
                  "
                  @focus="focus = true"
                  @blur="focus = false"/>
              </v-row>
            </v-col>
            <v-col cols="2" class="d-flex justify-center">
              <div class="divider"></div>
            </v-col>
            <v-col cols="3" class="pa-0 align-self-center">
              <v-row class="ma-0 pl-4">
                <v-btn variant="outlined" rounded color="#000000" height="38"
                  class="select-wallet-button"
                  @click="connectWallet" id="wallet-connection">
                  <span class="blackish">Connect wallet</span>
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
import { computed, ref, defineComponent } from 'vue';
import * as constants from '@/common/store/constants';
import EnvironmentContextProviderService from '@/common/providers/EnvironmentContextProvider';
import { useAction, useStateAttribute } from '@/common/store/helper';
import WeiBig from '../../common/types/WeiBig';

export default defineComponent({
  name: 'RskWalletConnection',
  setup(_, context) {
    const focus = ref(false);
    const useWeb3Wallet = ref(false);
    const environmentContext = EnvironmentContextProviderService.getEnvironmentContext();
    const account = useStateAttribute<string>('web3Session', 'account');
    const balance = useStateAttribute<WeiBig>('web3Session', 'balance');
    const connectWeb3 = useAction('web3Session', constants.SESSION_CONNECT_WEB3);
    const clearAccount = useAction('web3Session', constants.WEB3_SESSION_CLEAR_ACCOUNT);
    const getBalance = useAction('web3Session', constants.WEB3_SESSION_ADD_BALANCE);
    const web3Address = computed(() => account.value ?? '');
    const address = computed((): string => (account.value ? account.value : ''));
    function switchSignature() {
      context.emit('switchDeriveButton', !!account.value);
    }
    function disconnectWallet() {
      focus.value = true;
      clearAccount();
      switchSignature();
    }
    function connectWallet(): Promise<void> {
      useWeb3Wallet.value = true;
      focus.value = true;
      return connectWeb3()
        .then(() => {
          focus.value = false;
          getBalance();
          switchSignature();
        })
        .catch(() => {
          focus.value = false;
          clearAccount();
        });
    }
    return {
      useWeb3Wallet,
      web3Address,
      address,
      environmentContext,
      balance,
      disconnectWallet,
      focus,
      connectWallet,
    };
  },
});
</script>
