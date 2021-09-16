import { Module } from 'vuex';
import { actions } from './actions';
import { mutations } from './mutations';
import { Web3SessionState } from './types';
import { RootState } from '../types';

export const state: Web3SessionState = {
  account: undefined,
  web3: undefined,
  enabled: false,
  rLogin: undefined,
  rLoginInstance: undefined,
};

const namespaced = true;

export const web3Session: Module<Web3SessionState, RootState> = {
  namespaced,
  state,
  actions,
  mutations,
};
