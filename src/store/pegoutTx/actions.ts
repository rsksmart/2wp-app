import { ActionTree } from 'vuex';
import { MiningSpeedFee, PegOutTxState, RootState } from '@/types';
import * as constants from '@/store/constants';
import Big from 'big.js';

export const actions: ActionTree<PegOutTxState, RootState> = {
  [constants.PEGOUT_TX_SELECT_FEE_LEVEL]: ({ commit }, feeLevel: MiningSpeedFee) => {
    commit(constants.PEGOUT_TX_SET_SELECTED_FEE_LEVEL, feeLevel);
  },
  [constants.PEGOUT_TX_ADD_AMOUNT]: ({ commit }, amountToTransfer: Big) => {
    commit(constants.PEGOUT_TX_SET_AMOUNT, amountToTransfer);
  },
};
