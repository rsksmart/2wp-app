import { GetterTree } from 'vuex';
import { PegOutTxState, RootState, WeiBig } from '@/types';
import * as constants from '@/store/constants';
import Big from 'big.js';

export const getters: GetterTree<PegOutTxState, RootState> = {
  [constants.PEGOUT_TX_GET_SAFE_TX_FEE]: (state): WeiBig => {
    let fee:WeiBig;
    switch (state.selectedFee) {
      case constants.BITCOIN_SLOW_FEE_LEVEL:
        fee = state.calculatedFees.slow;
        break;
      case constants.BITCOIN_FAST_FEE_LEVEL:
        fee = state.calculatedFees.fast;
        break;
      default:
        fee = state.calculatedFees.average;
        break;
    }
    return fee;
  },
  [constants.PEGOUT_TX_IS_ENOUGH_BALANCE]: (state: PegOutTxState, moduleGetters): boolean => {
    const feePlusAmount: Big = state.amountToTransfer
      .plus(moduleGetters[constants.PEGOUT_TX_GET_SAFE_TX_FEE]);
    if (state.amountToTransfer.lte('0')
      || feePlusAmount.gt(state.balance)
      || state.amountToTransfer.lt(state.minAmountToTransfer)
      || state.amountToTransfer.gt(state.maxAmountToTransfer)) {
      return false;
    }
    if (state.amountToTransfer.gt('0') && feePlusAmount.lte(state.balance)) {
      return true;
    }
    return true;
  },
};
