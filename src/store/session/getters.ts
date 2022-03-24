import { GetterTree } from 'vuex';
import * as constants from '@/store/constants';
import { SessionState } from './types';
import { RootState } from '@/types';

export const getters: GetterTree<SessionState, RootState> = {
  [constants.SESSION_IN_TX_FLOW]: (state): boolean => state.txType !== undefined,
};
