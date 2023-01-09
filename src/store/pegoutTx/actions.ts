import Big from 'big.js';
import { ActionTree } from 'vuex';
import * as constants from '@/store/constants';
import {
  MiningSpeedFee, PegOutTxState, RootState, WeiBig,
} from '@/types';
import * as pegoutCostEstimator from 'pegout-cost-estimator';
import { EnvironmentAccessorService } from '@/services/enviroment-accessor.service';
import Web3 from 'web3';
import { getNetworkSettingsForThisNetwork } from 'rsk-network-settings';

export const actions: ActionTree<PegOutTxState, RootState> = {
  [constants.PEGOUT_TX_SELECT_FEE_LEVEL]: ({ commit }, feeLevel: MiningSpeedFee) => {
    commit(constants.PEGOUT_TX_SET_SELECTED_FEE_LEVEL, feeLevel);
  },
  [constants.PEGOUT_TX_ADD_AMOUNT]: ({ commit }, amountToTransfer: Big) => {
    commit(constants.PEGOUT_TX_SET_AMOUNT, amountToTransfer);
  },
  [constants.PEGOUT_TX_CALCULATE_FEE]: async ({
    state,
    rootState,
  }) => {
    const networkSettings = getNetworkSettingsForThisNetwork('testnet');
    console.log(networkSettings);
    const amountToTransfer = Number(state.amountToTransfer.toWeiString());
    const pegoutCost = await pegoutCostEstimator.estimatePegoutValueInSatoshis(
      amountToTransfer,
      rootState.web3Session.web3 as Web3, networkSettings,
    );
    console.log(pegoutCost);
  },
  [constants.PEGOUT_TX_ADD_PEGOUT_CONFIGURATION]: ({ commit }) => {
    commit(constants.PEGOUT_TX_SET_PEGOUT_CONFIGURATION, {
      minValue: new WeiBig(EnvironmentAccessorService.getEnvironmentVariables().pegoutMinValue, 'rbtc'),
      maxValue: new WeiBig(EnvironmentAccessorService.getEnvironmentVariables().pegoutMaxValue, 'rbtc'),
      bridgeContractAddress: constants.BRIDGE_CONTRACT_ADDRESS,
    });
  },
  [constants.PEGOUT_TX_ADD_VALID_AMOUNT]: ({ commit }, valid: boolean) => {
    commit(constants.PEGOUT_TX_SET_VALID_AMOUNT, valid);
  },
  [constants.PEGOUT_TX_INIT]: ({ dispatch }):
    Promise<void> => dispatch(constants.PEGOUT_TX_ADD_PEGOUT_CONFIGURATION),
};
