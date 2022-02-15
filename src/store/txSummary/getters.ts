import { GetterTree } from 'vuex';

import { txSummaryState } from './types';
import { RootState } from '../types';
import * as constants from '@/store/constants';
import Big from 'big.js';

export const getters: GetterTree<txSummaryState, RootState> = {
    [constants.TX_SUMMARY_GET_AMOUNT]: (state: txSummaryState) => {
        if (!state.txData.amount) {
            return constants.VALUE_INCOMPLETE_MESSAGE;
        } else {
            return state.txData.amount.toBTCString();
        }
    },
    [constants.TX_SUMMARY_GET_AMOUNT_USD]: (state:txSummaryState) => {
        debugger
        if (!state.txData.amount || !state.price) {
            return constants.VALUE_INCOMPLETE_MESSAGE;
        } else {
            return state.txData.amount.toUSDFromBTCString(state.price, Number(state.fixedUSDDecimals));
        }
    },
    [constants.TX_SUMMARY_GET_FEE]: (state:txSummaryState) => {
        if (!state.txData.amount || !state.price) {
            return constants.VALUE_INCOMPLETE_MESSAGE;
        } else {
            return state.txData.feeBTC.toBTCString();
        }
    },
    [constants.TX_SUMMARY_GET_FEE_USD]: (state:txSummaryState) => {
        if (!state.txData.feeBTC || !state.price) return constants.VALUE_INCOMPLETE_MESSAGE;
        return state.txData.feeBTC.toUSDFromBTCString(state.price, state.fixedUSDDecimals);
    },
    [constants.TX_SUMMARY_GET_FEE_PLUS_AMOUNT]: (state: txSummaryState) => {
        if (!state.txData.amount || !state.txData.feeBTC) return constants.VALUE_INCOMPLETE_MESSAGE;
        return state.txData.amount.plus(state.txData.feeBTC).toBTCString();
    },
    [constants.TX_SUMMARY_GET_FEE_PLUS_AMOUNT_USD]: (state: txSummaryState) => {
        if (!state.txData.amount || !state.txData.feeBTC) return constants.VALUE_INCOMPLETE_MESSAGE;
        return state.txData.amount.plus(state.txData.feeBTC).toBTCString();
    },
    [constants.TX_SUMMARY_GET_AMOUNT_USD]: (state: txSummaryState) => {
        if (!state.txData.amount || !state.txData.feeBTC || !state.price) {
            return constants.VALUE_INCOMPLETE_MESSAGE;
        }
        return Big(state.amountUSD).plus(Big(state.feeUSD)).toFixed(state.fixedUSDDecimals);
    },
    [constants.TX_SUMMARY_GET_CHUNKED_RECIPIENT_ADDRESS]: (state: txSummaryState) => {
        return state.txData.recipient ? `${state.txData.recipient.substr(0, 25)}...${state
            .txData.recipient.substr(38, 42)}` : constants.VALUE_INCOMPLETE_MESSAGE;
    },
    [constants.TX_SUMMARY_GET_COMPUTED_REFUND_ADDRESS]: (state: txSummaryState) => {
        return state.txData.refundAddress ? `${state.txData.refundAddress.substr(0, 24)}...${state
            .txData.refundAddress.substr(31, 35)}` : constants.VALUE_INCOMPLETE_MESSAGE;
    },
};