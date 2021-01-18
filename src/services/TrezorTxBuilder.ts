import TxBuilder from '@/services/TxBuilder';
import TrezorTxSigner from '@/services/TrezorTxSigner';
import {TransactionSummary, Utxo} from '@/store/peginTx/types';
import TrezorService from '@/services/TrezorService';
import {TrezorTx, Tx} from "@/services/types";

export default class TrezorTxBuilder extends TxBuilder{
  private trezorService: TrezorService;

  constructor() {
    super();
    this.signer = new TrezorTxSigner();
    this.trezorService = new TrezorService(process.env.VUE_APP_COIN ?? 'test');
  }

  buildTx(utxoList: Utxo[]): Promise<Tx> {
    return new Promise((resolve, reject) => {
      resolve({
        coin: 'string',
        inputs: [],
        outputs: [],
      });
    });
  }

}
