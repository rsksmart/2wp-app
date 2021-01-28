import { MutationTree } from 'vuex';
import * as constants from '@/store/constants';
import { PegInTxState, Utxo, WalletAddress } from './types';

export const mutations: MutationTree<PegInTxState> = {
  [constants.PEGIN_TX_SET_ADDRESS_LIST]: (state, addressList: WalletAddress[]) => {
    state.addressList = addressList;
  },
  [constants.PEGIN_TX_SET_UTXO_LIST]: (state, utxoList: Utxo[]) => {
    state.utxoList = utxoList;
  },
  [constants.PEGIN_TX_SET_TREZOR_CONNECTED]: (state, trezorConnected: boolean) => {
    state.trezorConnected = trezorConnected;
  },
};
