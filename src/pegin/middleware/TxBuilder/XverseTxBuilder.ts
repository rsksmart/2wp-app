import { ApiService } from '@/common/services';
import store from '@/common/store';
import {
  NormalizedInput, NormalizedTx, PsbtExtendedInput, Tx,
} from '@/common/types';
import * as bitcoin from 'bitcoinjs-lib';
import * as constants from '@/common/store/constants';
import { getP2SHRedeemScript } from '@/common/utils';
import TxBuilder from './TxBuilder';

export interface XverseTx extends Tx {
    base64UnsignedPsbt: string;
    inputs: Array<{idx: number; address: string}>;
}

export default class XverseTxBuilder extends TxBuilder {
  buildTx(normalizedTx: NormalizedTx): Promise<XverseTx> {
    return new Promise<XverseTx>((resolve, reject) => {
      const psbt = new bitcoin.Psbt({ network: this.network });
      this.getExtendedInputs(normalizedTx.inputs)
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
            base64UnsignedPsbt: psbt.toBase64(),
          });
        })
        .catch(reject);
    });
  }

  private getExtendedInputs(normalizedInputs: Array<NormalizedInput>)
    :Promise<Array<PsbtExtendedInput>> {
    return new Promise<Array<PsbtExtendedInput>>((resolve, reject) => {
      const psbtExtendedInputs: Array<PsbtExtendedInput> = [];
      const hexUtxoPromises = normalizedInputs
        .map((input) => ApiService.getTxHex(input.prev_hash));
      Promise.all(hexUtxoPromises)
        .then((hexUtxos) => {
          normalizedInputs.forEach((normalizedInput, idx) => {
            const utxo = bitcoin.Transaction.fromHex(hexUtxos[idx]);
            const pubKey = store.getters[`pegInTx/${constants.PEGIN_TX_GET_ADDRESS_PUBLIC_KEY}`](normalizedInput.address);
            psbtExtendedInputs.push({
              hash: normalizedInput.prev_hash,
              index: normalizedInput.prev_index,
              witnessUtxo: {
                value: utxo.outs[normalizedInput.prev_index].value,
                script: utxo.outs[normalizedInput.prev_index].script,
              },
              redeemScript: getP2SHRedeemScript(pubKey, this.network),
            });
          });
          resolve(psbtExtendedInputs);
        })
        .catch(reject);
    });
  }
}
