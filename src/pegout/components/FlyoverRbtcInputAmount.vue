<template>
    <div class="form-step ma-0 py-4">
      <v-row class="align-start mx-0">
        <v-col cols="auto" class="pl-0">
          <div v-bind:class="[focus ?
                'number-filled' : 'number']">2</div>
        </v-col>
        <v-col class="pl-0">
          <p v-bind:class="{'boldie': focus}">
            Enter the amount you want to send:
          </p>
          <v-row class="d-flex align-center ma-0 mt-4 pl-1">
            <v-col cols="4" v-bind:class="[amountStyle]"
                   class="input-box-outline" id="amount-field">
            <v-col cols="8" class="pa-0 pl-1">
                <v-text-field
                  :disabled="!isWalletConnected"
                  v-model="rbtcAmount"
                  bg-color="transparent"
                  density="compact"
                  class="amount-input"
                  placeholder="Add amount" type="number" step="0.00000001"
                  @focus="focus = true"
                  @blur="focus = false"
                  @update:modelValue="updateStore()"
                  @keydown="blockLetterKeyDown"
                  variant="solo"
                  flat hide-details full-width single-line/>
              </v-col>
              <v-col cols="4" class="pa-0">
                <v-row class="ma-0">
                  <v-col cols="4" class="pa-0">
                    <v-img :src="require('@/assets/exchange/rbtc.png')" height="20" contain/>
                  </v-col>
                  <v-col cols="7" class="pa-0 d-flex align-center">
                    <span>{{environmentContext.getRbtcTicker()}}</span>
                  </v-col>
                </v-row>
              </v-col>
            </v-col>
            <v-col cols="1"/>
            <v-col cols="2" class="d-flex justify-center">
              <v-icon color="#000" :icon="mdiArrowRight"></v-icon>
            </v-col>
            <v-col cols="3" class="pa-0 input-box-flat">
              <v-col cols="8" class="pa-0 pl-1">
                <v-text-field
                  variant="solo"
                  hide-details full-width single-line flat readonly
                  class="amount-input"
                  placeholder="0"
                  v-model="btcAmount"
                  type="number"/>
              </v-col>
              <v-col cols="4" class="ma-0">
                <v-row>
                  <v-col cols="5" class="pa-0">
                    <v-img :src="require('@/assets/exchange/btc.png')" height="20" contain/>
                  </v-col>
                  <v-col cols="7" class="pa-0 d-flex align-center">
                    <span>{{environmentContext.getBtcTicker()}}</span>
                  </v-col>
                </v-row>
              </v-col>
            </v-col>
          </v-row>
          <v-row class="ma-0 error-max-balance" style="min-height: 17px;">
            <span v-if="stepState === 'error'" class="yellowish" id="rbtc-error-msg">
              {{amountErrorMessage}}
            </span>
          </v-row>
        </v-col>
      </v-row>
    </div>
  </template>

<script lang="ts">
import {
  computed, ref, watch, defineComponent,
} from 'vue';
import { mdiArrowRight } from '@mdi/js';
import EnvironmentContextProviderService from '@/common/providers/EnvironmentContextProvider';
import * as constants from '@/common/store/constants';
import { isRBTCAmountValidRegex } from '@/common/utils';
import {
  PegOutTxState, SessionState, WeiBig,
} from '@/common/types';
import { useAction, useState } from '@/common/store/helper';

export default defineComponent({
  name: 'FlyoverRbtcInputAmount',
  props: {
    enableButton: Boolean,
  },
  setup(_, context) {
    const environmentContext = EnvironmentContextProviderService.getEnvironmentContext();
    const focus = ref(false);
    const isMaxValueZero = ref(false);
    const rbtcAmount = ref('');
    const amountStyle = ref('');
    const stepState = ref<'unset' | 'valid' |'error'>('unset');

    const web3SessionState = useState<SessionState>('web3Session');
    const pegOutTxState = useState<PegOutTxState>('pegOutTx');
    const setRbtcAmount = useAction('flyoverPegout', constants.FLYOVER_PEGOUT_ADD_AMOUNT);
    const addAmount = useAction('pegOutTx', constants.PEGOUT_TX_ADD_AMOUNT);
    const calculateFee = useAction('pegOutTx', constants.PEGOUT_TX_CALCULATE_FEE);
    const account = computed<string>(() => web3SessionState.value.account as string);

    const safeAmount = computed((): WeiBig => new WeiBig(rbtcAmount.value ?? '0', 'rbtc'));

    const btcAmount = computed(() => rbtcAmount.value);

    const amountErrorMessage = computed(() => {
      const { minValue, maxValue } = pegOutTxState.value.pegoutConfiguration;
      const { balance } = web3SessionState.value;
      if (rbtcAmount.value.toString() === '') {
        return 'Please, enter an amount';
      }
      if (rbtcAmount.value.toString() === '0' && balance.lte('0')) {
        return 'Selected account has no balance';
      }
      if (rbtcAmount.value.toString() === '0') {
        return 'Please, enter an amount';
      }
      if (!isRBTCAmountValidRegex(rbtcAmount.value)) {
        return `The amount must be a valid ${environmentContext.getRbtcTicker()} value`;
      }
      if (safeAmount.value.gt(balance)) {
        return 'You don\'t have the balance for this amount';
      }
      if (safeAmount.value.lt(minValue)) {
        return `The minimum accepted value is ${minValue.toRBTCTrimmedString()} ${environmentContext.getRbtcTicker()}`;
      }
      if (safeAmount.value.gt(maxValue)) {
        return `The maximum accepted value is ${maxValue.toRBTCTrimmedString()} ${environmentContext.getRbtcTicker()}`;
      }
      return '';
    });

    const insufficientAmount = computed(() => {
      const { pegoutConfiguration } = pegOutTxState.value;
      const { balance } = web3SessionState.value;
      return safeAmount.value.lte('0')
          || safeAmount.value.gt(balance)
          || safeAmount.value.lt(pegoutConfiguration.minValue)
          || safeAmount.value.gt(pegoutConfiguration.maxValue);
    });

    const isWalletConnected = computed((): boolean => web3SessionState.value.account !== undefined);

    function blockLetterKeyDown(e: KeyboardEvent) {
      if (rbtcAmount.value.toString().length > 18
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

    function updateStore() {
      setRbtcAmount(new WeiBig(rbtcAmount.value, 'rbtc'));
      addAmount(new WeiBig(rbtcAmount.value, 'rbtc')).then(() => {
        calculateFee();
      });
    }

    function checkAmount() {
      if (!isWalletConnected.value) return;
      stepState.value = !insufficientAmount.value && isRBTCAmountValidRegex(rbtcAmount.value)
        ? 'valid' : 'error';
      amountStyle.value = stepState.value === 'valid' ? 'black-box' : 'yellow-box';
    }

    function clearStateWhenWalletIsDisconnected() {
      if (!isWalletConnected.value) {
        rbtcAmount.value = '';
        isMaxValueZero.value = false;
        context.emit('walletDisconnected');
      }
    }

    watch(account, clearStateWhenWalletIsDisconnected);
    watch(rbtcAmount, checkAmount);

    return {
      amountStyle,
      isWalletConnected,
      rbtcAmount,
      focus,
      updateStore,
      blockLetterKeyDown,
      stepState,
      amountErrorMessage,
      mdiArrowRight,
      environmentContext,
      btcAmount,
    };
  },
});
</script>
