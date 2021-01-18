import { ActionTree } from 'vuex';
import * as constants from '@/store/constants';
import { PegInTxState, Utxo, WalletAddress } from './types';
import { RootState } from '../types';

export const actions: ActionTree<PegInTxState, RootState> = {
  [constants.PEGIN_TX_ADD_ADDRESSES]: ({ commit }, addressList: WalletAddress[]) => {
    commit(constants.PEGIN_TX_SET_ADDRESS_LIST, { addressList });
  },
  [constants.PEGIN_TX_ADD_UTXOS]: ({ commit }, utxoList: Utxo[]) => {
    commit(constants.PEGIN_TX_SET_UTXO_LIST, { utxoList });
  },
};
