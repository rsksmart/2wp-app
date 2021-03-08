import { Tx } from '@/services/types';

export default abstract class TxSigner {
  public abstract sign(tx: Tx): Promise<boolean>;
}
