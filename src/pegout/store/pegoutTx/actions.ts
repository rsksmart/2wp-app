import { ActionTree } from 'vuex';
import Web3 from 'web3';
import axios, { AxiosResponse } from 'axios';
import * as constants from '@/common/store/constants';
import {
  MiningSpeedFee, PegOutTxState, RootState, SatoshiBig, SessionState, WeiBig,
} from '@/common/types';
import { EnvironmentAccessorService } from '@/common/services/enviroment-accessor.service';
import { BridgeService } from '@/common/services/BridgeService';

export const actions: ActionTree<PegOutTxState, RootState> = {
  [constants.PEGOUT_TX_SELECT_FEE_LEVEL]: ({ commit }, feeLevel: MiningSpeedFee) => {
    commit(constants.PEGOUT_TX_SET_SELECTED_FEE_LEVEL, feeLevel);
  },
  [constants.PEGOUT_TX_ADD_AMOUNT]: ({ commit }, amountToTransfer: WeiBig) => {
    commit(constants.PEGOUT_TX_SET_AMOUNT, amountToTransfer);
  },
  [constants.PEGOUT_TX_CALCULATE_FEE]: async ({ commit, state, rootState }) => {
    const bridgeService = new BridgeService();
    const web3 = rootState.web3Session?.web3 as Web3;
    const sender = rootState.web3Session?.account as string;
    // RSK Fee
    const gas = await web3.eth.estimateGas({
      from: sender,
      to: state.pegoutConfiguration.bridgeContractAddress,
      value: state.amountToTransfer.toWeiString(),
    });
    commit(constants.PEGOUT_TX_SET_GAS, gas);
    const gasPrice = Number(await web3.eth.getGasPrice());
    const calculatedFee = new WeiBig(gasPrice * gas, 'wei');
    commit(constants.PEGOUT_TX_SET_RSK_ESTIMATED_FEE, calculatedFee);
    // BTC Fee
    const [nextPegoutCost, pegoutQueueCount] = await Promise.all([
      bridgeService.getEstimatedFeesForNextPegOutEvent(),
      bridgeService.getQueuedPegoutsCount(),
    ]);
    const estimatedFee = pegoutQueueCount > 0 ? nextPegoutCost / pegoutQueueCount : 0;
    commit(constants.PEGOUT_TX_SET_BTC_ESTIMATED_FEE, new SatoshiBig(estimatedFee, 'satoshi'));
  },
  [constants.PEGOUT_TX_ADD_PEGOUT_CONFIGURATION]: ({ commit }) => {
    commit(constants.PEGOUT_TX_SET_PEGOUT_CONFIGURATION, {
      minValue:
        new WeiBig(EnvironmentAccessorService.getEnvironmentVariables().pegoutMinValue, 'rbtc'),
      maxValue:
        new WeiBig(EnvironmentAccessorService.getEnvironmentVariables().pegoutMaxValue, 'rbtc'),
      bridgeContractAddress: constants.BRIDGE_CONTRACT_ADDRESS,
    });
  },
  [constants.PEGOUT_TX_ADD_VALID_AMOUNT]: ({ commit }, valid: boolean) => {
    commit(constants.PEGOUT_TX_SET_VALID_AMOUNT, valid);
  },
  [constants.PEGOUT_TX_INIT]: ({ dispatch }):
    Promise<void> => dispatch(constants.PEGOUT_TX_ADD_BITCOIN_PRICE)
    .then(() => dispatch(constants.PEGOUT_TX_ADD_PEGOUT_CONFIGURATION)),
  [constants.PEGOUT_TX_SEND]: ({ state, rootState, commit })
    : Promise<void> => new Promise<void>((resolve, reject) => {
      const { web3 } = rootState.web3Session as SessionState;
      if (web3) {
        Promise.all([
          web3.eth.sendTransaction({
            from: rootState.web3Session?.account,
            to: state.pegoutConfiguration.bridgeContractAddress,
            value: state.amountToTransfer.toWeiString(),
          }).on(constants.PEGOUT_TX_EVENT_TRANSACTION_HASH, (hash) => {
            commit(constants.PEGOUT_TX_SET_TX_HASH, hash);
            resolve();
          }),
          web3.eth.getGasPrice(),
        ])
          .then(([tx, gasPrice]) => {
            commit(
              constants.PEGOUT_TX_SET_EFECTIVE_FEE,
              new WeiBig(Number(gasPrice) * tx.gasUsed, 'wei'),
            );
          })
          .catch((e) => {
            console.warn(e);
            reject(new Error('User Cancelled transaction'));
          });
      }
    }),
  [constants.PEGOUT_TX_CLEAR]: ({ commit }) => {
    commit(constants.PEGOUT_TX_CLEAR_STATE);
  },
  [constants.PEGOUT_TX_ADD_BITCOIN_PRICE]: ({ commit }) => axios.get('https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=bitcoin&order=market_cap_desc&per_page=100&page=1&sparkline=false')
    .then((response: AxiosResponse) => {
      const [result] = response.data;
      commit(constants.PEGOUT_TX_SET_BITCOIN_PRICE, result.current_price);
    }),
};