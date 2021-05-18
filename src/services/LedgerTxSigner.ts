import TxSigner from '@/services/TxSigner';
import { LedgerTx, Tx } from '@/services/types';

export default class LedgerTxSigner extends TxSigner {
  // eslint-disable-next-line class-methods-use-this,@typescript-eslint/no-unused-vars
  sign(tx: Tx): Promise<object> {
    const ledgerTx = tx as LedgerTx;
    return Promise.resolve({});
  }
}
