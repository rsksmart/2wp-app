import Big from 'big.js';
import { ActionTree } from 'vuex';
import * as constants from '@/store/constants';
import {
  MiningSpeedFee, PegOutTxState, RootState, SessionState, WeiBig,
} from '@/types';
import { EnvironmentAccessorService } from '@/services/enviroment-accessor.service';

export const actions: ActionTree<PegOutTxState, RootState> = {
  [constants.PEGOUT_TX_SELECT_FEE_LEVEL]: ({ commit }, feeLevel: MiningSpeedFee) => {
    commit(constants.PEGOUT_TX_SET_SELECTED_FEE_LEVEL, feeLevel);
  },
  [constants.PEGOUT_TX_ADD_AMOUNT]: ({ commit }, amountToTransfer: Big) => {
    commit(constants.PEGOUT_TX_SET_AMOUNT, amountToTransfer);
  },
  [constants.PEGOUT_TX_CALCULATE_FEE]: () => {
    // TODO: calculate fee from bridgeService method
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
      if (web3) {
        web3.eth.sendTransaction({
          from: rootState.web3Session.account,
          to: state.pegoutConfiguration.bridgeContractAddress,
          value: state.amountToTransfer.toWeiString(),
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
