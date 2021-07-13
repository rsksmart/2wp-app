import { PegStatus } from '@/store/constants';

export interface RootState {
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
