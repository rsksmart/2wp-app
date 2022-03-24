// eslint-disable-next-line import/no-cycle
import { SatoshiBig } from '@/types';

export interface Tx {
  coin: string;
  // eslint-disable-next-line @typescript-eslint/ban-types
  inputs: object[];
  // eslint-disable-next-line @typescript-eslint/ban-types
  outputs: object[];
}

export interface NormalizedInput {
  address: string;
  // eslint-disable-next-line camelcase
  prev_hash: string;
  amount: string;
  // eslint-disable-next-line camelcase
  address_n: number[];
  // eslint-disable-next-line camelcase
  prev_index: number;
  // eslint-disable-next-line camelcase
  script_type?: string;
  sequence?: number;
}

export interface NormalizedOutput {
  address?: string;
  // eslint-disable-next-line camelcase
  address_n?: number[];
  amount: string;
  serializedValue?: string;
  // eslint-disable-next-line camelcase
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

export type AppNetwork = 'main' | 'test';

declare global {
  interface Navigator {
      brave: unknown;
  }
}
