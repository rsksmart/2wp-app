import { Module } from 'vuex';
import { PegInTxState, RootState } from '@/common/types';
import { getClearPeginTxState } from '@/common/utils/common';
import { getters } from './getters';
import { actions } from './actions';
import { mutations } from './mutations';

export const state: PegInTxState = getClearPeginTxState();

const namespaced = true;

export const pegInTx: Module<PegInTxState, RootState> = {
  namespaced,
  state,
  getters,
  actions,
  mutations,
};
