import { FlyoverService } from '../../services';
import { LiquidityProvider2WP } from './Flyover';
import SatoshiBig from '../SatoshiBig';
import WeiBig from '../WeiBig';
import PeginQuote from './PeginQuote';
import { Utxo } from '../pegInTx';

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
    acceptedQuoteSignature: string;
    isMaxSelected: boolean;
    recommendedPegin: SatoshiBig;
    maxValueToSend: SatoshiBig;
    maxFee: SatoshiBig;
    maxSelectedUtxoList: Utxo[];
}
