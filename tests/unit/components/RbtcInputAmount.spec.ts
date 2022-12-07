import { createLocalVue, shallowMount } from '@vue/test-utils';
import Big from 'big.js';
import Vuex, { Store } from 'vuex';
import Vuetify from 'vuetify';
import RbtcInputAmount from '@/components/pegout/RbtcInputAmount.vue';
import { PegOutTxState, RootState } from '@/types';
import * as constants from '@/store/constants';
import { EnvironmentAccessorService } from '@/services/enviroment-accessor.service';
import { pegOutTx } from '@/store/pegoutTx';
import EnvironmentContextProviderService from '../../../src/providers/EnvironmentContextProvider';
import { EnvironmentContext } from '../../../src/providers/types';

const localVue = createLocalVue();
let vuetify:any;
let store: Store<RootState>;
let state:PegOutTxState;

describe('RbtcInputAmount', () => {
  const defaultEnvironmentVariables = {
    vueAppCoin: constants.BTC_NETWORK_TESTNET,
  };
  let environmentContext: EnvironmentContext;
  beforeEach(() => {
    vuetify = new Vuetify();
    EnvironmentAccessorService.initializeEnvironmentVariables(defaultEnvironmentVariables);
    environmentContext = EnvironmentContextProviderService.getEnvironmentContext();
    localVue.use(Vuex);
    state = {
      amountToTransfer: new Big(0),
      balance: new Big('1.5'),
      validAmount: false,
      calculatedFees: {
        average: new Big('0.0003'),
        fast: new Big('0.0006'),
        slow: new Big('0.0001'),
      },
      maxAmountToTransfer: new Big('2'),
      minAmountToTransfer: new Big('0.005'),
      selectedFee: constants.BITCOIN_AVERAGE_FEE_LEVEL,

    };

    const { getters, actions, mutations } = pegOutTx;
    store = new Vuex.Store({
      modules: {
        pegOutTx: {
          state,
          getters,
          actions,
          mutations,
          namespaced: true,
        },
      },
    });
  });
  it('should show a message when the input value is below the minimum', async () => {
    const wrapper = shallowMount(RbtcInputAmount, {
      store,
      localVue,
      vuetify,
    });
    await wrapper.setData({
      rbtcAmount: '0.004',
    });
    expect(wrapper.find('#rbtc-error-msg')
      .text())
      .toEqual(`The minimum accepted value is ${state.minAmountToTransfer.toString()} ${environmentContext.getBtcTicker()}`);
  });
  it('should show a message when the input value is above the maximum', async () => {
    state.balance = new Big('2.5');
    const { getters, actions, mutations } = pegOutTx;
    store = new Vuex.Store({
      modules: {
        pegOutTx: {
          state,
          getters,
          actions,
          mutations,
          namespaced: true,
        },
      },
    });
    const wrapper = shallowMount(RbtcInputAmount, {
      store,
      localVue,
      vuetify,
    });
    await wrapper.setData({
      rbtcAmount: '2.1',
    });
    expect(wrapper.find('#rbtc-error-msg')
      .text())
      .toEqual(`The maximum accepted value is ${state.maxAmountToTransfer.toString()} ${environmentContext.getBtcTicker()}`);
  });
  it('should show a message when the user balance + fee are not enough', async () => {
    const wrapper = shallowMount(RbtcInputAmount, {
      store,
      localVue,
      vuetify,
    });
    await wrapper.setData({
      rbtcAmount: '1.4998',
    });
    expect(wrapper.find('#rbtc-error-msg')
      .text())
      .toEqual('You don\'t have the balance for this amount');
  });
  it('should not show any message when the input amount are between the balance and bounds', async () => {
    const wrapper = shallowMount(RbtcInputAmount, {
      store,
      localVue,
      vuetify,
    });
    await wrapper.setData({
      rbtcAmount: '1',
    });
    expect(wrapper.find('#rbtc-error-msg').exists()).toBeFalsy();
  });
  it('should show a message when the input amount are 0', async () => {
    const wrapper = shallowMount(RbtcInputAmount, {
      store,
      localVue,
      vuetify,
    });
    await wrapper.setData({
      rbtcAmount: '0',
    });
    expect(wrapper.find('#rbtc-error-msg')
      .text())
      .toEqual('Please, enter an amount');
  });
});
