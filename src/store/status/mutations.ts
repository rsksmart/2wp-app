import { MutationTree } from 'vuex';
import {
  SatoshiBig, TxStatus, TxStatusType,
} from '@/types';
import * as constants from '@/store/constants';
import moment from 'moment/moment';
import { Duration } from 'moment';

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
    state.pegOutEstimatedFee = new SatoshiBig('0', 'satoshi');
    state.estimatedReleaseTimeInMinutes = moment.duration(0, 'minutes');
  },
  [constants.STATUS_SET_BTC_ESTIMATED_FEE]: (state:TxStatus, estimatedFee:SatoshiBig) => {
    state.pegOutEstimatedFee = estimatedFee;
  },
  [constants.STATUS_SET_ESTIMATED_RELEASE_TIME_IN_MINUTES]:
    (state: TxStatus, releaseTime: Duration) => {
      state.estimatedReleaseTimeInMinutes = releaseTime;
    },
};
