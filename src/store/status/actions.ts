import { ActionTree } from 'vuex';
import { RootState, TxStatus, TxStatusType } from '@/types';
import * as constants from '@/store/constants';
import { ApiService } from '@/services';

export const actions: ActionTree<TxStatus, RootState> = {
  [constants.STATUS_GET_TX_STATUS]: ({ commit }, txId: string) => {
    ApiService.getTxStatus(txId)
      .then((status: TxStatus) => {
        commit(constants.STATUS_SET_TX_DETAILS, status.txDetails);
        commit(constants.STATUS_SET_TX_TYPE, status.type);
      })
      .catch((e) => {
        commit(constants.STATUS_SET_TX_DETAILS, undefined);
        commit(constants.STATUS_SET_TX_TYPE, TxStatusType.UNEXPECTED_ERROR);
        throw e;
      });
  },
};
