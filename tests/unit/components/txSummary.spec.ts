import { createLocalVue, shallowMount } from '@vue/test-utils';
import Vuex from 'vuex';
import Vuetify from 'vuetify';
import TxSummaryFixed from '@/components/exchange/TxSummaryFixed.vue';
import * as constants from '@/store/constants';
import { EnvironmentAccessorService } from '@/services/enviroment-accessor.service';
import sinon from 'sinon';
import {
  NormalizedSummary, PegoutStatus, SatoshiBig, TxStatusType, TxSummaryOrientation, WeiBig,
} from '@/types';

const localVue = createLocalVue();
let vuetify:any;

describe('TxSummary', () => {
  const defaultEnvironmentVariables = {
    vueAppCoin: constants.BTC_NETWORK_TESTNET,
  };
  const btcDerivedAddress = 'userBtcDerivedAddress';
  const bitcoinPrice = 40537;
  let summary:NormalizedSummary;
  beforeEach(() => {
    vuetify = new Vuetify();
    EnvironmentAccessorService.initializeEnvironmentVariables(defaultEnvironmentVariables);
  });
  afterEach(() => {
    sinon.restore();
  });

  localVue.use(Vuex);

  const sessionState = {
    enabled: true,
    txType: 'PEG_IN_TRANSACTION_TYPE',
    balance: new WeiBig('0', 'wei'),
    btcDerivedAddress,
    bitcoinPrice,
  };
  const store = new Vuex.Store({
    modules: {
      web3Session: {
        state: sessionState,
        namespaced: true,
      },
    },
  });

  test.todo('Summary horizontal Peg In');
  test.todo('Summary horizontal Peg Out');
  test.todo('Summary Vertical Peg In');
  test.todo('Summary Vertical Peg Out');

  it('Check summary overflow values USD', () => {
    summary = {
      amountFromString: '0.005',
      amountReceivedString: '0.005',
      fee: 2000,
      recipientAddress: 'selectedWalletAddress',
      refundAddress: 'userRefundAddress',
      selectedAccount: 'Legacy - 0.005 TBTC',
      federationAddress: 'federationAddress',
    };
    const wrapper = shallowMount(TxSummaryFixed, {
      store,
      localVue,
      vuetify,
      propsData: {
        type: TxStatusType.PEGIN,
        orientation: TxSummaryOrientation.HORIZONTAL,
        summary,
        initialExpand: true,
      },
    });
    expect(wrapper.find('#amount').text()).toEqual(`${0.005} TBTC`);
  });
  it('should show the estimated fee if the api does not return the value', () => {
    summary = {
      amountFromString: '0.005',
      amountReceivedString: '0.005',
      fee: undefined,
      recipientAddress: 'selectedWalletAddress',
      refundAddress: 'userRefundAddress',
      selectedAccount: 'Legacy - 0.005 TBTC',
      federationAddress: 'federationAddress',
      estimatedFee: 3000,
    };
    const wrapper = shallowMount(TxSummaryFixed, {
      store,
      localVue,
      vuetify,
      propsData: {
        type: TxStatusType.PEGOUT,
        orientation: TxSummaryOrientation.HORIZONTAL,
        summary,
        initialExpand: true,
      },
    });
    expect(wrapper.find('#summary-horizontal-value-fee').text()).toEqual(`${new SatoshiBig('3000', 'satoshi')} TRBTC`);
    expect(wrapper.find('#summary-horizontal-title-fee').text()).toEqual('Estimated fee');
  });
  it('should show the fee if the api return the value', () => {
    summary = {
      amountFromString: '0.005',
      amountReceivedString: '0.005',
      fee: 2000,
      recipientAddress: 'selectedWalletAddress',
      refundAddress: 'userRefundAddress',
      selectedAccount: 'Legacy - 0.005 TBTC',
      federationAddress: 'federationAddress',
      estimatedFee: 3000,
    };
    const wrapper = shallowMount(TxSummaryFixed, {
      store,
      localVue,
      vuetify,
      propsData: {
        type: TxStatusType.PEGOUT,
        orientation: TxSummaryOrientation.HORIZONTAL,
        summary,
        initialExpand: true,
      },
    });
    expect(wrapper.find('#summary-horizontal-value-fee').text()).toEqual(`${new SatoshiBig('2000', 'satoshi')} TRBTC`);
    expect(wrapper.find('#summary-horizontal-title-fee').text()).toEqual('Fee');
  });
});
