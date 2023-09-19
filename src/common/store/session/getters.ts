import { GetterTree } from 'vuex';
import * as constants from '@/common/store/constants';
import { SessionState } from '@/common/types/session';
import { RootState } from '@/common/types/store';

export const getters: GetterTree<SessionState, RootState> = {
  [constants.SESSION_IN_TX_FLOW]: (state): boolean => state.txType !== undefined,
  [constants.SESSION_IS_LEDGER_CONNECTED]: (state): boolean =>
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    // eslint-disable-next-line implicit-arrow-linebreak
    !!(state.rLogin?.provider.isLedger)
  ,
};
