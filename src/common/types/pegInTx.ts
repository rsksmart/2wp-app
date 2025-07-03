import { AccountBalance, FeeAmountData, NormalizedTx } from '@/common/types/Common';
import SatoshiBig from '@/common/types/SatoshiBig';
import { WalletService } from '@/common/services';
import * as constants from '@/common/store/constants';

export enum BtcAccount {
  BITCOIN_LEGACY_ADDRESS = 'BITCOIN_LEGACY_ADDRESS',
  BITCOIN_SEGWIT_ADDRESS = 'BITCOIN_SEGWIT_ADDRESS',
  BITCOIN_NATIVE_SEGWIT_ADDRESS = 'BITCOIN_NATIVE_SEGWIT_ADDRESS'
}

export type BtcWallet = 'WALLET_LEDGER' | 'WALLET_TREZOR' | 'WALLET_LEATHER' | 'WALLET_XVERSE' | 'WALLET_ENKRYPT' | 'WALLET_REOWN' | 'WALLET_FIREBLOCKS';

export type MiningSpeedFee = 'BITCOIN_SLOW_FEE_LEVEL' |
  'BITCOIN_AVERAGE_FEE_LEVEL' |
  'BITCOIN_FAST_FEE_LEVEL';

export interface WalletAddress {
  address: string;
  derivationPath: string;
  arrayPath?: number[];
  unused?: boolean;
  publicKey: string;
}

export interface RequestBalance {
  address: string;
}

export interface PeginConfiguration {
  minValue: number; // SatoshiBN
  federationAddress: string;
  feePerKb?: number; // SatoshiBN
  sessionId: string;
  id?: number;
}

export interface Utxo {
  txid: string;
  amount: number; // SatoshiBN
  address?: string;
  vout: number;
  selected: boolean;
}

export interface UtxoListPerAccount {
  legacy: Utxo[],
  segwit: Utxo[],
  nativeSegwit: Utxo[],
}

export interface PegInTxState {
  utxoList: UtxoListPerAccount;
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
  currentView: string;
  statusInfo: {
    txId: string;
    refundAddress: string;
    safeFee: SatoshiBig;
  }
  peginType: constants.peginType;
  maxFee: SatoshiBig;
}

export interface UnusedWalletAddress {
  address: string;
  path: number[];
  transfer: number;
}
