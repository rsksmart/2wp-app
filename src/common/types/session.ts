import RLogin from '@rsksmart/rlogin';
import WeiBig from '@/common/types/WeiBig';
import WalletConnectProvider from '@walletconnect/web3-provider';
import { providers } from 'ethers';
import { Feature } from './Feature';

export type TransactionType = 'PEG_IN_TRANSACTION_TYPE' | 'PEG_OUT_TRANSACTION_TYPE' | undefined;

export interface SessionState {
  enabled: boolean;
  account?: string;
  ethersProvider?: providers.Web3Provider;
  rLogin?: {
    provider: WalletConnectProvider;
    disconnect: () => Promise<void>;
  };
  rLoginInstance?: RLogin;
  txType: TransactionType;
  balance: WeiBig;
  btcDerivedAddress: string;
  bitcoinPrice: number;
  acceptedTerms?: boolean;
  features: Array<Feature>;
  apiVersion: string;
}
