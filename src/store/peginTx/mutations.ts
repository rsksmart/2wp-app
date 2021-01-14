import { MutationTree } from 'vuex';
import * as constants from '@/store/constants';
import { PegInTxState, WalletAddress } from './types';

export const mutations: MutationTree<PegInTxState> = {
  [constants.PEGIN_TX_SET_ADDRESS_LIST]: (state, addressList: WalletAddress[]) => {
    state.addressList = addressList;
  },
};
