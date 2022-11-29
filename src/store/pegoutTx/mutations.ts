import { MutationTree } from 'vuex';
import { MiningSpeedFee, PegOutTxState } from '@/types';
import * as constants from '@/store/constants';

export const mutations: MutationTree<PegOutTxState> = {
  [constants.PEGOUT_TX_SET_SELECTED_FEE_LEVEL]: (state, feeLevel: MiningSpeedFee) => {
    state.selectedFee = feeLevel;
  },
};
