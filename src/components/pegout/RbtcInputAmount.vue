<template>
  <v-container class="form-step pb-0 pt-3">
    <v-row align="start mx-0">
      <v-col cols="auto" class="pl-0">
        <div v-bind:class="[focus ?
              'number-filled' : 'number']">2</div>
      </v-col>
      <v-col class="px-0 mb-4">
        <p v-bind:class="{'boldie': focus}">
          Enter the amount you want to send:
        </p>
        <v-row class="ma-0">
          <v-col cols="5" class="pa-0 d-flex align-center input-box" >
            <v-col cols="8" class="ma-0 pa-0 d-flex align-center">
              <v-text-field class="amount-input" v-model="rbtcAmount" color="#F8F5F5"
                            placeholder="add amount" type="number" step="0.00000001"
                            @focus="focus = true"
                            @blur="focus = false"
                            @change="updateStore()"
                            @keydown="blockLetterKeyDown"
                            solo hide-details full-width single-line flat/>
            </v-col>
            <v-col cols="4" class="ma-0 pa-0">
              <v-row>
                <v-img src="@/assets/exchange/rbtc.png" height="30" contain/>
              </v-row>
            </v-col>
          </v-col>
          <v-col cols="1" class="pa-0 d-flex align-center">
            <v-icon>mdi-arrow-right</v-icon>
          </v-col>
          <v-col cols="5" class="pa-0 d-flex align-center">
            <v-row class="ma-0 pa-0">
              <v-col class="ma-0 pa-0 d-flex align-center">
                <span>{{rbtcAmount}}</span>
              </v-col>
              <v-col class="ma-0 pa-0 d-flex align-center">
                <v-img src="@/assets/exchange/rbtc.png" height="30" contain/>
              </v-col>
            </v-row>
          </v-col>
        </v-row>
      </v-col>
    </v-row>
  </v-container>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import EnvironmentContextProviderService from '@/providers/EnvironmentContextProvider';
import { Action } from 'vuex-class';
import * as constants from '@/store/constants';
import Big from 'big.js';

@Component({})
export default class RbtcInputAmount extends Vue {
  environmentContext = EnvironmentContextProviderService.getEnvironmentContext();

  focus = false;

  rbtcAmount = '';

  @Action(constants.PEGOUT_TX_ADD_AMOUNT, { namespace: 'pegOutTx' }) setRbtcAmount !: (amount: Big) => void;

  blockLetterKeyDown(e: KeyboardEvent) {
    if (this.rbtcAmount.toString().length > 18
      && !(e.key === 'Backspace'
        || e.key === 'Delete'
        || e.key === 'Home'
        || e.key === 'End'
        || e.key === 'ArrowRight'
        || e.key === 'ArrowLeft')) e.preventDefault();
    if (e.key === 'e') e.preventDefault();
    if (e.key === '+') e.preventDefault();
    if (e.key === '-') e.preventDefault();
  }

  updateStore() {
    this.setRbtcAmount(new Big(this.rbtcAmount));
    // TODO calculate fees, check valid input amount
  }
}
</script>
