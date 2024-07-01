import { Module } from 'vuex';
import { FlyoverPeginState, RootState } from '@/common/types';
import { getClearFlyoverPeginState } from '@/common/utils/common';
import { getters } from './getters';
import { actions } from './actions';
import { mutations } from './mutations';

export const state: FlyoverPeginState = getClearFlyoverPeginState();

const namespaced = true;

export const flyoverPegin: Module<FlyoverPeginState, RootState> = {
  namespaced,
  state,
  getters,
  actions,
  mutations,
};
