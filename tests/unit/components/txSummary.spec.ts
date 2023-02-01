import { createLocalVue, shallowMount } from '@vue/test-utils';
import Big from 'big.js';
import Vuex from 'vuex';
import Vuetify from 'vuetify';
import TxSummary from '@/components/exchange/TxSummary.vue';
import SatoshiBig from '@/types/SatoshiBig';
import * as constants from '@/store/constants';
import { EnvironmentAccessorService } from '@/services/enviroment-accessor.service';
import sinon from 'sinon';
import { pegOutTx } from '@/store/pegoutTx';
import { status } from '@/store/status';
import { PegoutStatus, PegOutTxState, TxStatus, TxStatusType, WeiBig } from '@/types';

const localVue = createLocalVue();
let vuetify:any;

describe('TxSummary', () => {
  const defaultEnvironmentVariables = {
    vueAppCoin: constants.BTC_NETWORK_TESTNET,
  };
  beforeEach(() => {
    vuetify = new Vuetify();
    EnvironmentAccessorService.initializeEnvironmentVariables(defaultEnvironmentVariables);
  });
  afterEach(() => {
    sinon.restore();
  });

  localVue.use(Vuex);
  const state = {
    peginConfiguration: {
      minValue: 100000000,
      maxValue: 500000,
      federationAddress: '2MsfB93EYBK357huTNQHxiFLSiV7fHvB3Q4',
      btcConfirmations: 100,
      sessionId: 'gdgd34ttrge4teteette43drdgdgjmmh',
    },
    sessionId: 'gdgd34ttrge4teteette43drdgdgjmmh',
    utxoList: undefined,
    addressList: [
      {
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
    statusInfo: {
      txId: '0x626aa59df0ddd31b3cd42612df7885213693f5ff0364ee88ed2eae87abce30a5',
    },
  };

  const pegOutTxState: PegOutTxState = {
    btcEstimatedFee: new SatoshiBig(0, 'satoshi'),
    gas: 0,
    amountToTransfer: new WeiBig(200000, 'wei'),
    calculatedFees: {
      average: new WeiBig(0, 'gwei'),
      fast: new WeiBig(0, 'gwei'),
      slow: new WeiBig(0, 'gwei'),
    },
    estimatedBTCToRecieve: new SatoshiBig(0, 'satoshi'),
    pegoutConfiguration: {
      minValue: new WeiBig(0, 'wei'),
      maxValue: new WeiBig(0, 'wei'),
      bridgeContractAddress: 'bridgeAddress',
    },
    selectedFee: constants.BITCOIN_AVERAGE_FEE_LEVEL,
    validAmount: true
  };

  const mockedStatus = {
    type: TxStatusType.PEGOUT,
    txDetails: {
      originatingRskTxHash: 'originatingTxhash',
      rskTxHash: 'rskTxHash',
      rskSenderAddress: 'testSenderAddress',
      btcRecipientAddress: 'testBtcRecipientAddress',
      valueRequestedInSatoshis: 50000000,
      valueInSatoshisToBeReceived: 450000000,
      feeInSatoshisToBePaid: 50000,
      status: PegoutStatus.RECEIVED,
      btcRawTransaction: 'testRawTx',
      fees: 0,
    },
  };

  const getters = {
    [constants.PEGIN_TX_GET_REFUND_ADDRESS]: () => 'n2y1xQBv3cqmRPke7QBWy52F91ZdgrYUgh',
    [constants.PEGIN_TX_GET_SAFE_TX_FEE]: () => state.calculatedFees.average,
    [constants.PEGIN_TX_GET_STATUS_TX_ID]: () => state.statusInfo.txId,
  };
  const store = new Vuex.Store({
    modules: {
      pegInTx: {
        state,
        getters,
        namespaced: true,
      },
      pegOutTx: {
        state: pegOutTxState,
        getters: pegOutTx.getters,
        actions: pegOutTx.actions,
        mutations: pegOutTx.mutations,
        namespaced: true,
      },
      status: {
        state: mockedStatus,
        getters: status.getters,
        actions: status.actions,
        mutations: status.mutations,
      },
    },
  });

  it('Check summary overflow values USD', () => {
    const wrapper = shallowMount(TxSummary, {
      store,
      localVue,
      vuetify,
      propsData: {
        type: 'PEGIN',
        orientation: 'HORIZONTAL',
      },
    });

    const amountUSD = Big(state.amountToTransfer.toBTCString())
      .mul(Big(state.bitcoinPrice))
      .toFixed(2);

    const feeUSD = Big(state.calculatedFees.average.toBTCString())
      .mul(Big(state.bitcoinPrice))
      .toFixed(2);

    const totalUSD = Big(feeUSD).plus(Big(amountUSD))
      .toFixed(2);
    expect(wrapper.find('#amount-usd').text()).toEqual(`USD $ ${amountUSD}`);
    expect(wrapper.find('#fee-usd').text()).toEqual(`USD $ ${feeUSD}`);
    expect(wrapper.find('#total-usd').text()).toEqual(`USD $ ${totalUSD}`);
  });

  it('shows properly the pegout info in pegout flow', () => {
    const wrapper = shallowMount(TxSummary, {
      store,
      localVue,
      vuetify,
      propsData: {
        type: 'PEGOUT',
        orientation: 'HORIZONTAL',
      },
    });
    expect(wrapper.find('#amount').text()).toEqual(`${pegOutTxState.amountToTransfer.toRBTCTrimmedString()} TRBTC`);
  });
  // it('shows properly the pegout info from API', () => {
  //   const wrapper = shallowMount(TxSummary, {
  //     store,
  //     localVue,
  //     vuetify,
  //     propsData: {
  //       type: 'PEGOUT',
  //       orientation: 'HORIZONTAL',
  //     },
  //   });
  //   const amount = new SatoshiBig(mockedStatus.txDetails.valueRequestedInSatoshis, 'satoshi');
  //   expect(wrapper.find('#amount').text()).toEqual(`${amount.toBTCTrimmedString()} TRBTC`);
  // });
});
