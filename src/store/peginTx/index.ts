import { Module } from 'vuex';
import { getters } from './getters';
import { actions } from './actions';
import { mutations } from './mutations';
import { PegInTxState } from './types';
import { RootState } from '../types';
import * as constants from '@/store/constants';

export const state: PegInTxState = constants.CLEAR_PEGIN_TX_STATE;

const namespaced = true;

export const pegInTx: Module<PegInTxState, RootState> = {
  namespaced,
  state,
  getters,
  actions,
  mutations,
};
