import { Module } from 'vuex';
import { getters } from './getters';
import { actions } from './actions';
import { mutations } from './mutations';
import { SessionState } from './types';
import { RootState } from '../../types/store';

export const state: SessionState = {
  account: undefined,
  web3: undefined,
  enabled: false,
  rLogin: undefined,
  rLoginInstance: undefined,
  txType: undefined,
};

const namespaced = true;

export const web3Session: Module<SessionState, RootState> = {
  namespaced,
  state,
  getters,
  actions,
  mutations,
};
