import { createStore, StoreOptions } from 'vuex';
import { RootState } from '@/common/types';
import { status } from '@/status/store';
import { pegInTx } from '@/pegin/store';
import { pegOutTx } from '@/pegout/store/pegoutTx';
import { flyoverPegout } from '@/pegout/store/FlyoverPegout';
import { web3Session } from './session';
import { view } from './view';
import pkg from '../../../package.json';

const store: StoreOptions<RootState> = {
  state: {
    version: pkg.version || '0',
  },
  getters: {
    appVersion: (state) => state.version,
  },
  modules: {
    pegInTx,
    web3Session,
    view,
    status,
    pegOutTx,
    flyoverPegout,
  },
};

export default createStore(store);
