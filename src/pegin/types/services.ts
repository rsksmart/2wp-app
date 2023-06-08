import { Fee, SatoshiBig, Utxo } from '@/common/types';

export interface FeePerLevel {
  slow: SatoshiBig;
  average: SatoshiBig;
  fast: SatoshiBig;
}

export interface FeeSelection {
  fee: Fee,
  selectedUtxoList: Utxo[];
}
