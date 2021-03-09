import { MutationTree } from 'vuex';
import * as constants from '@/store/constants';
import { Web3SessionState } from './types';

export const mutations: MutationTree<Web3SessionState> = {
  [constants.SESSION_SET_ACCOUNT]: (state, account: string) => {
    state.account = account;
  },
  [constants.SESSION_SET_WEB3_INSTANCE]: (state, web3Instance: object) => {
    state.web3 = web3Instance;
  },
  [constants.SESSION_IS_ENABLED]: (state, flag: boolean) => {
    state.enabled = flag;
  },
};
