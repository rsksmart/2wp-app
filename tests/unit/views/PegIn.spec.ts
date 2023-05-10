import PegIn from '@/views/PegIn.vue';
import { createLocalVue, shallowMount } from '@vue/test-utils';
import Vuex, { Store } from 'vuex';
import Vuetify from 'vuetify';
import {
  PegInTxState, RootState, SatoshiBig, SessionState, WeiBig,
} from '@/types';
import * as constants from '@/store/constants';
import { EnvironmentAccessorService } from '@/services/enviroment-accessor.service';
import { pegInTx } from '@/store/peginTx';
import SelectBitcoinWallet from '@/components/exchange/SelectBitcoinWallet.vue';
import BtcToRbtcDialog from '@/components/exchange/BtcToRbtcDialog.vue';

const localVue = createLocalVue();
let vuetify: any;
let store: Store<RootState>;
let state: Partial<PegInTxState>;
let sessionState: SessionState;

describe('PegIn view', () => {
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
        btcConfirmations: 100,
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
        web3Session: {
          state: sessionState,
          namespaced: true,
        },
      },
    });
  });

  it('should render SelectBitcoinWallet component', () => {
    const wrapper = shallowMount(PegIn, {
      store,
      localVue,
      vuetify,
    });
    const selectBitcoinWalletComponent = wrapper.findComponent(SelectBitcoinWallet);
    expect(selectBitcoinWalletComponent.exists()).toBeTruthy();
  });

  it('should render BtcToRbtcDialog component', () => {
    const wrapper = shallowMount(PegIn, {
      store,
      localVue,
      vuetify,
    });
    wrapper.setData({ showDialog: true });
    const btcToRbtcDialogComponent = wrapper.findComponent(BtcToRbtcDialog);
    expect((wrapper.vm as any).showDialog).toBe(true);
    expect(btcToRbtcDialogComponent.exists()).toBeTruthy();
  });
});
