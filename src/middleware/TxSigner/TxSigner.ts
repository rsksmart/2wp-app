import { LedgerSignedTx, TrezorSignedTx, Tx } from '@/types';
import * as constants from '@/store/constants';
import { EnvironmentAccessor } from '@/enviroment-accessor';

export default abstract class TxSigner {
  protected coin: string;

  constructor() {
    this.coin = EnvironmentAccessor.getEnvironmentVariables().vueAppCoin;
  }

  public abstract sign(tx: Tx): Promise<TrezorSignedTx | LedgerSignedTx>;

  public abstract getRawTx(tx: Tx): string;
}
