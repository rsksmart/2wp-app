import { Module } from 'vuex';
import { getters } from './getters';
import { actions } from './actions';
import { mutations } from './mutations';
import { PegInTxState, RootState } from '@/types';
import { getClearPeginTxState } from '@/utils/common';

export const state: PegInTxState = getClearPeginTxState();

const namespaced = true;

export const pegInTx: Module<PegInTxState, RootState> = {
  namespaced,
  state,
  getters,
  actions,
  mutations,
};
