import { ActionTree } from 'vuex';
import * as constants from '@/store/constants';
import {
  PeginConfiguration, PegInTxState, Utxo, WalletAddress,
} from './types';
import { RootState } from '../types';

export const actions: ActionTree<PegInTxState, RootState> = {
  [constants.PEGIN_TX_ADD_ADDRESSES]: ({ commit }, addressList: WalletAddress[]) => {
    commit(constants.PEGIN_TX_SET_ADDRESS_LIST, addressList);
  },
  [constants.PEGIN_TX_ADD_UTXOS]: ({ commit }, utxoList: Utxo[]) => {
    commit(constants.PEGIN_TX_SET_UTXO_LIST, { utxoList });
  },
  [constants.IS_TREZOR_CONNECTED]: ({ commit }, trezorConnected: boolean) => {
    commit(constants.PEGIN_TX_SET_TREZOR_CONNECTED, trezorConnected);
  },
  [constants.PEGIN_TX_ADD_PEGIN_CONFIGURATION]: ({ commit },
    peginConfiguration: PeginConfiguration) => {
    commit(constants.PEGIN_TX_SET_PEGIN_CONFIGURATION, peginConfiguration);
  },
  [constants.PEGIN_TX_ADD_SESSION_ID]: ({ commit }, sessionId: string) => {
    commit(constants.PEGIN_TX_SET_SESSION_ID, sessionId);
  },
};
