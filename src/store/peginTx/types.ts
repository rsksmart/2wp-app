import { AccountBalance, FeeAmountData } from '@/types';
import SatoshiBig from '@/types/SatoshiBig';

export type BtcAccount = 'BITCOIN_LEGACY_ADDRESS' |
  'BITCOIN_SEGWIT_ADDRESS' |
  'BITCOIN_NATIVE_SEGWIT_ADDRESS';

export type MiningSpeedFee = 'BITCOIN_SLOW_FEE_LEVEL' |
  'BITCOIN_AVERAGE_FEE_LEVEL' |
  'BITCOIN_FAST_FEE_LEVEL';

export interface WalletAddress {
  address: string;
  serializedPath: string;
  path: number[];
  publicKey?: string;
}

export interface PeginConfiguration {
  minValue: number; // SatoshiBN
  maxValue: number; // SatoshiBN
  federationAddress: string;
  feePerKb?: number; // SatoshiBN
  btcConfirmations: number;
  sessionId?: string;
  id?: number;
}

export interface Utxo {
  txid: string;
  amount: number; // SatoshiBN
  address?: string;
  path: string;
  derivationArray: number[];
  vout: number;
}

export interface PegInTxState {
  utxoList?: Utxo[];
  addressList?: WalletAddress[];
  balances: AccountBalance;
  loadingBalance: boolean;
  trezorConnected: boolean;
  peginConfiguration: PeginConfiguration;
  sessionId: string;
  bitcoinWallet: string;
  selectedAccount?: BtcAccount;
  bitcoinPrice: number;
  calculatedFees: FeeAmountData;
  selectedFee: MiningSpeedFee;
  amountToTransfer: SatoshiBig;
  rskAddressSelected: string;
}

export interface UnusedWalletAddress {
  address: string;
  path: number[];
  transfer: number;
}

export interface TransactionSummary {
  amount: number;
  destinationAddress: string;
  fee: number;
  totalAmount: number;
  refundAddress: string;
}
