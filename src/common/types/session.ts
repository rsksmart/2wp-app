import RLogin from '@rsksmart/rlogin';
import Web3 from 'web3';
import WeiBig from '@/common/types/WeiBig';
import WalletConnectProvider from '@walletconnect/web3-provider';

export type TransactionType = 'PEG_IN_TRANSACTION_TYPE' | 'PEG_OUT_TRANSACTION_TYPE' | undefined;

export interface SessionState {
  enabled: boolean;
  account?: string;
  web3?: Web3;
  rLogin?: {
    provider: WalletConnectProvider;
    disconnect: () => Promise<void>;
  };
  rLoginInstance?: RLogin;
  txType: TransactionType;
  balance: WeiBig;
  btcDerivedAddress: string;
  bitcoinPrice: number;
  acceptedTerms: boolean;
}
