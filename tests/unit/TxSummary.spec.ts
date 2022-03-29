import { createLocalVue, shallowMount } from '@vue/test-utils';
import { expect } from 'chai';
import Big from 'big.js';
import Vuex from 'vuex';
import TxSummary from '@/components/exchange/TxSummary.vue';
import SatoshiBig from '@/types/SatoshiBig';
import { PegInTxState } from '@/store/peginTx/types';

const localVue = createLocalVue();

localVue.use(Vuex);

describe('TxSummary', () => {
  let state: PegInTxState;
  let store: any;
  const factory = (values = {}) => shallowMount(TxSummary, {
    propsData: { ...values },
    store,
    localVue,
  });
  beforeEach(() => {
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
    };

    store = new Vuex.Store({
      modules: {
        pegInTx: {
          state,
          namespaced: true,
        },
      },
    });
  });
  it('Check summary overflow values USD', () => {
    const testCases = [
      {
        txData: {
          amount: new SatoshiBig(500000, 'satoshi'),
          refundAddress: 'refundAddress',
          recipient: 'recipiendAddress',
          feeBTC: new SatoshiBig(338, 'satoshi'),
          change: 'ChangeAaddress',
        },
        price: 41671,
        txId: '',
        showTxId: false,
        initialExpand: false,
        rskFederationAddress: 'addr',
      },
      {
        txData: {
          amount: new SatoshiBig(196300000, 'satoshi'),
          refundAddress: 'refundAddress',
          recipient: 'recipiendAddress',
          feeBTC: new SatoshiBig(4338, 'satoshi'),
          change: 'ChangeAaddress',
        },
        price: 41671,
        txId: '',
        showTxId: false,
        initialExpand: false,
        rskFederationAddress: 'addr',
      },
      {
        txData: {
          amount: new SatoshiBig(38000000, 'satoshi'),
          refundAddress: 'refundAddress',
          recipient: 'recipiendAddress',
          feeBTC: new SatoshiBig(380, 'satoshi'),
          change: 'ChangeAaddress',
        },
        price: 41671,
        txId: '',
        showTxId: false,
        initialExpand: false,
        rskFederationAddress: 'addr',
      },
      {
        txData: {
          amount: new SatoshiBig(380000000, 'satoshi'),
          refundAddress: 'refundAddress',
          recipient: 'recipiendAddress',
          feeBTC: new SatoshiBig(383000, 'satoshi'),
          change: 'ChangeAaddress',
        },
        price: 41671,
        txId: '',
        showTxId: false,
        initialExpand: false,
        rskFederationAddress: 'addr',
      },
    ];
    testCases.forEach((txSummaryProps) => {
      const wrapper = factory(txSummaryProps);
      const amountUSD = Big(txSummaryProps.txData.amount.toBTCString())
        .mul(Big(state.bitcoinPrice))
        .toFixed(2);
      const feeUSD = Big(txSummaryProps.txData.feeBTC.toBTCString())
        .mul(Big(state.bitcoinPrice))
        .toFixed(2);
      const totalUSD = Big(feeUSD).plus(Big(amountUSD))
        .toFixed(2);
      expect(wrapper.find('#amount-usd').text()).to.eql(`USD $ ${amountUSD}`);
      expect(wrapper.find('#fee-usd').text()).to.eql(`USD $ ${feeUSD}`);
      expect(wrapper.find('#total-usd').text()).to.eql(`USD $ ${totalUSD}`);
    });
  });
});
