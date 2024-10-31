import { LiquidityProvider2WP, ObjectDifference, QuotePegOut2WP } from '@/common/types';
import { FlyoverService } from '../../services';
import SatoshiBig from '../SatoshiBig';
import WeiBig from '../WeiBig';

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
    isResponding: boolean;
}
