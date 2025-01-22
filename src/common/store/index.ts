import { createStore, StoreOptions } from 'vuex';
import { RootState } from '@/common/types';
import { status } from '@/status/store';
import { pegInTx } from '@/pegin/store/PeginTx';
import { flyoverPegin } from '@/pegin/store/FlyoverPegin';
import { pegOutTx } from '@/pegout/store/pegoutTx';
import { flyoverPegout } from '@/pegout/store/FlyoverPegout';
import { web3Session } from './session';
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
    status,
    pegOutTx,
    flyoverPegout,
    flyoverPegin,
  },
};

export default createStore(store);
