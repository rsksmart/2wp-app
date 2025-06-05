import { GetterTree } from 'vuex';
import {
  PegOutTxState, RootState, SatoshiBig, WeiBig,
} from '@/common/types';
import * as constants from '@/common/store/constants';

export const getters: GetterTree<PegOutTxState, RootState> = {
  [constants.PEGOUT_TX_GET_SAFE_TX_FEE]: (state:PegOutTxState): WeiBig => {
    let fee:WeiBig;
    if (state.effectivePaidFee) {
      fee = state.effectivePaidFee;
    } else {
      fee = state.calculatedFee;
    }
    return fee;
  },
  [constants.PEGOUT_TX_GET_ESTIMATED_BTC_TO_RECEIVE]:
    (state: PegOutTxState) => new SatoshiBig(state.amountToTransfer.toRBTCTrimmedString(), 'btc')
      .minus(state.btcEstimatedFee),
  [constants.PEGOUT_TX_IS_ENOUGH_BALANCE]:
    (state: PegOutTxState, moduleGetters, rootState:RootState): boolean => {
      if (rootState.web3Session) {
        const { balance } = rootState.web3Session;
        const feePlusAmount: WeiBig = state.amountToTransfer
          .plus(moduleGetters[constants.PEGOUT_TX_GET_SAFE_TX_FEE]);
        if (state.amountToTransfer.lte('0')
        || feePlusAmount.gt(balance)
        || state.amountToTransfer.lt(state.pegoutConfiguration.minValue)) {
          return false;
        }
        if (state.amountToTransfer.gt('0') && feePlusAmount.lte(balance)) {
          return true;
        }
        return true;
      }
      return false;
    },
};
