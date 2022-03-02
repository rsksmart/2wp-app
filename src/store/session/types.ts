import RLogin from '@rsksmart/rlogin';

export type TransactionType = 'PEG_IN_TRANSACTION_TYPE' | 'PEG_OUT_TRANSACTION_TYPE' | undefined;

export interface SessionState {
  enabled: boolean;
  account?: string;
  web3?: object;
  rLogin?: {
    disconnect: () => Promise<void>;
  };
  rLoginInstance?: RLogin;
  txType: TransactionType;
}
