import TxBuilder from '@/services/TxBuilder';
import TrezorTxSigner from '@/services/TrezorTxSigner';
import { Utxo } from '@/store/peginTx/types';
import TrezorService from '@/services/TrezorService';
import {
  InputScriptType,
  NormalizedInput, NormalizedOutput, NormalizedTx, TrezorTx, Tx,
} from '@/services/types';
import { TransactionInput, TransactionOutput } from 'trezor-connect';

export default class TrezorTxBuilder extends TxBuilder {
  private tx!: TrezorTx;

  constructor() {
    super();
    this.signer = new TrezorTxSigner();
  }

  // eslint-disable-next-line class-methods-use-this
  buildTx(normalizedTx: NormalizedTx): Promise<TrezorTx> {
    return new Promise<TrezorTx>((resolve, reject) => {
      const inputs: TransactionInput[] = [];
      const coin = process.env.VUE_APP_COIN ?? 'test';
      const utxoIdx = 0;
      const tx = {
        coin,
        inputs: normalizedTx.inputs.map((input) => ({
          // eslint-disable-next-line @typescript-eslint/camelcase
          address_n: [0], // TODO
          // eslint-disable-next-line @typescript-eslint/camelcase
          prev_hash: input.prev_hash,
          // eslint-disable-next-line @typescript-eslint/camelcase
          prev_index: input.prev_index,
          // eslint-disable-next-line @typescript-eslint/camelcase
          // script_type: this.getScriptType(input.script_type), TODO
          amount: input.amount,
        })),
        outputs: TrezorTxBuilder.getOutputs(normalizedTx.outputs),
      };
      this.tx = tx;
      resolve(tx);
    });
  }

  static getOutputs(outputs: NormalizedOutput[]): TransactionOutput[] {
    return outputs.map((output) => {
      if (output.op_return_data) {
        return {
          amount: '0',
          // eslint-disable-next-line @typescript-eslint/camelcase
          op_return_data: output.op_return_data,
          // eslint-disable-next-line @typescript-eslint/camelcase
          script_type: 'PAYTOOPRETURN',
        };
      }
      return {
        address: output.address ?? '',
        // eslint-disable-next-line @typescript-eslint/camelcase
        script_type: 'PAYTOADDRESS',
        amount: output.amount,
      };
    });
  }
}
