import { MutationTree } from 'vuex';
import * as constants from '@/common/store/constants';
import {
  MiningSpeedFee, PegoutConfiguration, PegOutTxState, SatoshiBig, WeiBig,
} from '@/common/types';
import { getClearPegoutTxState } from '@/common/utils';

export const mutations: MutationTree<PegOutTxState> = {
  [constants.PEGOUT_TX_SET_SELECTED_FEE_LEVEL]: (state, feeLevel: MiningSpeedFee) => {
    state.selectedFee = feeLevel;
  },
  [constants.PEGOUT_TX_SET_RSK_ESTIMATED_FEE]: (state, calculatedFee: WeiBig) => {
    state.calculatedFee = calculatedFee;
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
  [constants.PEGOUT_TX_SET_GAS]: (state, gas: number) => {
    state.gas = gas;
  },
  [constants.PEGOUT_TX_SET_EFECTIVE_FEE]: (state, effectiveFee: WeiBig) => {
    state.effectivePaidFee = effectiveFee;
    state.selectedFee = constants.BITCOIN_AVERAGE_FEE_LEVEL;
  },
  [constants.PEGOUT_TX_CLEAR_STATE]: (state) => {
    const clearState = getClearPegoutTxState();
    Object.assign(state, clearState);
  },
  [constants.PEGOUT_TX_SET_BITCOIN_PRICE]: (state, bitcoinPrice) => {
    state.bitcoinPrice = bitcoinPrice;
  },
};
