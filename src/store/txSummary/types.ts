import { TxData } from "@/types";

export interface txSummaryState {
    txData: TxData,
    price: number,
    txId: string,
    showTxId: boolean,
    initialExpand: boolean,
    rskFederationAddress: string,

    amount: string,
    amountUSD: string,
    feeUSD: string,

    txIdValue: string,
    fixedUSDDecimals: number
}