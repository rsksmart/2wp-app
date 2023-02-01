import { GetterTree } from 'vuex';
import { PegOutTxState, RootState, WeiBig } from '@/types';
import * as constants from '@/store/constants';

export const getters: GetterTree<PegOutTxState, RootState> = {
  [constants.PEGOUT_TX_GET_SAFE_TX_FEE]: (state:PegOutTxState): WeiBig => {
    let fee:WeiBig;
    if (state.efectivePaidFee) {
      fee = state.efectivePaidFee;
    } else {
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
    }
    return fee;
  },
  [constants.PEGOUT_TX_IS_ENOUGH_BALANCE]:
    (state: PegOutTxState, moduleGetters, rootState): boolean => {
      const { balance } = rootState.web3Session;
      const feePlusAmount: WeiBig = state.amountToTransfer
        .plus(moduleGetters[constants.PEGOUT_TX_GET_SAFE_TX_FEE]);
      if (state.amountToTransfer.lte('0')
      || feePlusAmount.gt(balance)
      || state.amountToTransfer.lt(state.pegoutConfiguration.minValue)
      || state.amountToTransfer.gt(state.pegoutConfiguration.maxValue)) {
        return false;
      }
      if (state.amountToTransfer.gt('0') && feePlusAmount.lte(balance)) {
        return true;
      }
      return true;
    },
};
