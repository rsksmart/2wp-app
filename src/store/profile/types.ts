export interface User {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
}

export interface ProfileState {
  user?: User;
  error: boolean;
}

export interface Utxo {
  txId: string;
  amount: number;
  address?: string;
}

export interface WalletAddress {
  addr: string;
  derivationPath: string;
  derivationArray: number[];
  utxoList: Utxo[];
}
