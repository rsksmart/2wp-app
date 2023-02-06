import { Module } from 'vuex';
import { SessionState, RootState } from '@/types';
import { getClearSessionState } from '@/utils';
import { getters } from './getters';
import { actions } from './actions';
import { mutations } from './mutations';

export const state: SessionState = getClearSessionState();

const namespaced = true;

export const web3Session: Module<SessionState, RootState> = {
  namespaced,
  state,
  getters,
  actions,
  mutations,
};
