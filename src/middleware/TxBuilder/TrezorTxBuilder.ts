import { TxInputType, TxOutputType } from 'trezor-connect';
import { WalletAddress } from '@/types/pegInTx';
import {
  InputScriptType,
  NormalizedInput, NormalizedOutput, NormalizedTx, TrezorTx,
} from '@/types';
import { getAccountType } from '@/services/utils';
import * as constants from '@/store/constants';
import store from '../../store';
import TxBuilder from './TxBuilder';

export default class TrezorTxBuilder extends TxBuilder {
  private tx!: TrezorTx;

  buildTx(normalizedTx: NormalizedTx): Promise<TrezorTx> {
    return new Promise<TrezorTx>((resolve) => {
      const { coin } = this;
      const tx = {
        coin,
        inputs: this.getInputs(normalizedTx.inputs),
        outputs: TrezorTxBuilder.getOutputs(normalizedTx.outputs),
        version: constants.BITCOIN_TX_VERSION,
      };
      this.tx = tx;
      resolve(tx);
    });
  }

  static getOutputs(outputs: NormalizedOutput[]): TxOutputType[] {
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

  private getInputs(inputs: NormalizedInput[]): TxInputType[] {
    return inputs.map((input) => ({
      address_n: TrezorTxBuilder.getPathFromAddress(input.address),
      prev_hash: input.prev_hash,
      prev_index: input.prev_index,
      script_type: this.getScriptType(input.address),
      amount: input.amount.toString(),
    }));
  }

  static getPathFromAddress(address: string): number[] {
    const addressList = store.state.pegInTx.addressList as WalletAddress[];
    let path: number[] = [];
    addressList.forEach((walletAddress) => {
      if (walletAddress.address === address) path = walletAddress.arrayPath ?? [];
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
