import { MiningSpeedFee } from '@/types/pegInTx';
import WeiBig from '@/types/WeiBig';

export interface PegoutConfiguration {
  minValue: WeiBig;
  maxValue: WeiBig;
  bridgeContractAddress: string;
}

export interface PegOutTxState {
  amountToTransfer: WeiBig;
  pegoutConfiguration: PegoutConfiguration;
  validAmount: boolean;
  calculatedFees: {
    fast: WeiBig;
    average: WeiBig;
    slow: WeiBig;
  };
  selectedFee: MiningSpeedFee;
  senderAddress?: string;
}
