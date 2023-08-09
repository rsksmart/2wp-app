import { Module } from 'vuex';
import moment from 'moment';
import {
  RootState, SatoshiBig, TxStatus, TxStatusType,
} from '@/common/types';
import { mutations } from './mutations';
import { actions } from './actions';
import { getters } from './getters';

export const state: TxStatus = {
  pegOutEstimatedFee: new SatoshiBig('0', 'satoshi'),
  txDetails: undefined,
  type: TxStatusType.UNSET_STATUS,
  estimatedReleaseTimeInMinutes: moment.duration(0, 'minutes'),
};

const namespaced = true;

export const status: Module<TxStatus, RootState> = {
  namespaced,
  state,
  actions,
  getters,
  mutations,
};
