import TrezorService from '@/services/TrezorService';
import {
  TrezorSignedTx, TrezorTx, Tx,
} from '@/types';
import TxSigner from './TxSigner';

export default class TrezorTxSigner extends TxSigner {
  private trezorService: TrezorService;

  constructor() {
    super();
    this.trezorService = new TrezorService(this.coin);
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
    const trezorTx = tx as TrezorTx;
    return this.trezorService.getUnsignedRawTx(trezorTx);
  }
}
