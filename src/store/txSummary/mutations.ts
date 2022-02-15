import { MutationTree } from 'vuex';
import { TxData } from '@/types';
import {
  txSummaryState,
} from './types';
import * as constants from '@/store/constants';

export const mutations: MutationTree<txSummaryState> = {
    [constants.TX_SUMMARY_SET_TX_DATA]: (state, txData: TxData) => {
        state.txData = txData;
    },
    [constants.TX_SUMMARY_SET_PRICE]: (state, price: number) => {
        state.price = price;
    },
    [constants.TX_SUMMARY_SET_TX_ID]: (state, txId: string) => {
        state.txId = txId;
    },
    [constants.TX_SUMMARY_SET_SHOW_TX_ID]: (state, showTxId: boolean) => {
        state.showTxId = showTxId;
    },
    [constants.TX_SUMMARY_SET_INITIAL_EXPAND]: (state, initialExpand: boolean) => {
        state.initialExpand = initialExpand;
    },
    [constants.TX_SUMMARY_SET_RSK_FEDERARION_ADDRESS]: (state, rskFederationAddress: string) => {
        state.rskFederationAddress = rskFederationAddress;
    },
}