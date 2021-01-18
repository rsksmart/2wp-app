import { TransactionInput, TransactionOutput } from 'trezor-connect';

export interface Tx{
  coin: string,
  inputs: object[],
  outputs: object[],
}
export interface TrezorTx extends Tx{
  coin: string,
  inputs: TransactionInput[],
  outputs: TransactionOutput[],
}
