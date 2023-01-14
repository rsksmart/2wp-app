<template>
  <div id="option-3" class="py-4">
    <v-row align="start" class="mx-0">
      <v-col cols="auto" class="pl-0">
        <div v-bind:class="[focus ?
              'number-filled' : 'number']">3</div>
      </v-col>
      <v-col class="pl-0">
        <p v-bind:class="{'boldie': focus}">
          Enter or select the {{environmentContext.getRskText()}} address where
          {{environmentContext.getRbtcTicker()}} will be deposited:
        </p>
        <v-row class="mx-0 mt-4">
          <template v-if="useWeb3Wallet && web3Address">
            <div class="container">
              <v-row class="mx-0">
                <span>Wallet connected</span>
              </v-row>
              <v-row class="mx-0 d-flex align-center">
                <p class="mb-0 account">{{ web3Address }}</p>
              </v-row>
              <v-row class="mx-0"
                     v-show="(!isValidRskAddress || !isValidPegInAddress)
                      && (rskAddressSelected || web3Address)">
                      <span class="yellowish">
                        {{validAddressMessage}}
                      </span>
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
              <v-row class="mx-0 mb-4 d-flex justify-start">
                <span class="label-title text-center">
                  Type in your {{environmentContext.getRskText()}} address
                </span>
              </v-row>
              <v-row :class="[isValidRskAddress || !rskAddressSelected ?
                     'blue-box' : 'yellow-box' ]"
                     class="input-box-outline mx-0 pa-0 pl-0" >
                <v-text-field
                  v-model="rskAddressSelected"
                  class="wallet-address-input"
                  solo dense
                  flat
                  hide-details
                  :label="`Select or paste the ${this.environmentContext.getRskText()} address`"
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
            <v-col cols="1" class="d-flex justify-center pb-0">
              <div class="divider"/>
            </v-col>
            <v-col cols="4" class="pb-0 px-0">
              <v-row class="mx-0 mb-4 d-flex justify-start">
                <span class="text-center">Choose address from a wallet</span>
              </v-row>
              <v-row class="mx-0 d-flex justify-center">
                <v-btn outlined rounded color="#000000" width="100%" height="38"
                  class="select-wallet-button"
                  @click="selectRLoginWallet" >
                  <span class="greenish">Connect wallet</span>
                </v-btn>
              </v-row>
            </v-col>
          </template>
        </v-row>
      </v-col>
      <v-icon color="#C4C4C4">mdi-info-outlined</v-icon>
    </v-row>
  </div>
</template>

<script lang="ts">
import { Component, Emit, Vue } from 'vue-property-decorator';
import { Action, State } from 'vuex-class';
import * as rskUtils from '@rsksmart/rsk-utils';
import { PegInTxState } from '@/types/pegInTx';
import { SessionState } from '@/types/session';
import { EnvironmentAccessorService } from '@/services/enviroment-accessor.service';
import * as constants from '@/store/constants';
import EnvironmentContextProviderService from '@/providers/EnvironmentContextProvider';

@Component({
})
export default class RskAddressInput extends Vue {
  environmentContext = EnvironmentContextProviderService.getEnvironmentContext();

  focus = false;

  useWeb3Wallet = false;

  web3Wallet = false;

  CHAIN_ID =
    EnvironmentAccessorService.getEnvironmentVariables().vueAppCoin
    === constants.BTC_NETWORK_MAINNET ? 30 : 31;

  VALUE_INCOMPLETE_MESSAGE = 'Not completed';

  rskAddressSelected = '';

  @State('web3Session') web3SessionState!: SessionState;

  @State('pegInTx') pegInTxState!: PegInTxState;

  @Action(constants.WEB3_SESSION_CLEAR_ACCOUNT, { namespace: 'web3Session' }) clearAccount !: () => void;

  @Action(constants.PEGIN_TX_ADD_RSK_ADDRESS, { namespace: 'pegInTx' }) setRskAddress !: (address: string) => void;

  @Action(constants.SESSION_CONNECT_WEB3, { namespace: 'web3Session' }) connectWeb3 !: () => Promise<void>;

  get web3Address() {
    return this.web3SessionState.account ?? '';
  }

  get isValidRskAddress() {
    return !this.useWeb3Wallet
      ? rskUtils.isValidChecksumAddress(this.computedRskAddress, this.CHAIN_ID) : true;
  }

  get isValidPegInAddress() {
    return rskUtils.isAddress(this.computedRskAddress, this.CHAIN_ID) && this.computedRskAddress.startsWith('0x');
  }

  get computedRskAddress() {
    if (this.rskAddressSelected !== ''
      && rskUtils.isAddress(this.rskAddressSelected)) {
      return this.rskAddressSelected;
    }
    if (this.useWeb3Wallet && this.web3Address !== '') {
      return this.web3Address;
    }
    return this.VALUE_INCOMPLETE_MESSAGE;
  }

  get validAddressMessage() {
    let message = '';
    if (!this.regexValidationAddress()) message = 'The RSK recipient address must be a valid RSK address';
    else if (!this.isValidPegInAddress) message = 'This is an invalid address';
    else if (!this.isValidRskAddress) message = `This may not be a valid address on the ${this.environmentContext.getRskText()} network. Please check.`;
    this.checkStep();
    return message;
  }

  regexValidationAddress() {
    const regx = new RegExp('\\b0x[0-9A-Fa-f]{40}$');
    return regx.test(this.rskAddressSelected);
  }

  @Emit('state')
  checkStep():string {
    if (!this.isValidPegInAddress) {
      this.setRskAddress('');
      return 'invalid';
    }
    this.setRskAddress(this.computedRskAddress);
    return this.isValidRskAddress ? 'valid' : 'warning';
  }

  @Emit()
  selectRLoginWallet() {
    this.focus = true;
    this.useWeb3Wallet = true;
    this.rskAddressSelected = '';
    this.connectWeb3()
      .then(() => {
        this.focus = false;
        this.checkStep();
      }).catch(() => {
        if (this.web3Address) {
          this.disconnectWallet();
        }
      });
    this.web3Wallet = true;
  }

  @Emit()
  disconnectWallet() {
    this.clearAccount();
    this.useWeb3Wallet = false;
    this.rskAddressSelected = '';
    this.web3Wallet = false;
    this.setRskAddress('');
  }

  @Emit('error')
  // eslint-disable-next-line class-methods-use-this
  handleError(e: Error) {
    return e;
  }

  created() {
    if (this.pegInTxState.rskAddressSelected) {
      this.focus = true;
      this.useWeb3Wallet = true;
      this.focus = false;
      this.rskAddressSelected = this.pegInTxState.rskAddressSelected;
      this.checkStep();
    }
  }
}
</script>
