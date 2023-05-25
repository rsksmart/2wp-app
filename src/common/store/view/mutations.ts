import { MutationTree } from 'vuex';
import * as constants from '@/common/store/constants';
import { ViewState } from '@/common/types';

export const mutations: MutationTree<ViewState> = {
  [constants.VIEW_SET_CURRENT_VIEW]: (state, view: string) => {
    state.currentView = view;
  },
};
