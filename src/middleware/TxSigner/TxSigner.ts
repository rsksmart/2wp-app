import { LedgerSignedTx, TrezorSignedTx, Tx } from '@/types';
import * as constants from '@/store/constants';

export default abstract class TxSigner {
  protected coin: string;

  constructor() {
    this.coin = process.env.VUE_APP_COIN ?? constants.BTC_NETWORK_TESTNET;
  }

  public abstract sign(tx: Tx): Promise<TrezorSignedTx | LedgerSignedTx>;

  public abstract getRawTx(tx: Tx): string;
}
