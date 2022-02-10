import { MutationTree } from 'vuex';
import * as constants from '@/store/constants';
import {
  txSummaryState
} from './types';
import { TxData } from '@/types';

export const mutations: MutationTree<txSummaryState> = {
    [constants.TX_SUMMARY_SET_AMOUNT]: (state, amount: string) => {
        state.amount = amount;
    },
    [constants.TX_SUMMARY_SET_AMOUNT_USD]: (state, amountUSD: string) => {
        state.amountUSD = amountUSD;
    },
    [constants.TX_SUMMARY_SET_FEE]: (state, fee: string) => {
        state.fee = fee;
    },
    [constants.TX_SUMMARY_SET_FEE_USD]: (state, feeUSD: string) => {
        state.feeUSD = feeUSD;
    },
    [constants.TX_SUMMARY_SET_FEE_PLUS_AMOUNT]: (state, feePlusAmount: string) => {
        state.feePlusAmount = feePlusAmount;
    },
    [constants.TX_SUMMARY_SET_FEE_PLUS_AMOUNT_USD]: (state, feePlusAmountUSD: string) => {
        state.feePlusAmountUSD = feePlusAmountUSD;
    },
    [constants.TX_SUMMARY_SET_CHUNKED_RECIPIENT_ADDRESS]: (state, chunkedRecipientAddress: string) => {
        state.chunkedRecipientAddress = chunkedRecipientAddress;
    },
    [constants.TX_SUMMARY_SET_CHUNKED_REFUND_ADDRESS]: (state, chunkedRefundAddress: string) => {
        state.chunkedRefundAddress = chunkedRefundAddress;
    },

    [constants.PEGIN_TX_CLEAR]: (state) => {
        const clearState = constants.getClearTxSummaryState();
        Object.assign(state, clearState);
    },
}

export const TX_SUMMARY_SET_AMOUNT = 'TX_SUMMARY_SET_AMOUNT';
export const TX_SUMMARY_SET_AMOUNT_USD = 'TX_SUMMARY_SET_AMOUNT_USD';
export const TX_SUMMARY_SET_FEE = 'TX_SUMMARY_SET_FEE';
export const TX_SUMMARY_SET_FEE_USD = 'TX_SUMMARY_SET_FEE_USD';
export const TX_SUMMARY_SET_FEE_PLUS_AMOUNT = 'TX_SUMMARY_SET_FEE_PLUS_AMOUNT';
export const TX_SUMMARY_SET_FEE_PLUS_AMOUNT_USD = 'TX_SUMMARY_SET_FEE_PLUS_AMOUNT_USD';

export const TX_SUMMARY_SET_CHUNKED_RECIPIENT_ADDRESS = 'TX_SUMMARY_SET_CHUNKED_RECIPIENT_ADDRESS';
export const TX_SUMMARY_SET_CHUNKED_REFUND_ADDRESS = 'TX_SUMMARY_SET_CHUNKED_REFUND_ADDRESS';
export const TX_SUMMARY_SET_COMPUTED_TX_ID = 'TX_SUMMARY_SET_COMPUTED_TX_ID';
export const TX_SUMMARY_SET_REFUND_ADDRESS = 'TX_SUMMARY_SET_REFUND_ADDRESS';

// amount: string,
// amountUSD: string,
// fee: string,
// feeUSD: string,
// feePlusAmount: string,
// feePlusAmountUSD: string,
// chunkedRecipientAddress: string,
// chunkedRefundAddress: string,
// computedTxId: string,
// computedRefundAddress: string,
