import { ActionTree } from 'vuex';
import {
  RootState, SatoshiBig, TxStatus, TxStatusType,
} from '@/types';
import * as constants from '@/store/constants';
import { ApiService } from '@/services';
import { BridgeService } from '@/services/BridgeService';

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
        const mockedStatus = {
          btcRecipientAddress: 'btcRecipientAddress',
          originatingRskTxHash: 'originatingTxHashTest',
          rskSenderAddress: 'userSenderAddress',
          rskTxHash: 'rskTxHash',
          status: 'RECEIVED',
          valueRequestedInSatoshis: 500000,
        };
        commit(constants.STATUS_SET_TX_DETAILS, mockedStatus);
        commit(constants.STATUS_SET_TX_TYPE, 'PEGOUT');
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
};
