import { Module } from 'vuex';
import { ViewState, RootState } from '@/common/types';
import { actions } from './actions';
import { mutations } from './mutations';
import { getters } from './getters';

export const state: ViewState = {
  currentView: '',
};

const namespaced = true;

export const view: Module<ViewState, RootState> = {
  namespaced,
  state,
  mutations,
  actions,
  getters,
};
