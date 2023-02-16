import { MiningSpeedFee } from '@/types/pegInTx';
import WeiBig from '@/types/WeiBig';
import SatoshiBig from '@/types/SatoshiBig';

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
  bitcoinPrice: number; 
  gas: number;
  btcEstimatedFee: SatoshiBig;
  selectedFee: MiningSpeedFee;
  efectivePaidFee?: WeiBig;
  senderAddress?: string;
  estimatedBTCToRecieve: SatoshiBig;
  txHash?: string;
}
