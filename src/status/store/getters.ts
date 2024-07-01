import { GetterTree } from 'vuex';
import {
  RootState,
  TxStatus,
  TxStatusMessage,
  TxStatusType,
} from '@/common/types';
import * as constants from '@/common/store/constants';
import { setStatusMessage } from '@/common/utils';

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
  [constants.STATUS_GET_RELEASE_TIME_TEXT]: (state: TxStatus):
    string => (state.estimatedReleaseTimeInMinutes.asMinutes() <= 0
    ? 'You will receive your transaction shortly'
    : state.estimatedReleaseTimeInMinutes.humanize(true, { h: 34 })),
};
