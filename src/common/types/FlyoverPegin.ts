import { FlyoverService } from '../services';
import { LiquidityProvider2WP, QuotePegIn2WP } from './Flyover';
import SatoshiBig from './SatoshiBig';
import WeiBig from './WeiBig';

export interface FlyoverPeginState {
    amountToTransfer: SatoshiBig;
    validAmount: boolean;
    rootstockRecipientAddress: string;
    valueToReceive: WeiBig;
    liquidityProviders: LiquidityProvider2WP[];
    quotes: Record<number, QuotePegIn2WP[]>;
    flyoverService: FlyoverService;
    txHash?: string;
    selectedQuoteHash: string;
}
