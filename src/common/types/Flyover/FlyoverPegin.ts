import { FlyoverService } from '../../services';
import { LiquidityProvider2WP } from './Flyover';
import SatoshiBig from '../SatoshiBig';
import WeiBig from '../WeiBig';
import PeginQuote from './PeginQuote';

export interface FlyoverPeginState {
    amountToTransfer: SatoshiBig;
    validAmount: boolean;
    rootstockRecipientAddress: string;
    valueToReceive: WeiBig;
    liquidityProviders: LiquidityProvider2WP[];
    quotes: Record<number, PeginQuote[]>;
    flyoverService: FlyoverService;
    txHash?: string;
    selectedQuoteHash: string;
}
