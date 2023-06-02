import * as bitcoin from 'bitcoinjs-lib';
import {
  LedgerjsTransaction,
  LedgerTx, NormalizedInput, NormalizedOutput, NormalizedTx,
} from '@/common/types';
import store from '@/common/store';
import ApiService from '@/common/services/ApiService';
import LedgerService from '@/common/services/LedgerService';
import * as constants from '@/common/store/constants';
import TxBuilder from './TxBuilder';

export default class LedgerTxBuilder extends TxBuilder {
  private tx!: LedgerTx;

  buildTx(normalizedTx: NormalizedTx, accountType: string):
    Promise<LedgerTx> {
    return new Promise<LedgerTx>((resolve, reject) => {
      const { coin } = this;
      const [, , change] = normalizedTx.outputs;
      const changeAddress = change && change.address
        ? change.address : '';
      this.getLedgerTxData(normalizedTx)
        .then(({ inputs, associatedKeysets, outputScriptHex }) => {
          const tx: LedgerTx = {
            outputs: normalizedTx.outputs,
            outputScriptHex,
            changePath: changeAddress,
            coin,
            inputs,
            associatedKeysets,
            accountType,
          };
          this.tx = tx;
          resolve(tx);
        })
        .catch(reject);
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
}
