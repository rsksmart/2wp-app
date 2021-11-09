import { MutationTree } from 'vuex';
import * as constants from '@/store/constants';
import {
  PeginConfiguration, PegInTxState, Utxo, WalletAddress,
} from './types';

export const mutations: MutationTree<PegInTxState> = {
  [constants.PEGIN_TX_SET_ADDRESS_LIST]: (state, addressList: WalletAddress[]) => {
    state.addressList = state.addressList ? [...state.addressList, ...addressList] : addressList;
  },
  [constants.PEGIN_TX_SET_UTXO_LIST]: (state, utxoList: Utxo[]) => {
    state.utxoList = utxoList;
  },
  [constants.PEGIN_TX_SET_TREZOR_CONNECTED]: (state, trezorConnected: boolean) => {
    state.trezorConnected = trezorConnected;
  },
  [constants.PEGIN_TX_SET_SESSION_ID]: (state, sessionId: string) => {
    state.sessionId = sessionId;
  },
  [constants.PEGIN_TX_SET_PEGIN_CONFIGURATION]: (state, peginConfiguration: PeginConfiguration) => {
    state.peginConfiguration = peginConfiguration;
  },
  [constants.PEGIN_TX_SET_BITCOIN_WALLET]: (state, bitcoinWallet: string) => {
    state.bitcoinWallet = bitcoinWallet;
  },
  [constants.PEGIN_TX_SET_BITCOIN_PRICE]: (state, btcPrice: number) => {
    state.bitcoinPrice = btcPrice;
  },
  [constants.PEGIN_TX_CLEAR]: (state) => {
    Object.assign(state, constants.CLEAR_PEGIN_TX_STATE);
  },
};
