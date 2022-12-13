import { MiningSpeedFee } from '@/types/pegInTx';
import WeiBig from '@/types/WeiBig';

export interface PegOutTxState {
  minAmountToTransfer: WeiBig;
  maxAmountToTransfer: WeiBig;
  amountToTransfer: WeiBig;
  validAmount: boolean;
  calculatedFees: {
    fast: WeiBig;
    average: WeiBig;
    slow: WeiBig;
  };
  selectedFee: MiningSpeedFee;
  balance: WeiBig;
  senderAddress?: string;
}
