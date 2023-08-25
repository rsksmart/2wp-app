import { Module } from 'vuex';
import { SessionState, RootState } from '@/common/types';
import { getClearSessionState } from '@/common/utils';
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