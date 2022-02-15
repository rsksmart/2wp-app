import { ActionTree } from 'vuex';

import * as constants from '@/store/constants';
import { txSummaryState } from './types';

import { TxData } from '@/types';
import { RootState } from '../types';

export const actions: ActionTree<txSummaryState, RootState> = {
    [constants.TX_SUMMARY_ADD_TX_DATA]: ({commit}, txData: TxData) => {       
        commit(constants.TX_SUMMARY_SET_TX_DATA, txData);
    },
    [constants.TX_SUMMARY_ADD_PRICE]: ({commit}, price: number) => {    
        commit(constants.TX_SUMMARY_SET_PRICE, price);
    },
    [constants.TX_SUMMARY_ADD_TX_ID]: ({commit}, txId: string) => {       
        commit(constants.TX_SUMMARY_SET_TX_ID, txId);
    },
    [constants.TX_SUMMARY_ADD_SHOW_TX_ID]: ({commit}, showTxId: boolean) => {       
        commit(constants.TX_SUMMARY_SET_SHOW_TX_ID, showTxId);
    },
    [constants.TX_SUMMARY_ADD_INITIAL_EXPAND]: ({commit}, initialExpand: boolean) => {       
        commit(constants.TX_SUMMARY_SET_INITIAL_EXPAND, initialExpand);
    },
    //rskFederationAddress
    [constants.TX_SUMMARY_ADD_RSK_FEDERARION_ADDRESS]: ({commit}, rskFederationAddress: string) => {       
        commit(constants.TX_SUMMARY_SET_RSK_FEDERARION_ADDRESS, rskFederationAddress);
    },
}