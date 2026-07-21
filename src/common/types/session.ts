import RLogin from '@rsksmart/rlogin';
import WeiBig from '@/common/types/WeiBig';
import { providers } from 'ethers';
import { Feature } from './Feature';

export type TransactionType = 'PEG_IN_TRANSACTION_TYPE' | 'PEG_OUT_TRANSACTION_TYPE' | undefined;

type RLoginProvider = providers.ExternalProvider & {
  isLedger?: boolean;
  isTrezor?: boolean;
};

export interface SessionState {
  enabled: boolean;
  account?: string;
  ethersProvider?: providers.Web3Provider;
  rLogin?: {
    provider: RLoginProvider;
    disconnect: () => Promise<void>;
  };
  rLoginInstance?: RLogin;
  connectedWalletName?: string;
  txType: TransactionType;
  balance: WeiBig;
  btcDerivedAddress: string;
  bitcoinPrice: number;
  acceptedTerms?: boolean;
  features: Array<Feature>;
  apiVersion: string;
  grecaptchaCountdown: number;
  grecaptchaIntervalId: number | undefined;
}
