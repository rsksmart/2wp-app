import { MiningSpeedFee } from '@/common/types/pegInTx';
import WeiBig from '@/common/types/WeiBig';
import SatoshiBig from '@/common/types/SatoshiBig';

export interface PegoutConfiguration {
  minValue: WeiBig;
  bridgeContractAddress: string;
}

export interface PegOutTxState {
  amountToTransfer: WeiBig;
  pegoutConfiguration: PegoutConfiguration;
  validAmount: boolean;
  calculatedFee: WeiBig;
  bitcoinPrice: number;
  gas: number;
  btcEstimatedFee: SatoshiBig;
  selectedFee: MiningSpeedFee;
  effectivePaidFee?: WeiBig;
  senderAddress?: string;
  txHash?: string;
}
