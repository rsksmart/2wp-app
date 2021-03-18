import TxBuilder from '@/services/TxBuilder';
import TrezorTxSigner from '@/services/TrezorTxSigner';
import { WalletAddress } from '@/store/peginTx/types';
import {
  NormalizedInput, NormalizedOutput, TrezorSignedTx, TrezorTx,
} from '@/services/types';
import { TransactionInput, TransactionOutput } from 'trezor-connect';
import ApiService from '@/services/ApiService';
import { getAccountType } from '@/services/utils';
import * as constants from '@/store/constants';
import store from '../store';

export default class TrezorTxBuilder extends TxBuilder {
  private tx!: TrezorTx;

  constructor() {
    super();
    this.signer = new TrezorTxSigner();
  }

  buildTx({
    amountToTransferInSatoshi, refundAddress, recipient, feeLevel, changeAddress, sessionId,
  }: {
    amountToTransferInSatoshi: number;
    refundAddress: string;
    recipient: string;
    feeLevel: string;
    changeAddress: string;
    sessionId: string;
  }): Promise<TrezorTx> {
    return new Promise<TrezorTx>((resolve, reject) => {
      const coin = process.env.VUE_APP_COIN ?? 'test';
      ApiService.createPeginTx(
        amountToTransferInSatoshi, refundAddress, recipient, sessionId, feeLevel, changeAddress,
      )
        .then((normalizedTx) => {
          const tx = {
            coin,
            inputs: TrezorTxBuilder.getInputs(normalizedTx.inputs),
            outputs: TrezorTxBuilder.getOutputs(normalizedTx.outputs),
          };
          this.tx = tx;
          console.log(tx);
          resolve(tx);
        })
        .catch(reject);
    });
  }

  public sign(): Promise<TrezorSignedTx> {
    return this.signer.sign(this.tx) as Promise<TrezorSignedTx>;
  }

  static getOutputs(outputs: NormalizedOutput[]): TransactionOutput[] {
    return outputs.map((output) => {
      if (output.op_return_data) {
        return {
          amount: '0',
          // eslint-disable-next-line @typescript-eslint/camelcase
          op_return_data: output.op_return_data,
          // eslint-disable-next-line @typescript-eslint/camelcase,max-len
          // op_return_data: '4f505f52455455524e20353235333462353432323439463433664238433534366664363434353535626534',
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

  private static getInputs(inputs: NormalizedInput[]): TransactionInput[] {
    return inputs.map((input) => ({
      // eslint-disable-next-line @typescript-eslint/camelcase
      address_n: TrezorTxBuilder.getPathFromAddress(input.address),
      // eslint-disable-next-line @typescript-eslint/camelcase
      prev_hash: input.prev_hash,
      // eslint-disable-next-line @typescript-eslint/camelcase
      prev_index: input.prev_index,
      // eslint-disable-next-line @typescript-eslint/camelcase
      script_type: this.getScriptType(input.address),
      amount: input.amount,
    }));
  }

  static getPathFromAddress(address: string): number[] {
    // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
    // @ts-ignore
    const addressList = store.state.pegInTx.addressList as WalletAddress[];
    let path: number[] = [];
    addressList.forEach((walletAddress) => {
      if (walletAddress.address === address) path = walletAddress.path;
    });
    return path;
  }

  private static getScriptType(address: string): 'SPENDP2SHWITNESS' | 'SPENDADDRESS' | 'SPENDWITNESS' {
    const accType = getAccountType(address);
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
