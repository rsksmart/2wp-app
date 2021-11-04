import RLogin from '@rsksmart/rlogin';

export type Peg = 'PEG_IN' | 'PEG_OUT' | undefined;

export interface SessionState {
  enabled: boolean;
  account?: string;
  web3?: object;
  rLogin?: {
    disconnect: () => Promise<void>;
  };
  rLoginInstance?: RLogin;
  peg: Peg;
}
