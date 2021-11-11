import * as bitcoin from 'bitcoinjs-lib';
import { EnvironmentAccessorService } from '@/services/enviroment-accessor.service';
import TxSigner from '@/middleware/TxSigner/TxSigner';
import { NormalizedTx, Tx } from '@/types';
import * as constants from '@/store/constants';
import ApiService from '@/services/ApiService';

export default abstract class TxBuilder {
  protected signer!: TxSigner;

  protected coin!: string;

  protected network: bitcoin.Network;

  protected normalizedTx!: NormalizedTx;

  protected changeAddr = '';

  protected constructor() {
    this.coin = EnvironmentAccessorService.getEnvironmentVariables().vueAppCoin;
    this.network = this.coin === constants.BTC_NETWORK_MAINNET
      ? bitcoin.networks.bitcoin : bitcoin.networks.testnet;
  }

  public abstract buildTx(): Promise<Tx>;

  get changeAddress(): string {
    return this.changeAddr;
  }

  public getNormalizedTx({
    amountToTransferInSatoshi, refundAddress, recipient, feeLevel, changeAddress, sessionId,
  }:{
    amountToTransferInSatoshi: number;
    refundAddress: string;
    recipient: string;
    feeLevel: string;
    changeAddress: string;
    sessionId: string;
  }): Promise<NormalizedTx> {
    this.changeAddr = changeAddress;
    return new Promise<NormalizedTx>((resolve, reject) => {
      ApiService.createPeginTx(
        amountToTransferInSatoshi, refundAddress, recipient,
        sessionId, feeLevel, changeAddress,
      ).then((normalizedTx: NormalizedTx) => {
        this.normalizedTx = normalizedTx;
        resolve(normalizedTx);
      }).catch(reject);
    });
  }

  public getUnsignedRawTx(): string {
    const txBuilder = new bitcoin.TransactionBuilder(this.network);
    this.normalizedTx.inputs.forEach((input) => {
      txBuilder.addInput(input.prev_hash, input.prev_index);
    });
    this.normalizedTx.outputs.forEach((normalizedOutput) => {
      if (normalizedOutput.op_return_data) {
        const buffer = Buffer.from(normalizedOutput.op_return_data, 'hex');
        const script: bitcoin.Payment = bitcoin.payments.embed({ data: [buffer] });
        if (script.output) {
          txBuilder.addOutput(script.output, 0);
        }
      } else if (normalizedOutput.address) {
        txBuilder.addOutput(normalizedOutput.address, Number(normalizedOutput.amount));
      }
    });
    return txBuilder.buildIncomplete().toHex();
  }
}
