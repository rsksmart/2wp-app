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
  prev_hash: string;
  amount: string;
  address_n: number[];
  prev_index: number;
  script_type?: string;
  sequence?: number;
}

export interface NormalizedOutput {
  address?: string;
  address_n?: number[];
  amount: string;
  serializedValue?: string;
  op_return_data?: string;
}

export interface TrezorTx extends Tx {
  coin: string;
  inputs: TransactionInput[];
  outputs: TransactionOutput[];
}

export type InputScriptType = 'SPENDADDRESS' | 'SPENDMULTISIG' | 'SPENDWITNESS' | 'SPENDP2SHWITNESS';

export interface AccountBalance {
  legacy: number;
  segwit: number;
  nativeSegwit: number;
}

export interface FeeAmountData {
  slow: number;
  average: number;
  fast: number;
}

export interface TxData {
  amount: number;
  refundAddress: string;
  recipient: string;
  change: string;
  feeBTC: number;
}

export interface TrezorSignedTx {
  success: boolean;
  id?: number;
  payload: {
    signatures: string[];
    serializedTx: string;
  };
}
