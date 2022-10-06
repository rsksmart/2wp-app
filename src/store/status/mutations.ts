import { MutationTree } from 'vuex';
import { TxStatus, TxStatusType } from '@/types';
import * as constants from '@/store/constants';

export const mutations: MutationTree<TxStatus> = {
  [constants.STATUS_SET_TX_DETAILS]: (state, txDetails) => {
    state.txDetails = txDetails;
  },
  [constants.STATUS_SET_TX_TYPE]: (state, txType) => {
    state.type = txType;
  },
  [constants.STATUS_SET_CLEAR]: (state: TxStatus) => {
    state.txDetails = undefined;
    state.type = TxStatusType.UNSET_STATUS;
  },
};
