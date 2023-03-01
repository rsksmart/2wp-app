import { Module } from 'vuex';
import {
  RootState, SatoshiBig, TxStatus, TxStatusType,
} from '@/types';
import { mutations } from './mutations';
import { actions } from './actions';
import { getters } from './getters';

export const state: TxStatus = {
  pegOutEstimatedFee: new SatoshiBig('0', 'satoshi'),
  txDetails: undefined,
  type: TxStatusType.UNSET_STATUS,
};

const namespaced = true;

export const status: Module<TxStatus, RootState> = {
  namespaced,
  state,
  actions,
  getters,
  mutations,
};
