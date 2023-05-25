import { GetterTree } from 'vuex';
import * as constants from '@/common/store/constants';
import { ViewState, RootState } from '@/common/types';

export const getters: GetterTree<ViewState, RootState> = {
  [constants.VIEW_GET_CURRENT_VIEW]: (state) => state.currentView,
};
