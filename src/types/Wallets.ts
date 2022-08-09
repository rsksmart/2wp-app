import { TrezorSignedTx } from '@/types/Trezor';
import { LedgerSignedTx } from '@/types/Ledger';

export type SignedTx = TrezorSignedTx | LedgerSignedTx;

// eslint-disable-next-line no-shadow
export enum Purpose {
  P2PKH = '44',
  P2SH = '49',
  P2WPKH = '84',
}

export interface WalletCount {
  legacy: { lastIndex: number; count: number; };
  segwit: { lastIndex: number; count: number; };
  nativeSegwit: { lastIndex: number; count: number; };
}
