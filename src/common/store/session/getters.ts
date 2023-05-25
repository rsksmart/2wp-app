import { GetterTree } from 'vuex';
import * as constants from '@/common/store/constants';
import { SessionState } from '../../types/session';
import { RootState } from '../../types/store';

export const getters: GetterTree<SessionState, RootState> = {
  [constants.SESSION_IN_TX_FLOW]: (state): boolean => state.txType !== undefined,
};
