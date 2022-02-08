import { TrezorSignedTx } from '@/types/Trezor';
import { LedgerSignedTx } from '@/types/Ledger';

export type SignedTx = TrezorSignedTx | LedgerSignedTx;
