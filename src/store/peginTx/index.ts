import { Module } from 'vuex';
import { getters } from './getters';
import { actions } from './actions';
import { mutations } from './mutations';
import { PegInTxState } from './types';
import { RootState } from '../types';

export const state: PegInTxState = {
  peginConfiguration: undefined,
  sessionId: '',
  utxoList: undefined,
  addressList: undefined,
  trezorConnected: false,
};

const namespaced = true;

export const pegInTx: Module<PegInTxState, RootState> = {
  namespaced,
  state,
  getters,
  actions,
  mutations,
};
