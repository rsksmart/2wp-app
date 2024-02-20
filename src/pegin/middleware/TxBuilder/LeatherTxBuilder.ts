import { ApiService } from '@/common/services';
import store from '@/common/store';
import {
  NormalizedInput, NormalizedTx, PsbtExtendedInput, Tx,
} from '@/common/types';
import * as bitcoin from 'bitcoinjs-lib';
import * as constants from '@/common/store/constants';
import TxBuilder from './TxBuilder';

export interface LeatherTx extends Tx {
  hex: string;
}

export default class LeatherTxBuilder extends TxBuilder {
  buildTx(normalizedTx: NormalizedTx): Promise<LeatherTx> {
    return new Promise<LeatherTx>((resolve, reject) => {
      const psbt = new bitcoin.Psbt({ network: this.network });
      LeatherTxBuilder.getExtendedInputs(normalizedTx.inputs)
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
            .map((input, index) => ({
              index,
              derivationPath: LeatherTxBuilder.getDerivationPathFromAddress(input.address),
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

  private static getDerivationPathFromAddress(address: string): string {
    return store.getters[`pegInTx/${constants.PEGIN_TX_GET_DERIVATION_PATH_FROM_ADDRESS}`](address);
  }
}
