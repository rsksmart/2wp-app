import SatoshiBig from '@/common/types/SatoshiBig';
import { Utxo } from '@/common/types/pegInTx';
import { PegoutStatus } from '@/common/types/store';
import { PegStatus } from '@/common/store/constants';
import WeiBig from './WeiBig';

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
  prev_index: number;
  // eslint-disable-next-line camelcase
  script_type?: string;
  sequence?: number;
  prevRawTx?: string;
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
  amount: SatoshiBig;
  enoughBalance: boolean;
}
export interface FeeAmountDataResponse {
  slow: Fee;
  average: Fee;
  fast: Fee;
}

interface UtxoList { selectedUtxoList: Utxo[]}

export interface FeeAmountData {
  slow: Fee & UtxoList;
  average: Fee & UtxoList;
  fast: Fee & UtxoList;
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
  fee?: number;
  estimatedFee?: number;
  recipientAddress: string;
  senderAddress?: string;
  txId?: string;
  gas?: WeiBig;
  refundAddress?: string;
  selectedAccount?: string;
  federationAddress?: string;
  total?: string;
  status?: PegStatus | PegoutStatus;
}

export type AddressType = 'BITCOIN_LEGACY_ADDRESS' | 'BITCOIN_SEGWIT_ADDRESS' | 'BITCOIN_NATIVE_SEGWIT_ADDRESS' |
 'BITCOIN_MULTISIGNATURE_ADDRESS' | 'BITCOIN_UNKNOWN_ADDRESS_TYPE';

export interface ObjectDifference {
  key: string;
  oldValue: unknown;
  newValue: unknown;
}

export enum AppLocale {
  LOCALE_EN = 'en',
  LOCALE_ES = 'es',
}
