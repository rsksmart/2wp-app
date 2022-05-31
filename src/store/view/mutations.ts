import { MutationTree } from 'vuex';
import * as constants from '@/store/constants';
import { ViewState } from '@/types';

export const mutations: MutationTree<ViewState> = {
  [constants.VIEW_SET_CURRENT_VIEW]: (state, view: string) => {
    state.currentView = view;
  },
};
