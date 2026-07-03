import { PROTO, RefTransaction } from '@trezor/connect-web';
import * as bitcoin from 'bitcoinjs-lib';
import { WalletAddress } from '@/common/types/pegInTx';
import {
  InputScriptType,
  NormalizedInput, NormalizedOutput, NormalizedTx, TrezorTx,
} from '@/common/types';
import { getAccountType } from '@/common/utils';
import { ApiService } from '@/common/services';
import * as constants from '@/common/store/constants';
import store from '@/common/store';
import TxBuilder from './TxBuilder';

export default class TrezorTxBuilder extends TxBuilder {
  private tx!: TrezorTx;

  buildTx(normalizedTx: NormalizedTx): Promise<TrezorTx> {
    const { coin } = this;
    return TrezorTxBuilder.buildRefTxs(normalizedTx.inputs)
      .then((refTxs) => {
        const tx: TrezorTx = {
          coin,
          inputs: this.getInputs(normalizedTx.inputs),
          outputs: TrezorTxBuilder.getOutputs(normalizedTx.outputs),
          version: constants.BITCOIN_TX_VERSION,
          refTxs,
        };
        this.tx = tx;
        return tx;
      });
  }

  private static async buildRefTxs(inputs: NormalizedInput[]): Promise<RefTransaction[]> {
    const byHash = new Map<string, string | undefined>();
    inputs.forEach((i) => {
      if (!byHash.has(i.prev_hash)) byHash.set(i.prev_hash, i.prevRawTx);
    });
    const entries = [...byHash.entries()];
    const hexes = await Promise.all(
      entries.map(([hash, raw]) => (raw ? Promise.resolve(raw) : ApiService.getTxHex(hash))),
    );
    return entries.map(([hash], idx) => {
      const tx = bitcoin.Transaction.fromHex(hexes[idx]);
      return {
        hash,
        version: tx.version,
        lock_time: tx.locktime,
        inputs: tx.ins.map((input) => ({
          prev_hash: Buffer.from(input.hash).reverse().toString('hex'),
          prev_index: input.index,
          script_sig: input.script.toString('hex'),
          sequence: input.sequence,
        })),
        bin_outputs: tx.outs.map((output) => ({
          amount: output.value.toString(),
          script_pubkey: output.script.toString('hex'),
        })),
      };
    });
  }

  static getOutputs(outputs: NormalizedOutput[]): PROTO.TxOutputType[] {
    return outputs.map((output) => {
      if (output.op_return_data) {
        return {
          amount: '0',
          op_return_data: output.op_return_data,
          script_type: 'PAYTOOPRETURN',
        };
      }
      return {
        address: output.address ?? '',
        script_type: 'PAYTOADDRESS',
        amount: output.amount,
      };
    });
  }

  private getInputs(inputs: NormalizedInput[]): PROTO.TxInputType[] {
    return inputs.map((input) => ({
      address_n: TrezorTxBuilder.getPathFromAddress(input.address),
      prev_hash: input.prev_hash,
      prev_index: input.prev_index,
      script_type: this.getScriptType(input.address),
      amount: input.amount.toString(),
    }));
  }

  static getPathFromAddress(address: string): number[] {
    const addressList = store.state.pegInTx?.addressList as WalletAddress[];
    let path: number[] = [];
    addressList.forEach((walletAddress) => {
      if (walletAddress.address === address) {
        path = JSON.parse(JSON.stringify(walletAddress.arrayPath)) ?? [];
      }
    });
    return path;
  }

  private getScriptType(address: string): InputScriptType {
    const accType = getAccountType(address, this.coin);
    switch (accType) {
      case constants.BITCOIN_SEGWIT_ADDRESS:
        return 'SPENDP2SHWITNESS';
      case constants.BITCOIN_LEGACY_ADDRESS:
        return 'SPENDADDRESS';
      case constants.BITCOIN_NATIVE_SEGWIT_ADDRESS:
        return 'SPENDWITNESS';
      default:
        return 'SPENDADDRESS';
    }
  }
}
