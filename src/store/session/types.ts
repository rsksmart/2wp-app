import RLogin from '@rsksmart/rlogin';

export type TransactionType = 'PEG_IN' | undefined;

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
