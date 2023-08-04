import { createStore, StoreOptions } from 'vuex';
import { RootState } from '@/common/types';
// import { pegInTx } from '@/pegin/store/peginTx';
// import { web3Session } from './session';
// import { view } from './view';
// import { status } from '@/status/store/status';
// import { pegOutTx } from '@/pegout/store/pegoutTx';
import { version } from '../../../package.json';

const store: StoreOptions<RootState> = {
  state: {
    version: version || '0',
  },
  getters: {
    appVersion: (state) => state.version,
  },
  // modules: {
  //   pegInTx,
  //   web3Session,
  //   view,
  //   status,
  //   pegOutTx,
  // },
};

export default createStore(store);
