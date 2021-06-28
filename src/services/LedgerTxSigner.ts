import TxSigner from '@/services/TxSigner';
import { LedgerTx, Tx } from '@/services/types';
import LedgerService from '@/services/LedgerService';
import * as constants from '@/store/constants';

export default class LedgerTxSigner extends TxSigner {
  // eslint-disable-next-line class-methods-use-this,@typescript-eslint/no-unused-vars
  sign(tx: Tx): Promise<{ signedTx: string }> {
    const ledgerTx = tx as LedgerTx;
    const coin = process.env.VUE_APP_COIN ?? constants.BTC_NETWORK_TESTNET;
    const ledgerService = new LedgerService(coin);
    return new Promise<{ signedTx: string }>((resolve, reject) => {
      switch (ledgerTx.accountType) {
        case constants.BITCOIN_LEGACY_ADDRESS:
          LedgerService.signTx(ledgerTx)
            .then((signedTx) => resolve({ signedTx }))
            .catch(reject);
          break;
        case constants.BITCOIN_SEGWIT_ADDRESS:
          ledgerService.signSegwitTx(ledgerTx)
            .then((signedTx) => resolve({ signedTx }))
            .catch(reject);
          break;
        default:
          LedgerService.signTx(ledgerTx)
            .then((signedTx) => resolve({ signedTx }))
            .catch(reject);
      }
    });
  }
}
