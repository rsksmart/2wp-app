import Big from 'big.js';
import { MiningSpeedFee } from '@/types/pegInTx';

export interface PegOutTxState {
  minAmountToTransfer: Big;
  maxAmountToTransfer: Big;
  amountToTransfer: Big;
  validAmount: boolean;
  calculatedFees: {
    fast: Big;
    average: Big;
    slow: Big;
  };
  selectedFee: MiningSpeedFee;
  balance: Big;
  senderAddress?: string;
}
