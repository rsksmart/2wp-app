import { TransactionInput, TransactionOutput } from 'trezor-connect';

export interface Tx {
  coin: string,
  inputs: object[],
  outputs: object[],
}

export interface normalizedTx extends Tx {
  coin: string,
  inputs: normalizedInput[],
  outputs: normalizedOutput[],
  opReturnData: string
}

export interface normalizedInput {
  address: string;
  txid: string;
  amount: number;
  path: string;
  derivationArray: number[];
  vout: number;
  serializedValue: string;
  redeemScript?: string
}

export interface normalizedOutput {
  address: string;
  amount: string;
  serializedValue?: string;
}

export interface TrezorTx extends Tx {
  coin: string,
  inputs: TransactionInput[],
  outputs: TransactionOutput[],
}
