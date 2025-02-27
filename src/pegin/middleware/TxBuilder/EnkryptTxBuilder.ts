/* eslint-disable class-methods-use-this */
import { ApiService } from '@/common/services';
import {
  Tx,
  NormalizedTx,
  NormalizedInput,
  PsbtExtendedInput,
} from '@/common/types';
import * as bitcoin from 'bitcoinjs-lib';
import TxBuilder from './TxBuilder';

export interface EnkryptTx extends Tx {
  hex: string;
}

export default class EnkryptTxBuilder extends TxBuilder {
  buildTx(normalizedTx: NormalizedTx): Promise<EnkryptTx> {
    return new Promise<EnkryptTx>((resolve, reject) => {
      const psbt = new bitcoin.Psbt({ network: this.network });
      EnkryptTxBuilder.getExtendedInputs(normalizedTx.inputs)
        .then((extendedInputs) => {
          psbt.addInputs(extendedInputs);
          normalizedTx.outputs.forEach((normalizedOutput) => {
            if (normalizedOutput.op_return_data) {
              const buffer = Buffer.from(normalizedOutput.op_return_data, 'hex');
              const script: bitcoin.Payment = bitcoin.payments.embed({ data: [buffer] });
              if (script.output) {
                psbt.addOutput({
                  script: script.output,
                  value: 0,
                });
              }
            } else if (normalizedOutput.address) {
              psbt.addOutput({
                address: normalizedOutput.address,
                value: Number(normalizedOutput.amount),
              });
            }
          });
          const inputs = normalizedTx.inputs
            .map((input) => ({
              address: input.address,
              idx: input.prev_index,
            }));
          resolve({
            coin: this.coin,
            inputs,
            outputs: normalizedTx.outputs,
            hex: psbt.toHex(),
          });
        })
        .catch(reject);
    });
  }

  private static getExtendedInputs(normalizedInputs: Array<NormalizedInput>)
    :Promise<Array<PsbtExtendedInput>> {
    return new Promise<Array<PsbtExtendedInput>>((resolve, reject) => {
      const psbtExtendedInputs: Array<PsbtExtendedInput> = [];
      const hexUtxoPromises = normalizedInputs
        .map((input) => ApiService.getTxHex(input.prev_hash));
      Promise.all(hexUtxoPromises)
        .then((hexUtxos) => {
          normalizedInputs.forEach((normalizedInput, idx) => {
            const utxo = bitcoin.Transaction.fromHex(hexUtxos[idx]);
            psbtExtendedInputs.push({
              hash: normalizedInput.prev_hash,
              index: normalizedInput.prev_index,
              witnessUtxo: {
                value: utxo.outs[normalizedInput.prev_index].value,
                script: utxo.outs[normalizedInput.prev_index].script,
              },
            });
          });
          resolve(psbtExtendedInputs);
        })
        .catch(reject);
    });
  }
}
