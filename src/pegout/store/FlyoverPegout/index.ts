import { Module } from 'vuex';
import { FlyoverPegoutState, RootState } from '@/common/types';
import { getClearFlyoverPegoutState } from '@/common/utils/common';
import { getters } from './getters';
import { actions } from './actions';
import { mutations } from './mutations';

export const state: FlyoverPegoutState = getClearFlyoverPegoutState();

const namespaced = true;

export const flyoverPegout: Module<FlyoverPegoutState, RootState> = {
  namespaced,
  state,
  getters,
  actions,
  mutations,
};
