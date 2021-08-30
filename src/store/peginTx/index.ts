import { Module } from 'vuex';
import { getters } from './getters';
import { actions } from './actions';
import { mutations } from './mutations';
import { PegInTxState } from './types';
import { RootState } from '../types';

export const state: PegInTxState = {
  peginConfiguration: {
    minValue: 0,
    maxValue: 0,
    federationAddress: '',
    btcConfirmations: 100,
    rskConfirmations: 100,
  },
  sessionId: '',
  utxoList: undefined,
  addressList: undefined,
  trezorConnected: false,
  bitcoinWallet: '',
  bitcoinPrice: 0,
};

const namespaced = true;

export const pegInTx: Module<PegInTxState, RootState> = {
  namespaced,
  state,
  getters,
  actions,
  mutations,
};
