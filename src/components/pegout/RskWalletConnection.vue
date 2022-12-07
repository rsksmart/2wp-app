<template>
  <v-container class="form-step mt-5 mb-0 py-0">
    <v-row class="align-start mx-0">
      <v-col cols="auto" class="pl-0">
        <div v-bind:class="[focus ?
              'number-filled' : 'number']">1</div>
      </v-col>
      <v-col class="pl-0">
        <p v-bind:class="{'boldie': focus}">
          Connect your RSK wallet:
        </p>
        <v-row>
          <v-col>
            <v-text-field class="disabled-input" :value="address" disabled color="#F8F5F5"
                          solo hide-details full-width single-line flat/>
          </v-col>
          <v-col class="d-flex align-center">
            <v-btn rounded color="#00B520" width="100%" height="38"
                   @click="connectWallet" @focus="focus = true" @blur="focus = false">
              <span class="whiteish">Connect wallet</span>
            </v-btn>
          </v-col>
        </v-row>
      </v-col>
    </v-row>
  </v-container>
</template>

<script lang="ts">
import { Component, Emit, Vue } from 'vue-property-decorator';
import { Action, State } from 'vuex-class';
import { PegOutTxState, SessionState } from '@/types';
import * as constants from '@/store/constants';
import { formatTxId } from '@/services/utils';

@Component({})
export default class RskWalletConnection extends Vue {
  focus = true;

  @State('pegOutTx') pegOutTxState!: PegOutTxState;

  @State('web3Session') web3SessionState!: SessionState;

  @Action(constants.SESSION_CONNECT_WEB3, { namespace: 'web3Session' }) connectWeb3 !: () => Promise<void>;

  @Action(constants.WEB3_SESSION_CLEAR_ACCOUNT, { namespace: 'web3Session' }) clearAccount !: () => void;

  connectWallet() {
    this.connectWeb3()
      .then(() => {
        // Will get the balance
        this.openPopUp();
      });
  }

  @Emit('openAddressDialog')
  openPopUp() {
    this.pegOutTxState.senderAddress = '';
  }

  get address(): string {
    return this.web3SessionState.account ? formatTxId(this.web3SessionState.account) : 'unset wallet';
  }
}
</script>
