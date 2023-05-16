import { GetterTree } from 'vuex';
import {
  PegoutStatusDataModel,
  RootState,
  TxStatus,
  TxStatusMessage,
  TxStatusType,
} from '@/types';
import * as constants from '@/store/constants';
import { setStatusMessage } from '@/services/utils';
import { BridgeService } from '@/services/BridgeService';
import Web3 from 'web3';
import { EnvironmentAccessorService } from '@/services/enviroment-accessor.service';

export const getters: GetterTree<TxStatus, RootState> = {
  [constants.STATUS_IS_REJECTED]: (state: TxStatus): boolean => {
    let isRejected = false;
    if (state.txDetails) {
      isRejected = state.txDetails.status === constants.PegStatus.ERROR_NOT_A_PEGIN
        || state.txDetails.status === constants.PegStatus.ERROR_BELOW_MIN
        || state.txDetails.status === constants.PegStatus.REJECTED_NO_REFUND
        || state.txDetails.status === constants.PegStatus.REJECTED_REFUND
        || state.type === TxStatusType.UNEXPECTED_ERROR;
    }
    return isRejected;
  },
  [constants.STATUS_GET_ACTIVE_MESSAGE]: (state: TxStatus): TxStatusMessage => {
    const status = state.txDetails ? state.txDetails.status : '';
    return setStatusMessage(state.type, status);
  },
  [constants.STATUS_GET_ESTIMATED_RELEASE_TIME_IN_MINUTES]: (state: TxStatus)
    : Promise<number> => new Promise<number>((resolve, reject) => {
      const bridgeService = new BridgeService();
      const web3 = new Web3(EnvironmentAccessorService.getEnvironmentVariables().vueAppRskNodeHost);
      if (state.txDetails) {
        const status = state.txDetails as PegoutStatusDataModel;
        web3.eth.getTransaction(status.originatingRskTxHash)
          .then(({ blockNumber }) => {
            if (blockNumber) reject(new Error('The tx are not mined yet'));
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
              * Math.floor(constants.BLOCKS_PER_YEAR / (365.25 * 1440));
            resolve(estimatedMinutes);
          })
          .catch(reject);
      } else {
        resolve(-1);
      }
    }),
};
