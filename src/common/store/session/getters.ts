import { GetterTree } from 'vuex';
import * as constants from '@/common/store/constants';
import { SessionState } from '@/common/types/session';
import { RootState } from '@/common/types/store';

export const getters: GetterTree<SessionState, RootState> = {
  [constants.SESSION_IN_TX_FLOW]: (state): boolean => state.txType !== undefined,
  [constants.SESSION_IS_ACCOUNT_CONNECTED]: (state): boolean => state.account !== undefined,
  [constants.SESSION_IS_LEDGER_CONNECTED]: (state): boolean => !!(state.rLogin?.provider.isLedger),
  [constants.SESSION_IS_TREZOR_CONNECTED]: (state): boolean => !!(state.rLogin?.provider.isTrezor),
  [constants.SESSION_IS_METAMASK_CONNECTED]:
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (state): boolean => (state.rLoginInstance as any).providerController?.injectedProvider.name
    === constants.RLOGIN_METAMASK_WALLET,
};
