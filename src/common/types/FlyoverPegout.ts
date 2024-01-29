import { FlyoverService } from '../services';
import { LiquidityProvider2WP, QuotePegOut2WP } from './Flyover';
import SatoshiBig from './SatoshiBig';
import WeiBig from './WeiBig';

export interface FlyoverPegoutState {
    amountToTransfer: WeiBig;
    validAmount: boolean;
    senderAddress: string;
    rskRefundAddress: string;
    btcRecipientAddress: string;
    btcToReceive: SatoshiBig;
    liquidityProviders: LiquidityProvider2WP[];
    quotes: QuotePegOut2WP[];
    flyoverService: FlyoverService;
    txHash?: string;
}
