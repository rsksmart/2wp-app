import { TxInputType, TxOutputType } from 'trezor-connect';
import { WalletAddress } from '@/types/pegInTx';
import {
  NormalizedInput, NormalizedOutput, TrezorTx,
} from '@/types';
import { getAccountType } from '@/services/utils';
import store from '@/store';
import * as constants from '@/store/constants';
import TxBuilder from './TxBuilder';
import { EnvironmentAccessorService } from '@/services/enviroment-accessor.service';

export default class TrezorTxBuilder extends TxBuilder {
  private tx!: TrezorTx;

  buildTx(): Promise<TrezorTx> {
    return new Promise<TrezorTx>((resolve, reject) => {
      const { coin } = this;
      if (this.normalizedTx) {
        const tx = {
          coin,
          inputs: TrezorTxBuilder.getInputs(this.normalizedTx.inputs),
          outputs: TrezorTxBuilder.getOutputs(this.normalizedTx.outputs),
          version: constants.BITCOIN_TX_VERSION,
        };
        this.tx = tx;
        resolve(tx);
      } else {
        reject(new Error('There is no Normalized transaction created'));
      }
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

  private static getInputs(inputs: NormalizedInput[]): TxInputType[] {
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
      if (walletAddress.address === address) path = walletAddress.path;
    });
    return path;
  }

  private static getScriptType(address: string): 'SPENDP2SHWITNESS' | 'SPENDADDRESS' | 'SPENDWITNESS' {
    const accType = getAccountType(
      address,
      EnvironmentAccessorService.getEnvironmentVariables().vueAppCoin,
    );
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
