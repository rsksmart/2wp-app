import { TrezorSignedTx } from '@/types/Trezor';
import { LedgerSignedTx } from '@/types/Ledger';
import { LiqualitySignedTx } from '@/types/Liquality';

export type SignedTx = TrezorSignedTx | LedgerSignedTx | LiqualitySignedTx;
