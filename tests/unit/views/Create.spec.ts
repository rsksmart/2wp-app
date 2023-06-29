import { createLocalVue, shallowMount, Wrapper } from '@vue/test-utils';
import Vuex, { Store } from 'vuex';
import Vuetify from 'vuetify';
import Create from '@/pegin/views/Create.vue';
import * as constants from '@/common/store/constants';
import {
  PegInTxState, RootState, SatoshiBig, SessionState, WeiBig,
} from '@/common/types';
import { EnvironmentAccessorService } from '@/common/services/enviroment-accessor.service';
import { pegInTx } from '@/pegin/store/peginTx';
import { pegOutTx } from '@/pegout/store/pegoutTx';

const localVue = createLocalVue();
let vuetify: typeof Vuetify;
let state: Partial<PegInTxState>;
let store: Store<RootState>;
let sessionState: SessionState;

describe('Create component', () => {
  const defaultEnvironmentVariables = {
    vueAppCoin: constants.BTC_NETWORK_TESTNET,
  };
  beforeEach(() => {
    vuetify = new Vuetify();
    EnvironmentAccessorService.initializeEnvironmentVariables(
      defaultEnvironmentVariables,
    );
    localVue.use(Vuex);
    state = {
      balances: {
        segwit: new SatoshiBig('', 'satoshi'),
        nativeSegwit: new SatoshiBig('', 'satoshi'),
        legacy: new SatoshiBig('', 'satoshi'),
      },
      loadingBalance: false,
      trezorConnected: false,
      peginConfiguration: {
        minValue: 0,
        maxValue: 1,
        federationAddress: '',
        sessionId: '',
      },
      sessionId: '',
      bitcoinPrice: 2000,
      calculatedFees: {
        slow: { amount: new SatoshiBig('0.00001', 'btc'), enoughBalance: true },
        average: { amount: new SatoshiBig('0.00001', 'btc'), enoughBalance: true },
        fast: { amount: new SatoshiBig('0.00001', 'btc'), enoughBalance: true },
      },
      loadingFee: false,
      selectedFee: 'BITCOIN_AVERAGE_FEE_LEVEL',
      amountToTransfer: new SatoshiBig('0.1', 'btc'),
      isValidAmountToTransfer: true,
      walletDataReady: true,
      currentView: '',
      statusInfo: {
        txId: '',
        refundAddress: '',
        safeFee: new SatoshiBig('0.00001', 'btc'),
      },
    };
    sessionState = {
      btcDerivedAddress: '',
      balance: new WeiBig('0.5', 'rbtc'),
      enabled: false,
      txType: 'PEG_IN_TRANSACTION_TYPE',
      bitcoinPrice: 0,
    };
    const { getters, actions, mutations } = pegInTx;
    store = new Vuex.Store({
      modules: {
        pegInTx: {
          state,
          getters,
          actions,
          mutations,
          namespaced: true,
        },
        pegOutTx,
        web3Session: {
          state: sessionState,
          namespaced: true,
        },
      },
    });
  });

  it('should call the necessary actions and navigate to Home on back event', () => {
    const push = jest.fn();
    const $router = {
      push,
    };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const wrapper: Wrapper<Create & {[key: string]: any}> = shallowMount(Create, {
      store,
      localVue,
      vuetify,
      mocks: {
        $router,
      },
    });
    const { vm } = wrapper;
    vm.clear = jest.fn();
    vm.init = jest.fn();
    vm.initPegin = jest.fn();
    vm.back();
    expect(vm.clear).toHaveBeenCalled();
    expect(vm.init).toHaveBeenCalled();
    expect(vm.initPegin).toHaveBeenCalled();
  });
});
