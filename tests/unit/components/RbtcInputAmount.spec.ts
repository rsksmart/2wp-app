import { createLocalVue, shallowMount } from '@vue/test-utils';
import Vuex, { Store } from 'vuex';
import Vuetify from 'vuetify';
import RbtcInputAmount from '@/components/pegout/RbtcInputAmount.vue';
import { PegOutTxState, RootState } from '@/types';
import * as constants from '@/store/constants';
import { EnvironmentAccessorService } from '@/services/enviroment-accessor.service';
import { pegOutTx } from '@/store/pegoutTx';
import WeiBig from '@/types/WeiBig';
import EnvironmentContextProviderService from '@/providers/EnvironmentContextProvider';
import { EnvironmentContext } from '@/providers/types';

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
      amountToTransfer: new WeiBig(0, 'wei'),
      balance: new WeiBig('0.5', 'rbtc'),
      validAmount: false,
      calculatedFees: {
        average: new WeiBig('30000', 'wei'),
        fast: new WeiBig('60000', 'wei'),
        slow: new WeiBig('10000', 'wei'),
      },
      pegoutConfiguration: {
        minValue: new WeiBig('50000000', 'gwei'),
        maxValue: new WeiBig('1', 'rbtc'),
        bridgeContractAddress: '',
      },
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
      rbtcAmount: '0.0009',
    });
    expect(wrapper.find('#rbtc-error-msg')
      .text())
      .toEqual(`The minimum accepted value is ${state.pegoutConfiguration.minValue.toRBTCString()} ${environmentContext.getRbtcTicker()}`);
  });
  it('should show a message when the input value is above the maximum', async () => {
    state.balance = new WeiBig('2.5', 'rbtc');
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
      .toEqual(`The maximum accepted value is ${state.pegoutConfiguration.maxValue.toRBTCString()} ${environmentContext.getRbtcTicker()}`);
  });
  it('should show a message when the user balance + fee are not enough', async () => {
    state.balance = new WeiBig('2', 'rbtc');
    const wrapper = shallowMount(RbtcInputAmount, {
      store,
      localVue,
      vuetify,
    });
    await wrapper.setData({
      rbtcAmount: '2',
    });
    expect(wrapper.find('#rbtc-error-msg')
      .text())
      .toEqual('You don\'t have the balance for this amount');
  });
  it('should not show any message when the input amount are between the balance and bounds', async () => {
    state.balance = new WeiBig('4', 'rbtc');
    const wrapper = shallowMount(RbtcInputAmount, {
      store,
      localVue,
      vuetify,
    });
    await wrapper.setData({
      rbtcAmount: '0.5',
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
