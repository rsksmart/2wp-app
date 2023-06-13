import PegOut from '@/pegout/views/PegOut.vue';
import { createLocalVue, mount } from '@vue/test-utils';
import Vuex, { Store } from 'vuex';
import Vuetify from 'vuetify';
import {
  PegOutTxState, RootState, SatoshiBig, SessionState,
} from '@/common/types';
import * as constants from '@/common/store/constants';
import { EnvironmentAccessorService } from '@/common/services/enviroment-accessor.service';
import { pegOutTx } from '@/pegout/store/pegoutTx';
import WeiBig from '@/common/types/WeiBig';
import PegOutForm from '@/pegout/components/PegOutForm.vue';

const localVue = createLocalVue();
let vuetify: any;
let store: Store<RootState>;
let state: PegOutTxState;
let sessionState: SessionState;

describe('PegOut view', () => {
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
      amountToTransfer: new WeiBig(0, 'wei'),
      validAmount: false,
      calculatedFee: new WeiBig('30000', 'wei'),
      pegoutConfiguration: {
        minValue: new WeiBig('50000000', 'gwei'),
        maxValue: new WeiBig('1', 'rbtc'),
        bridgeContractAddress: '',
      },
      selectedFee: constants.BITCOIN_AVERAGE_FEE_LEVEL,
      estimatedBTCToRecieve: new SatoshiBig(0.004, 'btc'),
      gas: 20000,
      bitcoinPrice: 40537,
      btcEstimatedFee: new SatoshiBig(0, 'satoshi'),
    };
    sessionState = {
      btcDerivedAddress: '',
      balance: new WeiBig('0.5', 'rbtc'),
      enabled: false,
      txType: 'PEG_OUT_TRANSACTION_TYPE',
      bitcoinPrice: 0,
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
        web3Session: {
          state: sessionState,
          namespaced: true,
        },
      },
    });
  });

  it('should initially render the PegOutForm component', () => {
    const wrapper = mount(PegOut, {
      store,
      localVue,
      vuetify,
    });
    expect((wrapper.vm as any).currentComponent).toBe('PegOutForm');
  });

  it('should render the Confirmation component on page change', async () => {
    const wrapper = mount(PegOut, {
      store,
      localVue,
      vuetify,
    });
    const childWrapper = wrapper.findComponent(PegOutForm);
    childWrapper.vm.$emit('changePage', 'Confirmation');
    expect(childWrapper.emitted('changePage')).toBeTruthy();
    expect((wrapper.vm as any).currentComponent).toBe('Confirmation');
  });
});
