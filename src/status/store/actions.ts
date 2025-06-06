import { ActionTree } from 'vuex';
import Web3 from 'web3';
import moment from 'moment';
import {
  FlyoverStatusModel,
  PegoutStatusDataModel,
  RootState, SatoshiBig, TxStatus, TxStatusType,
} from '@/common/types';
import { EnvironmentAccessorService } from '@/common/services/enviroment-accessor.service';
import * as constants from '@/common/store/constants';
import { ApiService } from '@/common/services';
import { BridgeService } from '@/common/services/BridgeService';
import { getEstimatedFee, promiseWithTimeout } from '@/common/utils';

export const actions: ActionTree<TxStatus, RootState> = {
  [constants.STATUS_CLEAR]: ({ commit }) => {
    commit(constants.STATUS_SET_CLEAR);
  },
  [constants.STATUS_GET_TX_STATUS]:
    ({ commit, dispatch }, txId: string) => new Promise((resolve, reject) => {
      Promise.all([
        promiseWithTimeout(
          ApiService.getTxStatus(txId),
          EnvironmentAccessorService.getEnvironmentVariables().apiResponseTimeout,
        ),
        promiseWithTimeout(
          dispatch(constants.STATUS_GET_ESTIMATED_FEE),
          EnvironmentAccessorService.getEnvironmentVariables().apiResponseTimeout,
        ),
      ])
        .then(([status]) => {
          commit(constants.STATUS_SET_TX_DETAILS, status.txDetails);
          commit(constants.STATUS_SET_TX_TYPE, status.type);
          const nextActions = [];
          if (status.type === TxStatusType.FLYOVER_PEGIN
          || status.type === TxStatusType.FLYOVER_PEGOUT) {
            nextActions.push(dispatch(
              constants.STATUS_GET_FLYOVER_STATUS,
              (status.txDetails as FlyoverStatusModel).quoteHash,
            ));
          }
          nextActions.push(dispatch(constants.STATUS_GET_ESTIMATED_RELEASE_TIME_IN_MINUTES));
          return Promise.all(nextActions);
        })
        .then(resolve)
        .catch(() => {
          commit(constants.STATUS_SET_TX_DETAILS, undefined);
          commit(constants.STATUS_SET_TX_TYPE, TxStatusType.UNEXPECTED_ERROR);
          reject();
        });
    }),
  [constants.STATUS_GET_ESTIMATED_FEE]: async ({ commit }) => {
    try {
      const estimatedFee = await getEstimatedFee(true);
      commit(constants.STATUS_SET_BTC_ESTIMATED_FEE, new SatoshiBig(estimatedFee, 'satoshi'));
    } catch (e) {
      commit(constants.STATUS_SET_BTC_ESTIMATED_FEE, new SatoshiBig(0, 'satoshi'));
    }
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
              bridgeService.getNextPegoutCreationBlockAt(Number(blockNumber) ?? 0),
            ]);
          })
          .then(([currentBlock, nextPegoutCreationBlock]) => {
            const estimatedBlocksLeft = nextPegoutCreationBlock
            + constants.PEGOUT_REQUIRED_CONFIRMATIONS
            + constants.PEGOUT_SIGNING_BLOCKS_GAP - Number(currentBlock);
            const estimatedMinutes = estimatedBlocksLeft
            * ((365.25 * 1440) / constants.BLOCKS_PER_YEAR);
            commit(constants.STATUS_SET_ESTIMATED_RELEASE_TIME_IN_MINUTES, moment.duration(estimatedMinutes, 'minutes'));
          })
          .catch(reject);
      }
      resolve();
    }),
  [constants.STATUS_GET_FLYOVER_STATUS]: async ({
    state, commit, dispatch, rootState,
  }, quoteHash) => {
    let status;
    try {
      if (state.type === TxStatusType.FLYOVER_PEGIN) {
        const flyoverService = rootState.flyoverPegin?.flyoverService;
        await dispatch(`flyoverPegin/${constants.FLYOVER_PEGIN_INIT}`, null, { root: true });
        flyoverService?.useLiquidityProvider(EnvironmentAccessorService.getEnvironmentVariables()
          .flyoverProviderId);
        status = await flyoverService?.getPeginStatus(quoteHash);
      }
      if (state.type === TxStatusType.FLYOVER_PEGOUT) {
        const flyoverService = rootState.flyoverPegout?.flyoverService;
        await dispatch(`flyoverPegout/${constants.FLYOVER_PEGOUT_INIT}`, {}, { root: true });
        flyoverService?.useLiquidityProvider(EnvironmentAccessorService.getEnvironmentVariables()
          .flyoverProviderId);
        status = await rootState.flyoverPegout?.flyoverService.getPegoutStatus(quoteHash);
      }
    } catch (e) {
      status = TxStatusType.NOT_FOUND;
    } finally {
      commit(constants.STATUS_SET_FLYOVER_STATUS, status);
    }
  },
};
