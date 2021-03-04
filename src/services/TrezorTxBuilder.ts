import TxBuilder from '@/services/TxBuilder';
import TrezorTxSigner from '@/services/TrezorTxSigner';
import { Utxo } from '@/store/peginTx/types';
import TrezorService from '@/services/TrezorService';
import {
  NormalizedInput, NormalizedOutput, NormalizedTx, Tx,
} from '@/services/types';
import { TransactionInput } from 'trezor-connect';

export default class TrezorTxBuilder extends TxBuilder {
  private trezorService: TrezorService;

  constructor() {
    super();
    this.signer = new TrezorTxSigner();
    this.trezorService = new TrezorService(process.env.VUE_APP_COIN ?? 'test');
  }

  // eslint-disable-next-line class-methods-use-this
  buildTx(apiTx: NormalizedTx): Promise<Tx> {
    return new Promise((resolve, reject) => {
      const inputs: TransactionInput[] = [];
      const utxoIdx = 0;
      // let difference = Infinity;
      // utxoList.forEach((utxo , idx) => {
      // difference = (utxo.amount - amount) < difference  && utxo.amount > amount? (utxo
      // .amount - amount) : difference;
      // });
      resolve({
        coin: 'string',
        inputs,
        outputs: [],
      });
    });
  }

  // eslint-disable-next-line class-methods-use-this
  apiCreatePeginTx(utxoList: Utxo[], amount: number, feeLevel: string,
    recipient: string, refundAddress: string): Promise<NormalizedTx> {
    return new Promise((resolve, reject) => {
      const inputs: NormalizedInput[] = [];
      const outputs: NormalizedOutput[] = [];
      const opReturnData = '';
      // get fee
      // pick inputs based on amount and fee
      // select change path if applies
      // set the op return data
      // select the outputs
      resolve({
        coin: process.env.VUE_APP_COIN ?? 'test',
        inputs,
        outputs,
        opReturnData,
      });
    });
  }
}
