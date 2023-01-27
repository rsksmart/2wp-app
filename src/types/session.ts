import RLogin from '@rsksmart/rlogin';
import Web3 from 'web3';
import WeiBig from '@/types/WeiBig';

export type TransactionType = 'PEG_IN_TRANSACTION_TYPE' | 'PEG_OUT_TRANSACTION_TYPE' | undefined;

export interface SessionState {
  enabled: boolean;
  account?: string;
  web3?: Web3;
  rLogin?: {
    disconnect: () => Promise<void>;
  };
  rLoginInstance?: RLogin;
  txType: TransactionType;
  balance: WeiBig;
  btcDerivedAddress?: string;
}
