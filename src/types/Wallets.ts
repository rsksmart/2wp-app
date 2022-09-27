import { TrezorSignedTx } from '@/types/Trezor';
import { LedgerSignedTx } from '@/types/Ledger';
import { LiqualitySignedTx } from '@/types/Liquality';

export type SignedTx = TrezorSignedTx | LedgerSignedTx | LiqualitySignedTx;

// eslint-disable-next-line no-shadow
export enum Purpose {
  P2PKH = '44',
  P2SH = '49',
  P2WPKH = '84',
}

export interface AddressCount {
  external: { lastIndex: number; count: number; };
  change: { lastIndex: number; count: number; };
}
export interface WalletCount {
  legacy: AddressCount;
  segwit: AddressCount;
  nativeSegwit: AddressCount;
}
