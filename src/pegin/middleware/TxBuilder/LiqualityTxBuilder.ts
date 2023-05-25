import * as bitcoin from 'bitcoinjs-lib';
import TxBuilder from '@/pegin/middleware/TxBuilder/TxBuilder';
import {
  LiqualityInput,
  LiqualityTx, NormalizedInput, NormalizedTx, PsbtExtendedInput,
} from '@/common/types';
import store from '@/common/store';
import * as constants from '@/common/store/constants';
import { ApiService } from '@/common/services';

export default class LiqualityTxBuilder extends TxBuilder {
  buildTx(normalizedTx: NormalizedTx): Promise<LiqualityTx> {
    return new Promise<LiqualityTx>((resolve, reject) => {
      const psbt = new bitcoin.Psbt({ network: this.network });
      LiqualityTxBuilder.getExtendedInputs(normalizedTx.inputs)
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
          const inputs: Array<LiqualityInput> = normalizedTx.inputs
            .map((input, index) => ({
              index,
              derivationPath: LiqualityTxBuilder.getDerivationPathFromAddress(input.address),
            }));
          resolve({
            outputs: normalizedTx.outputs,
            base64UnsignedPsbt: psbt.toBase64(),
            coin: this.coin,
            inputs,
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
