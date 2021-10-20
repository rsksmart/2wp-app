import { LedgerSignedTx, TrezorSignedTx, Tx } from '@/types';
import * as constants from '@/store/constants';
import { EnvironmentAccessorService } from '@/services/enviroment-accessor.service';

export default abstract class TxSigner {
  protected coin: string;

  constructor() {
    this.coin = EnvironmentAccessorService.getEnvironmentVariables().vueAppCoin;
  }

  public abstract sign(tx: Tx): Promise<TrezorSignedTx | LedgerSignedTx>;

  public abstract getRawTx(tx: Tx): string;
}
