export interface PegInTxState {
  utxoList?: Utxo[];
  addressList?: WalletAddress[];
  trezorConnected: boolean;
  peginConfiguration: PeginConfiguration;
  sessionId: string;
  bitcoinWallet: string;
  bitcoinPrice: number; // Bigjs
}

export interface PeginConfiguration {
  minValue: number; // SatoshiBN
  maxValue: number; // SatoshiBN
  federationAddress: string;
  feePerKb?: number; // SatoshiBN
  btcConfirmations: number;
  sessionId?: string;
  id?: number;
}

export interface Utxo {
  txid: string;
  amount: number; // SatoshiBN
  address?: string;
  path: string;
  derivationArray: number[];
  vout: number;
}

export interface WalletAddress {
  address: string;
  serializedPath: string;
  path: number[];
  publicKey?: string;
}

export interface UnusedWalletAddress {
  address: string;
  path: number[];
  transfer: number;
}

export interface TransactionSummary {
  amount: number;
  destinationAddress: string;
  fee: number;
  totalAmount: number;
  refundAddress: string;
}
