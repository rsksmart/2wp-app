import TxSigner from '@/services/TxSigner';
import { LedgerTx, Tx } from '@/services/types';
import LedgerService from '@/services/LedgerService';

export default class LedgerTxSigner extends TxSigner {
  // eslint-disable-next-line class-methods-use-this,@typescript-eslint/no-unused-vars
  sign(tx: Tx): Promise<{ signedTx: string }> {
    const ledgerTx = tx as LedgerTx;
    return new Promise<{ signedTx: string }>((resolve, reject) => {
      LedgerService.signTx(ledgerTx)
        .then((signedTx) => resolve({ signedTx }))
        .catch(reject);
    });
  }
}
