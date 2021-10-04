import { LedgerSignedTx, TrezorSignedTx, Tx } from '@/types';

export default abstract class TxSigner {
  public abstract sign(tx: Tx): Promise<TrezorSignedTx | LedgerSignedTx>;

  public abstract getRawTx(tx: Tx): string;
}
