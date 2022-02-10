import { Module } from 'vuex';


import { txSummaryState } from './types';
import { RootState } from '../types';
import * as constants from '@/store/constants';

export const state: txSummaryState = constants.getClearTxSummaryState();

export const pegInTx: Module<txSummaryState, RootState> = {
  state
};
