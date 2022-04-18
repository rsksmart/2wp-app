import { createLocalVue, shallowMount } from '@vue/test-utils';
import { expect } from 'chai';
import Big from 'big.js';
import Vuex from 'vuex';
import TxSummary from '@/components/exchange/TxSummary.vue';
import SatoshiBig from '@/types/SatoshiBig';
import * as constants from '@/store/constants';

const localVue = createLocalVue();

describe('TxSummary', () => {
  let state: any;
  let store: any;
  beforeEach(() => {
    localVue.use(Vuex);
    state = {
      peginConfiguration: {
        minValue: 100000000,
        maxValue: 500000,
        federationAddress: '2MsfB93EYBK357huTNQHxiFLSiV7fHvB3Q4',
        btcConfirmations: 100,
        sessionId: 'gdgd34ttrge4teteette43drdgdgjmmh',
      },
      sessionId: 'gdgd34ttrge4teteette43drdgdgjmmh',
      utxoList: undefined,
      addressList: [{
        address: 'n2y1xQBv3cqmRPke7QBWy52F91ZdgrYUgh',
        path: [4444, 6666],
        publicKey: '04e4487a93ee97576e793d503a64d5b583fc340d93ee46da4660b4a2eaf5aeec59f40c20fbe19cf6c5dc5493215ed7ed9264259a2b9ddb5af1a50764c48e3beec9',
        serializedPath: '',
      },
      {
        address: '2N97KK9ynmYfY92zPUWDCWeLtQWuKxKsHpY',
        path: [4444, 6666],
        publicKey: '04ce3d652c815636e5c170adda39b7fd2275aefed59d40954499baba361e5d2628900dd0210735fa4ce630edc553d7e43def2b47d5e0e52c1a94fb044e097032b2',
        serializedPath: '',
      }],
      trezorConnected: false,
      bitcoinWallet: 'WALLET_LEDGER',
      bitcoinPrice: 40537,
      balances: {
        legacy: new SatoshiBig(0, 'satoshi'),
        segwit: new SatoshiBig(0, 'satoshi'),
        nativeSegwit: new SatoshiBig(0, 'satoshi'),
      },
      loadingBalance: false,
      selectedAccount: undefined,
      calculatedFees: {
        slow: new SatoshiBig(0.00025400, 'satoshi'),
        average: new SatoshiBig(0.00025400, 'satoshi'),
        fast: new SatoshiBig(0.00025400, 'satoshi'),
      },
      loadingFee: false,
      selectedFee: 'BITCOIN_AVERAGE_FEE_LEVEL',
      amountToTransfer: new SatoshiBig(0.00500000, 'btc'),
      isValidAmountToTransfer: true,
      rskAddressSelected: 'dfgdsg0dgs90h00nhs8996s8as5f76hgel',
    };

    const getters = {
      [constants.PEGIN_TX_GET_REFUND_ADDRESS]: () => 'n2y1xQBv3cqmRPke7QBWy52F91ZdgrYUgh',
    };
    store = new Vuex.Store({
      modules: {
        pegInTx: {
          state,
          getters,
          namespaced: true,
        },
      },
    });
  });

  it('Check summary overflow values USD', () => {
    const wrapper = shallowMount(TxSummary, { store, localVue });

    const amountUSD = Big(state.amountToTransfer.toBTCString())
      .mul(Big(state.bitcoinPrice))
      .toFixed(2);

    const feeUSD = Big(state.calculatedFees.average.toBTCString())
      .mul(Big(state.bitcoinPrice))
      .toFixed(2);

    const totalUSD = Big(feeUSD).plus(Big(amountUSD))
      .toFixed(2);

    expect(wrapper.find('#amount-usd').text()).to.eql(`USD $ ${amountUSD}`);
    expect(wrapper.find('#fee-usd').text()).to.eql(`USD $ ${feeUSD}`);
    expect(wrapper.find('#total-usd').text()).to.eql(`USD $ ${totalUSD}`);
  });
});
