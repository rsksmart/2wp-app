import { Module } from 'vuex';
import { getters } from './getters';
import { actions } from './actions';
import { mutations } from './mutations';
import { txSummaryState } from './types';
import { RootState } from '../types';
import * as constants from '@/store/constants';

export const state: txSummaryState = constants.getClearTxSummaryState();

const namespaced = true;

export const txSummary: Module<txSummaryState, RootState> = {
  namespaced,
  state,
  getters,
  actions,
  mutations
};
