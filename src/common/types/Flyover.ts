import WeiBig from './WeiBig';

export interface PegoutQuoteDTO2WP {
    agreementTimestamp: number;
    btcRefundAddress: string;
    callFee: WeiBig;
    depositAddr: string;
    depositConfirmations: number;
    depositDateLimit: number;
    expireBlocks: number;
    expireDate: number;
    gasFee: WeiBig;
    lbcAddress: string;
    liquidityProviderRskAddress: string;
    lpBtcAddr: string;
    nonce: bigint;
    penaltyFee: WeiBig;
    productFeeAmount: WeiBig;
    rskRefundAddress: string;
    transferConfirmations: number;
    transferTime: number;
    value: WeiBig;
}

export interface QuotePegOut2WP {
    quote: PegoutQuoteDTO2WP;
    quoteHash: string;
}
