import { LiquidityProviderBase } from '@rsksmart/flyover-sdk';
import WeiBig from './WeiBig';
import SatoshiBig from './SatoshiBig';

interface PeginProviderDetail {
    fee: SatoshiBig;
    maxTransactionValue: SatoshiBig;
    minTransactionValue: SatoshiBig;
    requiredConfirmations: number;
}
interface PegoutProviderDetail {
    fee: WeiBig;
    maxTransactionValue: WeiBig;
    minTransactionValue: WeiBig;
    requiredConfirmations: number;
}
interface ProviderDetailResponse2WP {
    pegin: PeginProviderDetail;
    pegout: PegoutProviderDetail;
    siteKey: string;
}

export type LiquidityProvider2WP = LiquidityProviderBase & ProviderDetailResponse2WP;

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
