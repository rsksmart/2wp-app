<template>
  <div id="option-3" class="py-4">
    <v-row class="align-start ma-0">
      <v-col cols="auto" class="pl-0">
        <div v-bind:class="[focus ?
              'number-filled' : 'number']">3</div>
      </v-col>
      <v-col class="pl-0">
        <p v-bind:class="{'boldie': focus}">
          Enter or select the {{environmentContext.getRskText()}} address where
          {{environmentContext.getRbtcTicker()}} will be deposited:
        </p>
        <v-row class="ma-0 mt-4">
          <template v-if="useWeb3Wallet && web3Address">
            <div class="container">
              <v-row class="ma-0">
                <span>Wallet connected</span>
              </v-row>
              <v-row class="ma-0 mt-1 d-flex align-center">
                <p class="mb-0 account">{{ web3Address }}</p>
              </v-row>
              <v-row class="mx-0"
                     v-show="(!isValidRskAddress || !isValidPegInAddress)
                      && (rskAddressSelected || web3Address)">
                      <span class="yellowish">
                        {{validAddressMessage}}
                      </span>
              </v-row>
              <v-row class="ma-0 mt-2">
                <v-btn class="pa-0" rounded variant="outlined"
                        @click="disconnectWallet"
                        style="min-width: 140px;">
                  <span class="blackish">Disconnect wallet</span>
                </v-btn>
              </v-row>
            </div>
          </template>
          <template v-else>
            <v-col cols="7" class="wallet-label-container pl-0 pb-0">
              <v-row class="mx-0 mb-4 d-flex justify-start">
                <span class="label-title text-center">
                  Type in your {{environmentContext.getRskText()}} address
                </span>
              </v-row>
              <v-row :class="[isValidRskAddress || !rskAddressSelected ?
                     'black-box' : 'yellow-box']"
                     class="ma-0 pa-0 input-box-outline" >
                <v-text-field
                  v-model="rskAddressSelected"
                  flat
                  hide-details
                  single-line
                  persistent-placeholder
                  density="compact"
                  variant="solo"
                  :placeholder="`Select or paste the ${environmentContext.getRskText()} address`"
                  @focus="focus = true"
                  @blur="focus = false"
                  @change="checkStep"/>
              </v-row>
              <v-row v-show="!isValidRskAddress && rskAddressSelected" class="mx-0">
                      <span class="yellowish">
                        {{validAddressMessage}}
                      </span>
              </v-row>
            </v-col>
            <v-col cols="1" class="d-flex justify-center py-0">
              <div class="divider"/>
            </v-col>
            <v-col cols="4" class="pb-0 px-0">
              <v-row class="mx-0 mb-4 d-flex justify-start">
                <span class="text-center">Choose address from a wallet</span>
              </v-row>
              <v-row class="mx-0 d-flex justify-center">
                <v-btn variant="outlined" rounded color="#000000" width="100%" height="38"
                  class="select-wallet-button"
                  @click="selectRLoginWallet" >
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
import * as rskUtils from '@rsksmart/rsk-utils';
import { computed, ref, defineComponent } from 'vue';
import { EnvironmentAccessorService } from '@/common/services/enviroment-accessor.service';
import * as constants from '@/common/store/constants';
import EnvironmentContextProviderService from '@/common/providers/EnvironmentContextProvider';
import { useAction, useStateAttribute } from '@/common/store/helper';

export default defineComponent({
  name: 'RskAddressInput',
  setup(_, context) {
    const environmentContext = EnvironmentContextProviderService.getEnvironmentContext();
    const focus = ref(false);
    const useWeb3Wallet = ref(false);
    const web3Wallet = ref(false);
    const CHAIN_ID = EnvironmentAccessorService
      .getEnvironmentVariables().vueAppCoin === constants.BTC_NETWORK_MAINNET ? 30 : 31;
    const VALUE_INCOMPLETE_MESSAGE = 'Not completed';
    const rskAddressSelected = ref('');

    const account = useStateAttribute<string>('web3Session', 'account');
    const storeRskAddressSelected = useStateAttribute<string>('pegInTx', 'rskAddressSelected');

    const clearAccount = useAction('web3Session', constants.WEB3_SESSION_CLEAR_ACCOUNT);
    const setRskAddress = useAction('pegInTx', constants.PEGIN_TX_ADD_RSK_ADDRESS);
    const connectWeb3 = useAction('web3Session', constants.SESSION_CONNECT_WEB3);

    const web3Address = computed(() => account.value ?? '');

    const computedRskAddress = computed<string>((): string => {
      if (rskAddressSelected.value !== ''
        && rskUtils.isAddress(rskAddressSelected)) {
        return rskAddressSelected.value;
      }
      if (useWeb3Wallet.value && web3Address.value !== '') {
        return web3Address.value;
      }
      return VALUE_INCOMPLETE_MESSAGE;
    });

    const isValidRskAddress = computed(() => (!useWeb3Wallet.value
      ? rskUtils.isValidChecksumAddress(computedRskAddress.value, CHAIN_ID) : true));

    const isValidPegInAddress = computed(
      () => rskUtils.isAddress(computedRskAddress.value, CHAIN_ID)
            && computedRskAddress.value.startsWith('0x'),
    );

    function regexValidationAddress() {
      const regx = /^(0x[a-fA-F0-9]{64}|[a-fA-F0-9]{64})$/;
      return regx.test(rskAddressSelected.value);
    }

    function checkStep() {
      let state;
      if (!isValidPegInAddress.value) {
        setRskAddress('');
        state = 'invalid';
      } else {
        setRskAddress(computedRskAddress.value);
        state = isValidRskAddress.value ? 'valid' : 'warning';
      }
      context.emit('state', state);
    }

    const validAddressMessage = computed(() => {
      let message = '';
      if (!regexValidationAddress()) {
        message = 'The RSK recipient address must be a valid RSK address';
      } else if (!isValidPegInAddress.value) message = 'This is an invalid address';
      else if (!isValidRskAddress.value) message = `This may not be a valid address on the ${environmentContext.getRskText()} network. Please check.`;
      checkStep();
      return message;
    });

    function disconnectWallet() {
      clearAccount();
      useWeb3Wallet.value = false;
      rskAddressSelected.value = '';
      web3Wallet.value = false;
      setRskAddress('');
    }

    function selectRLoginWallet() {
      focus.value = true;
      useWeb3Wallet.value = true;
      rskAddressSelected.value = '';
      connectWeb3()
        .then(() => {
          focus.value = false;
          checkStep();
        }).catch((e) => {
          console.log(e);
          if (web3Address.value) {
            disconnectWallet();
          }
        });
      web3Wallet.value = true;
    }

    if (storeRskAddressSelected.value) {
      useWeb3Wallet.value = true;
      focus.value = false;
      rskAddressSelected.value = storeRskAddressSelected.value;
      checkStep();
    }

    return {
      environmentContext,
      focus,
      useWeb3Wallet,
      web3Wallet,
      rskAddressSelected,
      VALUE_INCOMPLETE_MESSAGE,
      CHAIN_ID,
      web3Address,
      isValidRskAddress,
      isValidPegInAddress,
      validAddressMessage,
      disconnectWallet,
      selectRLoginWallet,
      checkStep,
    };
  },
});
</script>
