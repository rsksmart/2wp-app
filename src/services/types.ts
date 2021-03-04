import { TransactionInput, TransactionOutput } from 'trezor-connect';

export interface Tx {
  coin: string;
  inputs: object[];
  outputs: object[];
}

export interface NormalizedTx extends Tx {
  coin: string;
  inputs: NormalizedInput[];
  outputs: NormalizedOutput[];
  opReturnData: string;
}

export interface NormalizedInput {
  address: string;
  txid: string;
  amount: number;
  path: string;
  derivationArray: number[];
  vout: number;
  serializedValue: string;
  redeemScript?: string;
}

export interface NormalizedOutput {
  address: string;
  amount: string;
  serializedValue?: string;
}

export interface TrezorTx extends Tx {
  coin: string;
  inputs: TransactionInput[];
  outputs: TransactionOutput[];
}

export interface AccountBalance {
  legacy: number;
  segwit: number;
  nativeSegwit: number;
}
