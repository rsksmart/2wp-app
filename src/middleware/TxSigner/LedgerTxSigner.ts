import { LedgerSignedTx, LedgerTx, Tx } from '@/types';
import LedgerService from '@/services/LedgerService';
import TxSigner from './TxSigner';

export default class LedgerTxSigner extends TxSigner {
  // eslint-disable-next-line class-methods-use-this,@typescript-eslint/no-unused-vars
  sign(tx: Tx): Promise<LedgerSignedTx> {
    const ledgerTx = tx as LedgerTx;
    return new Promise<LedgerSignedTx>((resolve, reject) => {
      LedgerService.signTx(ledgerTx)
        .then((signedTx) => resolve({ signedTx }))
        .catch(reject);
    });
  }
}
