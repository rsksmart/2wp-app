import { GetterTree } from 'vuex';
import * as constants from '@/store/constants';
import { ViewState, RootState } from '@/types';

export const getters: GetterTree<ViewState, RootState> = {
  [constants.VIEW_GET_CURRENT_VIEW]: (state) => state.currentView,
};
