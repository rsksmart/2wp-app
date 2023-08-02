<template>
  <div class="py-4" >
    <v-row class="align-start mx-0">
      <v-col cols="auto" class="pl-0">
        <div v-bind:class="[focus ?
              'number-filled' : 'number']">1</div>
      </v-col>
      <v-col class="pl-0">
        <p v-bind:class="{'boldie': focus}">
          Connect your Rootstock wallet:
        </p>
        <v-row class="mx-0 mt-4">
          <template v-if="useWeb3Wallet && web3Address">
             <div class="pl-1">
              <v-row class="mx-0">
                <v-col class="pl-0">
                   <p class="mb-0 account">
                     {{ address }} -
                     {{ balance.toRBTCTrimmedString() }}
                     {{ environmentContext.getRbtcTicker() }}
                  </p>
                </v-col>
              </v-row>
              <v-row class="mx-0">
                <v-col cols="4" class="pa-0 pt-1">
                  <v-row class="derive-button mx-0 d-flex justify-center">
                    <v-btn
                      @click="disconnectWallet"
                      outlined rounded
                      width="100%" height="38">
                      <span>
                        Disconnect wallet
                      </span>
                    </v-btn>
                  </v-row>
                </v-col>
              </v-row>
            </div>
          </template>
          <template v-else>
            <v-col cols="7" class="wallet-label-container pl-0 pb-0">
              <v-row class="input-box-outline-readonly mx-0 pa-0 pl-0" >
                <v-text-field
                  v-model="address"
                  class="wallet-address-input"
                  solo dense
                  disabled
                  flat
                  hide-details
                  :label="`Connect your wallet to select the
                    ${environmentContext.getRbtcTicker()} address`"
                  @focus="focus = true"
                  @blur="focus = false"/>
              </v-row>
            </v-col>
            <v-col cols="1" class="d-flex justify-center pb-0">
              <div class="divider"/>
            </v-col>
            <v-col cols="4" class="pb-0 px-0">
              <v-row class="mx-0 d-flex justify-center">
                <v-btn outlined rounded color="#000000" width="100%" height="38"
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
import * as constants from '@/common/store/constants';
import EnvironmentContextProviderService from '@/common/providers/EnvironmentContextProvider';
import { computed, ref } from 'vue';
import { useAction, useStateAttribute } from '@/common/store/helper';
import WeiBig from '../../common/types/WeiBig';

export default {
  name: 'RskWalletConnection',
  setup(_, context) {
    const focus = ref(false);
    const useWeb3Wallet = ref(false);
    const environmentContext = EnvironmentContextProviderService.getEnvironmentContext();

    const account = useStateAttribute<String>('web3Session', 'account');
    const balance = useStateAttribute<WeiBig>('web3Session', 'balance');
    const connectWeb3 = useAction('web3Session', constants.SESSION_CONNECT_WEB3);
    const clearAccount = useAction('web3Session', constants.WEB3_SESSION_CLEAR_ACCOUNT);
    const getBalance = useAction('web3Session', constants.WEB3_SESSION_ADD_BALANCE);

    const web3Address = computed(() => {
      return account.value ?? '';
    });

    const address = computed((): string => {
      return account.value ? account.value : '';
    });

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

    function switchSignature() {
      context.emit('switchDeriveButton', !!account.value);
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
  }
}
//
// @Component({})
// class RskWalletConnection extends Vue {
//   focus = false;
//
//   useWeb3Wallet = false;
//
//   isValidPegOutAddress = true;
//
//   @State('pegOutTx') pegOutTxState!: PegOutTxState;
//
//   @State('web3Session') web3SessionState!: SessionState;
//
//   @Action(constants.SESSION_CONNECT_WEB3, { namespace: 'web3Session' }) connectWeb3 !: () => Promise<void>;
//
//   @Action(constants.WEB3_SESSION_CLEAR_ACCOUNT, { namespace: 'web3Session' }) clearAccount !: () => void;
//
//   @Action(constants.WEB3_SESSION_ADD_BALANCE, { namespace: 'web3Session' }) getBalance !: () => Promise<void>;
//
//   environmentContext = EnvironmentContextProviderService.getEnvironmentContext();
//
//   get web3Address() {
//     return this.web3SessionState.account ?? '';
//   }
//
//   disconnectWallet() {
//     this.focus = true;
//     this.clearAccount();
//     this.switchSignature();
//   }
//
//   connectWallet(): Promise<void> {
//     this.useWeb3Wallet = true;
//     this.focus = true;
//     return this.connectWeb3()
//       .then(() => {
//         this.focus = false;
//         this.getBalance();
//         this.switchSignature();
//       })
//       .catch(() => {
//         this.focus = false;
//         this.clearAccount();
//       });
//   }
//
//   @Emit('switchDeriveButton')
//   switchSignature(): boolean {
//     return this.web3SessionState.account !== undefined;
//   }
//
//   get address(): string {
//     return this.web3SessionState.account ? this.web3SessionState.account : '';
//   }
// }
</script>
