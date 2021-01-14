
export interface PegInTxState {
  utxoList?: Utxo[];
  addressList?: WalletAddress[];
}

export interface Utxo {
  txId: string;
  amount: number;
  address?: string;
  derivationPath: string;
  derivationArray: number[];
  vOut: number;
}

export interface WalletAddress {
  addr: string;
  derivationPath: string;
  derivationArray: number[];
}
