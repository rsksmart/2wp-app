import { GetterTree } from 'vuex';
import * as constants from '@/store/constants';
import { SessionState } from './types';
import { RootState } from '../types';

export const getters: GetterTree<SessionState, RootState> = {
  [constants.SESSION_CAN_PEG]: (state): boolean => state.peg !== undefined,
};
