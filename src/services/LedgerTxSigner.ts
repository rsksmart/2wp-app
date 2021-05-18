import TxSigner from '@/services/TxSigner';
import { Tx } from '@/services/types';

export default class LedgerTxSigner extends TxSigner {
  // eslint-disable-next-line class-methods-use-this,@typescript-eslint/no-unused-vars
  sign(tx: Tx): Promise<object> {
    return Promise.resolve({});
  }
}
