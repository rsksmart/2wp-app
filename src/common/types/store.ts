import { Duration } from 'moment/moment';
import { PegStatus, RejectedPegoutReasons } from '@/common/store/constants';
import SatoshiBig from '@/common/types/SatoshiBig';
import { PegInTxState } from '@/common/types/pegInTx';
import { SessionState } from '@/common/types/session';
import { PegOutTxState } from '@/common/types/pegOutTx';
import { FlyoverPeginState } from '@/common/types/Flyover/FlyoverPegin';
import { FlyoverPegoutState } from '@/common/types/Flyover/FlyoverPegout';
import { StatusState } from '@/common/types/Status';
import { PeginQuoteDTO2WP, PegoutQuoteDTO2WP } from './Flyover';

export interface RootState {
  pegInTx?: PegInTxState,
  web3Session?: SessionState,
  pegOutTx?: PegOutTxState,
  version: string;
  status?: StatusState;
  flyoverPegin?: FlyoverPeginState;
  flyoverPegout?: FlyoverPegoutState;
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
  senderAddress: string;
}

export enum RskStatus {
  LOCKED = 'LOCKED',
  REJECTED_NO_REFUND = 'REJECTED_NO_REFUND',
  REJECTED_REFUND = 'REJECTED_REFUND',
}

export interface RskPeginStatus {
  recipientAddress: string;
  confirmations: number;
  createOn: Date;
  status: RskStatus;
}

export interface PeginStatus {
  btc: BtcPeginStatus;
  rsk: RskPeginStatus;
  status: PegStatus;
}

export enum PegoutStatus {
  PENDING = 'PENDING',
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
  btcTxId: string;
  reason?: RejectedPegoutReasons;
}

export interface FlyoverStatusModel {
  txHash: string;
  type: string;
  date: Date;
  amount: number;
  fee: number;
  blockToBeFinished: number;
  status: string;
  senderAddress: string;
  recipientAddress: string;
  quoteHash: string;
  aceptedQuoteSignature: string;
  quote: PeginQuoteDTO2WP | PegoutQuoteDTO2WP;
}

export enum TxStatusType {
  PEGIN = 'PEGIN',
  PEGOUT = 'PEGOUT',
  FLYOVER_PEGIN = 'FLYOVER_PEGIN',
  FLYOVER_PEGOUT = 'FLYOVER_PEGOUT',
  INVALID_DATA = 'INVALID_DATA',
  UNEXPECTED_ERROR = 'UNEXPECTED_ERROR',
  UNSET_STATUS = 'UNSET_STATUS',
  NOT_FOUND = 'NOT_FOUND',
  BLOCKBOOK_FAILED = 'BLOCKBOOK_FAILED',
}

export enum TxStatusStep {
  EMPTY = '',
  IN_PROGRESS = 'In progress',
  COMPLETED = 'Completed',
  FAILED = 'Failed',
}

export interface TxStatus {
  txDetails?: PeginStatus | PegoutStatusDataModel | FlyoverStatusModel;
  type: TxStatusType;
  pegOutEstimatedFee: SatoshiBig;
  estimatedReleaseTimeInMinutes: Duration;
  flyoverStatus?: { status: string, txId: string };
}
