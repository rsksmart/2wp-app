// eslint-disable-next-line import/no-cycle
import { TrezorSignedTx, LedgerSignedTx } from '@/types';

export type SignedTx = TrezorSignedTx | LedgerSignedTx;
