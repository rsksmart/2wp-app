import { LiquidityProviderBase } from '@rsksmart/flyover-sdk';
import WeiBig from '../WeiBig';
import SatoshiBig from '../SatoshiBig';

interface PeginProviderDetail {
    fee: WeiBig;
    maxTransactionValue: WeiBig;
    minTransactionValue: WeiBig;
    requiredConfirmations: number;
    availableLiquidity?: WeiBig;
}
interface PegoutProviderDetail {
    fee: WeiBig;
    maxTransactionValue: WeiBig;
    minTransactionValue: WeiBig;
    requiredConfirmations: number;
    availableLiquidity?: WeiBig;
}
interface ProviderDetailResponse2WP {
    pegin: PeginProviderDetail;
    pegout: PegoutProviderDetail;
    siteKey: string;
    liquidityCheckEnabled: boolean;
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

export interface PeginQuoteDTO2WP {
    agreementTimestamp: number;
    btcRefundAddr: string;
    callFee: SatoshiBig;
    callOnRegister: boolean;
    confirmations: number;
    contractAddr: string;
    data: string;
    fedBTCAddr: string;
    gasFee: WeiBig;
    gasLimit: number;
    lbcAddr: string;
    lpBTCAddr: string;
    lpCallTime: number;
    lpRSKAddr: string;
    nonce: bigint;
    penaltyFee: WeiBig;
    productFeeAmount: SatoshiBig;
    rskRefundAddr: string;
    timeForDepositInSeconds: number;
    value: SatoshiBig;
}

export interface QuotePegIn2WP {
    quote: PeginQuoteDTO2WP;
    quoteHash: string;
}
