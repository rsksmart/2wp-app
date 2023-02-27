import SatoshiBig from '@/types/SatoshiBig';

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

export interface Fee {
  amount: number;
  enoughBalance: boolean;
}
export interface FeeAmountDataResponse {
  slow: Fee;
  average: Fee;
  fast: Fee;
}

export interface FeeAmountData {
  slow: { amount: SatoshiBig, enoughBalance: boolean };
  average: { amount: SatoshiBig, enoughBalance: boolean };
  fast: { amount: SatoshiBig, enoughBalance: boolean };
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

export interface TxStatusMessage {
  statusMessage: string,
  activeMessageStyle: string,
  isRejected: boolean,
  error: boolean,
  errorMessage: string;
}

export interface AddressStatus {
  address: string;
  unused: boolean;
}

export type SendBitcoinState = 'idle' | 'loading' | 'error';

export type AppNetwork = 'main' | 'test';

declare global {
  interface Navigator {
      brave: unknown;
  }
}
export interface PsbtExtendedInput {
  hash: string;
  index: number;
  witnessUtxo: {
    value: number;
    script: Buffer;
  };
}

export interface NormalizedSummary {
  amountFromString: string;
  amountReceivedString: string;
  fee: number;
  recipientAddress: string;
  senderAddress?: string;
  txId?: string;
  gas?: number;
  refundAddress?: string;
  selectedAccount?: string;
  federationAddress?: string;
}
