import SatoshiBig from '@/types/SatoshiBig';

export interface Tx {
  coin: string;
  inputs: object[];
  outputs: object[];
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

export interface NormalizedTx extends Tx {
  coin: string;
  inputs: NormalizedInput[];
  outputs: NormalizedOutput[];
}

export interface AccountBalance {
  legacy: SatoshiBig;
  segwit: SatoshiBig;
  nativeSegwit: SatoshiBig;
}

export interface FeeAmountData {
  slow: SatoshiBig;
  average: SatoshiBig;
  fast: SatoshiBig;
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

declare global {
  interface Navigator {
      brave: unknown;
  }
}
