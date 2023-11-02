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

export interface BlockbookUtxo {
  // address: string;
  txid: string;
  vout: number;
  satoshis: number;
  height?: number;
  confirmations: number;
  coinbase?: boolean;
  lockTime?: number;
}

export interface BalanceWithUtxos {
  legacy: {
    balance: SatoshiBig;
    utxos: Array<BlockbookUtxo>
  }
  segwit: {
    balance: SatoshiBig;
    utxos: Array<BlockbookUtxo>
  }
  nativeSegwit: {
    balance: SatoshiBig;
    utxos: Array<BlockbookUtxo>
  }
}
