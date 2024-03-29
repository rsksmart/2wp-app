import { Module } from 'vuex';
import { PegOutTxState, RootState } from '@/common/types';
import { getClearPegoutTxState } from '@/common/utils/common';
import { getters } from './getters';
import { actions } from './actions';
import { mutations } from './mutations';

export const state: PegOutTxState = getClearPegoutTxState();

const namespaced = true;

export const pegOutTx: Module<PegOutTxState, RootState> = {
  namespaced,
  state,
  getters,
  actions,
  mutations,
};
