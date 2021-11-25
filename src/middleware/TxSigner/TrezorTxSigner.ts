import TrezorService from '@/services/TrezorService';
import {
  TrezorSignedTx, Tx,
} from '@/types';
import TxSigner from './TxSigner';

export default class TrezorTxSigner extends TxSigner {
  public sign(tx: Tx): Promise<TrezorSignedTx> {
    return new Promise<TrezorSignedTx>((resolve, reject) => {
      const trezorService: TrezorService = new TrezorService(this.coin);
      trezorService.sign(tx)
        .then(resolve)
        .catch(reject);
    });
  }
}
