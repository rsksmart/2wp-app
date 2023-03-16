import { PegStatus } from '@/store/constants';
import SatoshiBig from '@/types/SatoshiBig';

export interface RootState {
  [x: string]: any;
  version: string;
}

export interface BtcPeginStatus {
  txId: string;
  creationDate: Date;
  federationAddress: string;
  amountTransferred: number;
  refundAddress: string;
  confirmations: number;
  requiredConfirmation: number;
  fees: number;
}

export interface RskPeginStatus {
  recipientAddress: string;
  confirmations: number;
  createOn: Date;
}

export interface PeginStatus {
  btc: BtcPeginStatus;
  rsk: RskPeginStatus;
  status: PegStatus;
}

export enum PegoutStatus {
  RECEIVED = 'RECEIVED',
  REJECTED = 'REJECTED',
  WAITING_FOR_CONFIRMATION = 'WAITING_FOR_CONFIRMATION',
  WAITING_FOR_SIGNATURE = 'WAITING_FOR_SIGNATURE',
  RELEASE_BTC = 'RELEASE_BTC',
  NOT_FOUND = 'NOT_FOUND',
  NOT_PEGOUT_TX = 'NOT_PEGOUT_TX'
}

export interface PegoutStatusDataModel {
  originatingRskTxHash: string;
  rskTxHash: string;
  rskSenderAddress: string;
  btcRecipientAddress: string;
  valueRequestedInSatoshis: number;
  valueInSatoshisToBeReceived: number;
  feeInSatoshisToBePaid?: number;
  status: PegoutStatus;
  btcRawTransaction: string;
  fees: number;
  estimatedFee: SatoshiBig;
}

export enum TxStatusType {
  PEGIN = 'PEGIN',
  PEGOUT = 'PEGOUT',
  INVALID_DATA = 'INVALID_DATA',
  UNEXPECTED_ERROR = 'UNEXPECTED_ERROR',
  UNSET_STATUS = 'UNSET_STATUS',
}

export interface TxStatus {
  txDetails?: PeginStatus | PegoutStatusDataModel;
  type: TxStatusType;
  pegOutEstimatedFee: SatoshiBig;
}
