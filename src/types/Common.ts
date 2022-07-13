import { Network } from 'bitcoinjs-lib';
import SatoshiBig from '@/types/SatoshiBig';
import { PeginStatus } from '@/store/types';

export interface Tx {
  coin: string;
  inputs: object[];
  outputs: object[];
}

export interface NormalizedTx extends Tx {
  coin: string;
  inputs: NormalizedInput[];
  outputs: NormalizedOutput[];
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

export enum PegoutStatusStates {
  RECEIVED = 'RECEIVED',
  REJECTED = 'REJECTED',
  WAITING_FOR_CONFIRMATION = 'WAITING_FOR_CONFIRMATION',
  WAITING_FOR_SIGNATURE = 'WAITING_FOR_SIGNATURE',
  SIGNED = 'SIGNED',
  NOT_FOUND = 'NOT_FOUND',
  PENDING = 'PENDING',
  NOT_PEGOUT_TX = 'NOT_PEGOUT_TX'
}

export enum TxStatusType {
  PEGIN = 'PEGIN',
  PEGOUT = 'PEGOUT',
  INVALID_DATA = 'INVALID_DATA',
  UNEXPECTED_ERROR = 'UNEXPECTED_ERROR',
}

export interface PegoutStatus {
  originatingRskTxHash: string;
  rskTxHash: string;
  rskSenderAddress: string;
  btcRecipientAddress: string;
  valueRequestedInSatoshis: number;
  valueInSatoshisToBeReceived: number;
  feeInSatoshisToBePaid: number;
  status: PegoutStatusStates;
  btcRawTransaction: string;
}

export interface TxStatus {
  txDetails?: PeginStatus | PegoutStatus;
  type: TxStatusType;
}

export type SendBitcoinState = 'idle' | 'loading' | 'error';
