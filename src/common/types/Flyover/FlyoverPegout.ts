import { LiquidityProvider2WP, QuotePegOut2WP } from '@/common/types';
import { FlyoverService } from '../../services';
import SatoshiBig from '../SatoshiBig';
import WeiBig from '../WeiBig';

export interface ReducedQuote {
    gasFee: WeiBig;
    callFee: WeiBig;
    productFeeAmount: WeiBig;
    value: WeiBig;
    quoteHash: string;
}
export interface ObjectDifference {
    percentage: number;
    previousQuote: ReducedQuote;
    currentQuote: ReducedQuote;
}

export interface FlyoverPegoutState {
    difference: ObjectDifference;
    amountToTransfer: WeiBig;
    validAmount: boolean;
    btcRecipientAddress: string;
    btcToReceive: SatoshiBig;
    liquidityProviders: LiquidityProvider2WP[];
    quotes: Record<number, QuotePegOut2WP[]>;
    flyoverService: FlyoverService;
    txHash?: string;
    selectedQuoteHash: string;
    acceptedQuoteSignature: string;
}
