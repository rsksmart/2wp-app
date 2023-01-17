import { MutationTree } from 'vuex';
import * as constants from '@/store/constants';
import {
  MiningSpeedFee, PegoutConfiguration, PegOutTxState, SatoshiBig, WeiBig,
} from '@/types';

export const mutations: MutationTree<PegOutTxState> = {
  [constants.PEGOUT_TX_SET_SELECTED_FEE_LEVEL]: (state, feeLevel: MiningSpeedFee) => {
    state.selectedFee = feeLevel;
  },
  [constants.PEGOUT_TX_SET_RSK_ESTIMATED_FEE]: (state, calculatedFees: {
    fast: WeiBig;
    average: WeiBig;
    slow: WeiBig;
  }) => {
    state.calculatedFees = calculatedFees;
  },
  [constants.PEGOUT_TX_SET_BTC_ESTIMATED_FEE]: (state, fee: SatoshiBig) => {
    state.btcEstimatedFee = fee;
  },
  [constants.PEGOUT_TX_SET_AMOUNT]: (state, amountToTransfer: WeiBig) => {
    state.amountToTransfer = amountToTransfer;
  },
  [constants.PEGOUT_TX_SET_VALID_AMOUNT]: (state, validAmount: boolean) => {
    state.validAmount = validAmount;
  },
  [constants.PEGOUT_TX_SET_TX_HASH]: (state, txHash: string) => {
    state.txHash = txHash;
  },
  [constants.PEGOUT_TX_SET_PEGOUT_CONFIGURATION]:
  (state, pegoutConfiguration: PegoutConfiguration) => {
    state.pegoutConfiguration = pegoutConfiguration;
  },
};
