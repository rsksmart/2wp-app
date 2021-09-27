import { Network } from 'bitcoinjs-lib';
import SatoshiBig from '@/types/SatoshiBig';

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

export interface Signer {
  network: Network;
  publicKey: Buffer;
  sign: (hash: any) => Buffer;
}

export interface AccountBalance {
  legacy: number; // SatoshiBN
  segwit: number; // SatoshiBN
  nativeSegwit: number; // SatoshiBN
}

export interface FeeAmountData {
  slow: number; // SatoshiBN
  average: number; // SatoshiBN
  fast: number; // SatoshiBN
}

export interface TxData {
  amount: SatoshiBig;
  refundAddress: string;
  recipient: string;
  feeBTC: SatoshiBig;
  change: string,
}

export interface PegInFormValues {
  accountType: string;
  amount: SatoshiBig;
  rskAddress: string;
  txFeeIndex: number;
}

export type SendBitcoinState = 'idle' | 'loading' | 'error';

export type ConfirmTxState = 'idle' | 'loading' | 'error';
