import TxBuilder from '@/services/TxBuilder';
import LedgerTxSigner from '@/services/LedgerTxSigner';
import {
  LedgerjsTransaction,
  LedgerTx, NormalizedInput, NormalizedOutput, NormalizedTx,
} from '@/services/types';
import store from '@/store';
import ApiService from '@/services/ApiService';
import LedgerService from '@/services/LedgerService';
import * as constants from '@/store/constants';
import * as bitcoin from 'bitcoinjs-lib';
import { Payment } from 'bitcoinjs-lib';

export default class LedgerTxBuilder extends TxBuilder {
  private tx!: LedgerTx;

  private ledgerService: LedgerService;

  constructor() {
    super();
    this.signer = new LedgerTxSigner();
    this.ledgerService = new LedgerService(this.coin);
  }

  buildTx({
    amountToTransferInSatoshi, refundAddress, recipient, feeLevel, changeAddress, sessionId,
  }: {
    amountToTransferInSatoshi: number; refundAddress: string; recipient: string;
    feeLevel: string; changeAddress: string; sessionId: string;
  }): Promise<LedgerTx> {
    return new Promise<LedgerTx>((resolve, reject) => {
      const { coin } = this;
      ApiService.createPeginTx(
        amountToTransferInSatoshi, refundAddress, recipient, sessionId, feeLevel, changeAddress,
      )
        .then((normalizedTx) => Promise.all([
          normalizedTx.outputs,
          this.getLedgerTxData(normalizedTx),
        ]))
        .then(([outputs, { inputs, associatedKeysets, outputScriptHex }]) => {
          const tx: LedgerTx = {
            outputs,
            outputScriptHex,
            changePath: store.getters[`pegInTx/${constants.PEGIN_TX_GET_CHANGE_ADDRESS}`],
            coin,
            inputs,
            associatedKeysets,
          };
          this.tx = tx;
          resolve(tx);
        })
        .catch(reject);
    });
  }

  private static getInputs(normalizedInputs: NormalizedInput[]):
    Promise<{
    inputs: { tx: LedgerjsTransaction; outputIndex: number; publicKey: string}[];
    associatedKeysets: string[];
    }> {
    const associatedKeysets: string[] = [];
    const inputs: {tx: LedgerjsTransaction; outputIndex: number; publicKey: string}[] = [];
    return new Promise<{
      inputs: {tx: LedgerjsTransaction; outputIndex: number; publicKey: string}[];
      associatedKeysets: string[];}>((resolve, reject) => {
        const txPromises = normalizedInputs.map(
          (normalizedInput) => ApiService.getTxHex(normalizedInput.prev_hash),
        );
        Promise.all(txPromises)
          .then((txHexList) => LedgerService.splitTransactionList(txHexList))
          .then((eventualSplitTx) => Promise.all(eventualSplitTx))
          .then((txList) => {
            txList.forEach((tx, idx) => {
              inputs.push({
                tx,
                outputIndex: normalizedInputs[idx].prev_index,
                publicKey: store.getters[`pegInTx/${constants.PEGIN_TX_GET_ADDRESS_PUBLIC_KEY}`](normalizedInputs[idx].address),
              });
              associatedKeysets.push(
                LedgerTxBuilder.getSerializedPath(normalizedInputs[idx].address),
              );
            });
            resolve({ inputs, associatedKeysets });
          })
          .catch(reject);
      });
  }

  private getLedgerTxData(normalizedTx: NormalizedTx):
    Promise<{
    inputs: { tx: LedgerjsTransaction; outputIndex: number; publicKey: string}[];
    associatedKeysets: string[];
    outputScriptHex: string;
  }> {
    const response: {
      inputs: { tx: LedgerjsTransaction; outputIndex: number; publicKey: string}[];
      associatedKeysets: string[];
      outputScriptHex: string;
    } = {
      inputs: [],
      associatedKeysets: [],
      outputScriptHex: '',
    };
    return new Promise((resolve, reject) => {
      LedgerTxBuilder.getInputs(normalizedTx.inputs)
        .then(({ inputs, associatedKeysets }) => {
          response.inputs = inputs;
          response.associatedKeysets = associatedKeysets;
          return this.getOutputScriptHex(normalizedTx.outputs);
        })
        .then((outputScriptHex) => {
          response.outputScriptHex = outputScriptHex;
          resolve(response);
        })
        .catch(reject);
    });
  }

  private static getSerializedPath(address: string): string {
    return store.getters[`pegInTx/${constants.PEGIN_TX_GET_BIP44_DERIVATION_PATH_FROM_ADDRESS}`](address);
  }

  private getOutputScriptHex(outputs: NormalizedOutput[]): Promise<string> {
    const network = this.coin === 'main' ? bitcoin.networks.bitcoin : bitcoin.networks.testnet;
    const txBuilder = new bitcoin.TransactionBuilder(network);
    return new Promise<string>((resolve, reject) => {
      outputs.forEach((normalizedOutput) => {
        if (normalizedOutput.op_return_data) {
          const buffer = Buffer.from(normalizedOutput.op_return_data, 'hex');
          const script: Payment = bitcoin.payments.embed({ data: [buffer] });
          if (script.output) {
            txBuilder.addOutput(script.output, 0);
          }
        } else if (normalizedOutput.address) {
          txBuilder.addOutput(normalizedOutput.address, Number(normalizedOutput.amount));
        }
      });
      const partialTx = txBuilder.buildIncomplete().toHex();
      LedgerService.splitTransaction(partialTx)
        .then((splitTx) => LedgerService.serializeTransactionOutputs(splitTx))
        .then(resolve)
        .catch(reject);
    });
  }

  public sign(): Promise<{ signedTx: string }> {
    return this.signer.sign(this.tx) as Promise<{ signedTx: string }>;
  }
}
