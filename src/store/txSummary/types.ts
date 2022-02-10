export interface txSummaryState {
    amount: string,
    amountUSD: string,
    fee: string,
    feeUSD: string,
    feePlusAmount: string,
    feePlusAmountUSD: string,
    chunkedRecipientAddress: string,
    chunkedRefundAddress: string,
    computedTxId: string,
    computedRefundAddress: string,

    txIdValue: string,
    expand: string,
    expandOver: boolean,
    fixedUSDDecimals: number
}