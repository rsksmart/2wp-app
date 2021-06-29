import TxSigner from '@/services/TxSigner';
import TrezorService from '@/services/TrezorService';
import { TrezorSignedTx, Tx } from '@/services/types';

export default class TrezorTxSigner extends TxSigner {
  private trezorService: TrezorService;

  constructor() {
    super();
    this.trezorService = new TrezorService(process.env.VUE_APP_COIN ?? 'test');
  }

  public sign(tx: Tx): Promise<TrezorSignedTx> {
    return new Promise<TrezorSignedTx>((resolve, reject) => {
      this.trezorService.sign(tx)
        .then(resolve)
        .catch(reject);
    });
  }
}
