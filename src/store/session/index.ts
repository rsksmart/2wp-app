import { Module } from 'vuex';
import { SessionState, RootState, WeiBig } from '@/types';
import { getters } from './getters';
import { actions } from './actions';
import { mutations } from './mutations';

export const state: SessionState = {
  account: undefined,
  web3: undefined,
  enabled: false,
  rLogin: undefined,
  rLoginInstance: undefined,
  txType: undefined,
  balance: new WeiBig('0', 'wei'),
};

const namespaced = true;

export const web3Session: Module<SessionState, RootState> = {
  namespaced,
  state,
  getters,
  actions,
  mutations,
};
