import TrezorService from '@/services/TrezorService';
import {
  TrezorSignedTx, Tx,
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
}
