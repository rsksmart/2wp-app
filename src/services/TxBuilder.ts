import TxSigner from '@/services/TxSigner';
import { NormalizedTx, Tx } from '@/services/types';

export default abstract class TxBuilder {
  protected signer!: TxSigner;

  public abstract buildTx(apiTx: NormalizedTx): Promise<Tx>;
}
