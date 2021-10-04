import TrezorService from '@/services/TrezorService';
import {
  TrezorSignedTx, TrezorTx, Tx,
} from '@/types';
import * as constants from '@/store/constants';
import TxSigner from './TxSigner';

export default class TrezorTxSigner extends TxSigner {
  private trezorService: TrezorService;

  constructor() {
    super();
    this.trezorService = new TrezorService(
      process.env.VUE_APP_COIN ?? constants.BTC_NETWORK_TESTNET,
    );
  }

  public sign(tx: Tx): Promise<TrezorSignedTx> {
    return new Promise<TrezorSignedTx>((resolve, reject) => {
      this.trezorService.sign(tx)
        .then(resolve)
        .catch(reject);
    });
  }

  // eslint-disable-next-line class-methods-use-this
  getRawTx(tx: Tx): string {
    const coin = process.env.VUE_APP_COIN ?? constants.BTC_NETWORK_TESTNET;
    const ledgerService = new TrezorService(coin);
    const trezorTx = tx as TrezorTx;
    return ledgerService.getUnsignedRawTx(trezorTx);
  }
}
