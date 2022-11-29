import Big from 'big.js';
import { MiningSpeedFee } from '@/types/pegInTx';

export interface PegOutTxState {
  minAmountToTransfer: Big;
  maxAmountToTransfer: Big;
  amountToTransfer: Big;
  calculatedFees: {
    fast: Big;
    average: Big;
    slow: Big;
  };
  selectedFee: MiningSpeedFee;
  balance: Big;
}
