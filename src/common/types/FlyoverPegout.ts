import { ObjectDifference } from '@/common/types';
import { FlyoverService } from '../services';
import { LiquidityProvider2WP, QuotePegOut2WP } from './Flyover';
import SatoshiBig from './SatoshiBig';
import WeiBig from './WeiBig';

export interface FlyoverPegoutState {
    differences: Array<ObjectDifference>;
    amountToTransfer: WeiBig;
    validAmount: boolean;
    btcRecipientAddress: string;
    btcToReceive: SatoshiBig;
    liquidityProviders: LiquidityProvider2WP[];
    quotes: Record<number, QuotePegOut2WP[]>;
    flyoverService: FlyoverService;
    txHash?: string;
    selectedQuoteHash: string;
}
