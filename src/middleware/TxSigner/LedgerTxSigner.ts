import { LedgerSignedTx, LedgerTx, Tx } from '@/types';
import LedgerService from '@/services/LedgerService';
import * as constants from '@/store/constants';
import TxSigner from './TxSigner';

export default class LedgerTxSigner extends TxSigner {
  private ledgerService: LedgerService;

  constructor() {
    super();
    this.ledgerService = new LedgerService(this.coin);
  }

  // eslint-disable-next-line class-methods-use-this,@typescript-eslint/no-unused-vars
  sign(tx: Tx): Promise<LedgerSignedTx> {
    const ledgerTx = tx as LedgerTx;
    const coin = process.env.VUE_APP_COIN ?? constants.BTC_NETWORK_TESTNET;
    const ledgerService = new LedgerService(coin);
    return new Promise<LedgerSignedTx>((resolve, reject) => {
      switch (ledgerTx.accountType) {
        case constants.BITCOIN_SEGWIT_ADDRESS:
          ledgerService.signSegwitTx(ledgerTx)
            .then((signedTx) => resolve({ signedTx }))
            .catch(reject);
          break;
        case constants.BITCOIN_LEGACY_ADDRESS:
        default:
          LedgerService.signTx(ledgerTx)
            .then((signedTx) => resolve({ signedTx }))
            .catch(reject);
      }
    });
  }

  // eslint-disable-next-line class-methods-use-this
  getRawTx(tx: Tx): string {
    const ledgerTx = tx as LedgerTx;
    return this.ledgerService.getUnsignedRawTx(ledgerTx);
  }
}
