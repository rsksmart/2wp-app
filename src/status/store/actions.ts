import { ActionTree } from 'vuex';
import Web3 from 'web3';
import moment from 'moment';
import {
  PegoutStatusDataModel,
  RootState, SatoshiBig, TxStatus, TxStatusType,
} from '@/common/types';
import { EnvironmentAccessorService } from '@/common/services/enviroment-accessor.service';
import * as constants from '@/common/store/constants';
import { ApiService } from '@/common/services';
import { BridgeService } from '@/common/services/BridgeService';

export const actions: ActionTree<TxStatus, RootState> = {
  [constants.STATUS_CLEAR]: ({ commit }) => {
    commit(constants.STATUS_SET_CLEAR);
  },
  [constants.STATUS_GET_TX_STATUS]: ({ commit, dispatch }, txId: string) => {
    Promise.all([
      ApiService.getTxStatus(txId),
      dispatch(constants.STATUS_GET_ESTIMATED_FEE),
    ])
      .then(([status]) => {
        commit(constants.STATUS_SET_TX_DETAILS, status.txDetails);
        commit(constants.STATUS_SET_TX_TYPE, status.type);
        return dispatch(constants.STATUS_GET_ESTIMATED_RELEASE_TIME_IN_MINUTES);
      })
      .catch(() => {
        commit(constants.STATUS_SET_TX_DETAILS, undefined);
        commit(constants.STATUS_SET_TX_TYPE, TxStatusType.UNEXPECTED_ERROR);
      });
  },
  [constants.STATUS_GET_ESTIMATED_FEE]: ({ commit }) => {
    const bridgeService = new BridgeService();
    Promise.all([
      bridgeService.getEstimatedFeesForNextPegOutEvent(),
      bridgeService.getQueuedPegoutsCount(),
    ]).then(([nextPegoutCost, pegoutQueueCount]) => {
      const estimatedFee = pegoutQueueCount > 0 ? nextPegoutCost / pegoutQueueCount : 0;
      commit(constants.STATUS_SET_BTC_ESTIMATED_FEE, new SatoshiBig(estimatedFee, 'satoshi'));
    })
      .catch(() => {
        commit(constants.STATUS_SET_BTC_ESTIMATED_FEE, new SatoshiBig(0, 'satoshi'));
      });
  },
  [constants.STATUS_GET_ESTIMATED_RELEASE_TIME_IN_MINUTES]: ({ state, commit })
    : Promise<void> => new Promise<void>((resolve, reject) => {
      const bridgeService = new BridgeService();
      const web3 = new Web3(EnvironmentAccessorService.getEnvironmentVariables().vueAppRskNodeHost);
      if (state.txDetails) {
        const status = state.txDetails as PegoutStatusDataModel;
        web3.eth.getTransaction(status.originatingRskTxHash)
          .then(({ blockNumber }) => {
            if (!blockNumber) reject(new Error('The tx are not mined yet'));
            return Promise.all([
              web3.eth.getBlockNumber(),
              bridgeService.getNextPegoutCreationBlockAt(blockNumber ?? 0),
            ]);
          })
          .then(([currentBlock, nextPegoutCreationBlock]) => {
            const estimatedBlocksLeft = nextPegoutCreationBlock
            + constants.PEGOUT_REQUIRED_CONFIRMATIONS
            + constants.PEGOUT_SIGNING_BLOCKS_GAP - currentBlock;
            const estimatedMinutes = estimatedBlocksLeft
            * ((365.25 * 1440) / constants.BLOCKS_PER_YEAR);
            commit(constants.STATUS_SET_ESTIMATED_RELEASE_TIME_IN_MINUTES, moment.duration(estimatedMinutes, 'minutes'));
          })
          .catch(reject);
      }
      resolve();
    }),
};
