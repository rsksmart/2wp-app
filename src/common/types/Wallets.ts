import { TrezorSignedTx } from '@/common/types/Trezor';
import { LedgerSignedTx } from '@/common/types/Ledger';
import { LiqualitySignedTx } from '@/common/types/Liquality';

export type SignedTx = TrezorSignedTx | LedgerSignedTx | LiqualitySignedTx;

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
