import { MutationTree } from 'vuex';
import { MiningSpeedFee, PegOutTxState, WeiBig } from '@/types';
import * as constants from '@/store/constants';

export const mutations: MutationTree<PegOutTxState> = {
  [constants.PEGOUT_TX_SET_SELECTED_FEE_LEVEL]: (state, feeLevel: MiningSpeedFee) => {
    state.selectedFee = feeLevel;
  },
  [constants.PEGOUT_TX_SET_AMOUNT]: (state, amountToTransfer: WeiBig) => {
    state.amountToTransfer = amountToTransfer;
  },
  [constants.PEGOUT_TX_SET_VALID_AMOUNT]: (state, validAmount: boolean) => {
    state.validAmount = validAmount;
  },
};
