import { ActionTree } from 'vuex';
import { ViewState, RootState } from '@/common/types';
import * as constants from '@/common/store/constants';

export const actions: ActionTree<ViewState, RootState> = {
  [constants.VIEW_ADD_CURRENT_VIEW]: ({ commit }, view: string): void => {
    commit(constants.VIEW_SET_CURRENT_VIEW, view);
  },
};
