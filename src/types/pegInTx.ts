// eslint-disable-next-line import/no-cycle
import {
  AccountBalance, FeeAmountData, NormalizedTx, SatoshiBig,
} from '@/types';
import { WalletService } from '@/services';

export type BtcAccount = 'BITCOIN_LEGACY_ADDRESS' |
  'BITCOIN_SEGWIT_ADDRESS' |
  'BITCOIN_NATIVE_SEGWIT_ADDRESS';

export type BtcWallet = 'WALLET_LEDGER' |
  'WALLET_TREZOR';

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
  sessionId: string;
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
  bitcoinWallet?: BtcWallet;
  selectedAccount?: BtcAccount;
  bitcoinPrice: number;
  calculatedFees: FeeAmountData;
  loadingFee: boolean;
  selectedFee: MiningSpeedFee;
  amountToTransfer: SatoshiBig;
  isValidAmountToTransfer: boolean;
  rskAddressSelected: string;
  normalizedTx: NormalizedTx;
  walletService?: WalletService,
  walletDataReady: boolean;
}

export interface UnusedWalletAddress {
  address: string;
  path: number[];
  transfer: number;
}
