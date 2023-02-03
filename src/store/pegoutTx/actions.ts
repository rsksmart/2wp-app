import { ActionTree } from 'vuex';
import * as constants from '@/store/constants';
import {
  MiningSpeedFee, PegOutTxState, RootState, SessionState, WeiBig,
} from '@/types';
import { EnvironmentAccessorService } from '@/services/enviroment-accessor.service';
import { BridgeService } from '@/services/BridgeService';
import Web3 from 'web3';

export const actions: ActionTree<PegOutTxState, RootState> = {
  [constants.PEGOUT_TX_SELECT_FEE_LEVEL]: ({ commit }, feeLevel: MiningSpeedFee) => {
    commit(constants.PEGOUT_TX_SET_SELECTED_FEE_LEVEL, feeLevel);
  },
  [constants.PEGOUT_TX_ADD_AMOUNT]: ({ commit }, amountToTransfer: WeiBig) => {
    commit(constants.PEGOUT_TX_SET_AMOUNT, amountToTransfer);
  },
  [constants.PEGOUT_TX_CALCULATE_FEE]: async ({ commit, state, rootState }) => {
    const bridgeService = new BridgeService();
    const web3 = rootState.web3Session.web3 as Web3;
    const sender = rootState.web3Session.account as string;
    // RSK Fee
    const gas = await web3.eth.estimateGas({
      from: sender,
      to: state.pegoutConfiguration.bridgeContractAddress,
      value: state.amountToTransfer.toWeiString(),
    });
    commit(constants.PEGOUT_TX_SET_GAS, gas);
    const gasPrice = Number(await web3.eth.getGasPrice());
    const averageGasPrice = Math.round(gasPrice * (3 / 2));
    const calculatedFees = {
      slow: new WeiBig(gasPrice * gas, 'wei'),
      average: new WeiBig(averageGasPrice * gas, 'wei'),
      fast: new WeiBig(gasPrice * gas * 2, 'wei'),
    };
    commit(constants.PEGOUT_TX_SET_RSK_ESTIMATED_FEE, calculatedFees);
    // BTC Fee
    const [nextPegoutCost, pegoutQueueCount] = await Promise.all([
      bridgeService.getEstimatedFeesForNextPegOutEvent(),
      bridgeService.getQueuedPegoutsCount(),
    ]);
    const estimatedFee = pegoutQueueCount > 0 ? nextPegoutCost / pegoutQueueCount : 0;
    commit(constants.PEGOUT_TX_SET_BTC_ESTIMATED_FEE, estimatedFee);
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
  [constants.PEGOUT_TX_SEND]: ({ state, rootState, commit })
    : Promise<void> => new Promise<void>((resolve, reject) => {
      const { web3 } = rootState.web3Session as SessionState;
      const feePerGas = Number(state.calculatedFees.average.toWeiString()) / state.gas;
      if (web3) {
        web3.eth.sendTransaction({
          from: rootState.web3Session.account,
          to: state.pegoutConfiguration.bridgeContractAddress,
          value: state.amountToTransfer.toWeiString(),
          gas: state.gas,
          gasPrice: feePerGas,
        })
          .then((tx) => {
            commit(constants.PEGOUT_TX_SET_TX_HASH, tx.transactionHash);
            resolve();
          })
          .catch((e) => {
            console.warn(e);
            reject(new Error('User Cancelled transaction'));
          });
      }
    }),
};
