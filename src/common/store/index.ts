import { createStore, StoreOptions } from 'vuex';
import { RootState } from '@/common/types';
import { status } from '@/status/store';
import { pegInTx } from '@/pegin/store';
import { web3Session } from './session';
import { view } from './view';
// import { pegOutTx } from '@/pegout/store/pegoutTx';
import { version } from '../../../package.json';

const store: StoreOptions<RootState> = {
  state: {
    version: version || '0',
  },
  getters: {
    appVersion: (state) => state.version,
  },
  modules: {
    pegInTx,
    web3Session,
    view,
    status,
  //   pegOutTx,
  },
};

export default createStore(store);