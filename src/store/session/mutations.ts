import { MutationTree } from 'vuex';
import Web3 from 'web3';
import * as constants from '@/store/constants';
import { TransactionType, SessionState } from '../../types/session';

export const mutations: MutationTree<SessionState> = {
  [constants.SESSION_SET_ACCOUNT]: (state, account: string) => {
    state.account = account;
  },
  [constants.SESSION_SET_WEB3_INSTANCE]: (state, web3Instance: Web3) => {
    state.web3 = web3Instance;
  },
  [constants.SESSION_IS_ENABLED]: (state, flag: boolean) => {
    state.enabled = flag;
  },
  [constants.SESSION_SET_RLOGIN]: (state, rLogin) => {
    state.rLogin = rLogin;
  },
  [constants.SESSION_SET_RLOGIN_INSTANCE]: (state, rLoginInstance) => {
    state.rLoginInstance = rLoginInstance;
  },
  [constants.SESSION_CLOSE_RLOGIN]: async (state) => {
    // eslint-disable-next-line no-unused-expressions
    await state.rLogin?.disconnect();
  },
  [constants.SESSION_SET_TX_TYPE]: (state, txType: TransactionType) => {
    state.txType = txType;
  },
};
