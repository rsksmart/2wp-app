import * as bitcoin from 'bitcoinjs-lib';
import {
  LedgerjsTransaction, LedgerSignedTx,
  LedgerTx, NormalizedInput, NormalizedOutput, NormalizedTx,
} from '@/types';
import store from '@/store';
import ApiService from '@/services/ApiService';
import LedgerService from '@/services/LedgerService';
import * as constants from '@/store/constants';
import TxBuilder from './TxBuilder';

export default class LedgerTxBuilder extends TxBuilder {
  private tx!: LedgerTx;

  constructor() {
    super();
    this.walletService = new LedgerService();
  }

  buildTx(): Promise<LedgerTx> {
    return new Promise<LedgerTx>((resolve, reject) => {
      const { coin } = this;
      if (this.normalizedTx) {
        this.getLedgerTxData(this.normalizedTx)
          .then(({ inputs, associatedKeysets, outputScriptHex }) => {
            const tx: LedgerTx = {
              outputs: this.normalizedTx.outputs,
              outputScriptHex,
              changePath: this.changeAddress,
              coin,
              inputs,
              associatedKeysets,
              accountType: this.accountType,
            };
            this.tx = tx;
            resolve(tx);
          })
          .catch(reject);
      } else {
        reject(new Error('There is no Normalized transaction created'));
      }
    });
  }

  private static getInputs(normalizedInputs: NormalizedInput[]):
    Promise<{
    inputs: { tx: LedgerjsTransaction; outputIndex: number; publicKey: string; hex: string}[];
    associatedKeysets: string[];
    }> {
    const associatedKeysets: string[] = [];
    const inputs:
      {tx: LedgerjsTransaction; outputIndex: number; publicKey: string; hex: string}[] = [];
    let hexTxList: string[] = [];
    return new Promise<{
      inputs: {tx: LedgerjsTransaction; outputIndex: number; publicKey: string; hex: string}[];
      associatedKeysets: string[];}>((resolve, reject) => {
        const txPromises = normalizedInputs
          .map((normalizedInput) => ApiService.getTxHex(normalizedInput.prev_hash));
        Promise.all(txPromises)
          .then((txHexList) => {
            hexTxList = txHexList;
            return LedgerService.splitTransactionList(txHexList);
          })
          .then((eventualSplitTx) => Promise.all(eventualSplitTx))
          .then((txList) => {
            txList.forEach((tx, idx) => {
              inputs.push({
                tx,
                outputIndex: normalizedInputs[idx].prev_index,
                publicKey: store.getters[`pegInTx/${constants.PEGIN_TX_GET_ADDRESS_PUBLIC_KEY}`](normalizedInputs[idx].address),
                hex: hexTxList[idx],
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
    inputs: { tx: LedgerjsTransaction; outputIndex: number; publicKey: string; hex: string}[];
    associatedKeysets: string[];
    outputScriptHex: string;
  }> {
    const ledgerTxData: {
      inputs: { tx: LedgerjsTransaction; outputIndex: number; publicKey: string; hex: string}[];
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
          ledgerTxData.inputs = inputs;
          ledgerTxData.associatedKeysets = associatedKeysets;
          return this.getOutputScriptHex(normalizedTx.outputs);
        })
        .then((outputScriptHex) => {
          ledgerTxData.outputScriptHex = outputScriptHex;
          resolve(ledgerTxData);
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
    txBuilder.setVersion(constants.BITCOIN_TX_VERSION);
    return new Promise<string>((resolve, reject) => {
      outputs.forEach((normalizedOutput) => {
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
      const partialTx = txBuilder.buildIncomplete().toHex();
      LedgerService.splitTransaction(partialTx)
        .then((splitTx) => LedgerService.serializeTransactionOutputs(splitTx))
        .then(resolve)
        .catch(reject);
    });
  }

  public sign(): Promise<LedgerSignedTx> {
    return this.walletService.sign(this.tx) as Promise<LedgerSignedTx>;
  }
}
