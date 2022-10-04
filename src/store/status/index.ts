import { Module } from 'vuex';
import { StatusState, RootState } from '@/types';
import { mutations } from './mutations';
import { actions } from './actions';
import { getters } from './getters';

export const state: StatusState = {
  statusMessage: '',
  activeMessageStyle: '',
  isRejected: false,
  error: false,
  errorMessage: '',
  txStatus: undefined
};

const namespaced = true;

export const view: Module<StatusState, RootState> = {
  namespaced,
  state,
  actions,
  getters,
  mutations
};
