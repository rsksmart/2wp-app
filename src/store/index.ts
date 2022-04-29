import Vue from 'vue';
import Vuex, { StoreOptions } from 'vuex';
import { RootState } from '../types/store';
import { pegInTx } from './peginTx';
import { web3Session } from './session';
import { version } from '../../package.json';

Vue.use(Vuex);

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
  },
};

export default new Vuex.Store<RootState>(store);
