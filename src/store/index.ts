import Vue from 'vue';
import Vuex, { StoreOptions } from 'vuex';
import { RootState } from '../types/store';
import { pegInTx } from './peginTx';
import { web3Session } from './session';

Vue.use(Vuex);

const store: StoreOptions<RootState> = {
  state: {
    version: '1.0.0', // a simple property
  },
  modules: {
    pegInTx,
    web3Session,
  },
};

export default new Vuex.Store<RootState>(store);
