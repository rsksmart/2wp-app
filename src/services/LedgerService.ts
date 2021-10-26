import AppBtc from '@ledgerhq/hw-app-btc';
import TransportWebUSB from '@ledgerhq/hw-transport-webusb';
import _ from 'lodash';
import * as bitcoin from 'bitcoinjs-lib';
import * as constants from '@/store/constants';
import { WalletAddress } from '@/store/peginTx/types';
import {
  LedgerjsTransaction, LedgerTx, Signer,
} from '@/types';
import { EnvironmentAccessorService } from '@/services/enviroment-accessor.service';
import { WalletService } from './WalletService';

export default class LedgerService extends WalletService {
  private network: bitcoin.Network;

  constructor(coin: string) {
    super(coin);
    this.network = coin === constants.BTC_NETWORK_MAINNET
      ? bitcoin.networks.bitcoin : bitcoin.networks.testnet;
  }

  // eslint-disable-next-line class-methods-use-this
  public getMaxAddressPerCall(): number {
    return Number(process.env.VUE_APP_WALLET_ADDRESSES_PER_CALL_LEDGER);
  }

  // eslint-disable-next-line class-methods-use-this
  public getMaxAddressCallNumber(): number {
    return Number(process.env.VUE_APP_MAX_ADDRESS_CALL_NUMBER_LEDGER);
  }

  public static splitTransaction(hexTx: string): Promise<LedgerjsTransaction> {
    return new Promise<LedgerjsTransaction>((resolve, reject) => {
      TransportWebUSB.create()
        .then((transport: TransportWebUSB) => {
          const btc = new AppBtc(transport);
          const bitcoinJsTx = bitcoin.Transaction.fromHex(hexTx);
          const tx = btc.splitTransaction(hexTx, bitcoinJsTx.hasWitnesses());
          return Promise.all([tx, transport.close()]);
        })
        .then(([tx]) => resolve(tx))
        .catch(reject);
    });
  }

  static splitTransactionList(txHexList: string[]): Promise<LedgerjsTransaction[]> {
    return new Promise<LedgerjsTransaction[]>((resolve, reject) => {
      TransportWebUSB.create()
        .then((transport: TransportWebUSB) => {
          const btc = new AppBtc(transport);
          return Promise.all([
            txHexList.map((tx) => {
              const bitcoinJsTx = bitcoin.Transaction.fromHex(tx);
              return btc.splitTransaction(tx, bitcoinJsTx.hasWitnesses());
            }),
            transport.close(),
          ]);
        })
        .then(([txList]) => resolve(txList))
        .catch(reject);
    });
  }

  public static serializeTransactionOutputs(splitTx: LedgerjsTransaction): Promise<string> {
    return new Promise<string>((resolve, reject) => {
      TransportWebUSB.create()
        .then((transport: TransportWebUSB) => {
          const btc = new AppBtc(transport);
          const txOutputsBuffer: Buffer = btc.serializeTransactionOutputs(splitTx);
          return Promise.all([txOutputsBuffer, transport.close()]);
        })
        .then(([txOutBuffer]) => resolve(txOutBuffer.toString('hex')))
        .catch(reject);
    });
  }

  private getAddressesBundle(startFrom: number, batchSize: number, accountIndex = 0):
    { derivationPath: string; format: 'legacy' | 'p2sh' | 'bech32' | undefined }[] {
    const bundle: { derivationPath: string; format: 'legacy' | 'p2sh' | 'bech32' | undefined }[] = [];
    for (let index: number = startFrom; index < (startFrom + batchSize); index += 1) {
      let change = true;
      _.range(2).forEach(() => {
        bundle.push({
          derivationPath: super.getDerivationPath(constants
            .BITCOIN_LEGACY_ADDRESS, accountIndex, change, index),
          format: 'legacy',
        });
        bundle.push({
          derivationPath: super.getDerivationPath(constants
            .BITCOIN_SEGWIT_ADDRESS, accountIndex, change, index),
          format: 'p2sh',
        });
        change = !change;
      });
    }
    return bundle;
  }

  public getAccountAddresses(batch: number, index: number): Promise<WalletAddress[]> {
    // eslint-disable-next-line no-async-promise-executor
    return new Promise(async (resolve, reject) => {
      const walletAddresses: WalletAddress[] = [];
      const bundle = this.getAddressesBundle(index, batch);

      try {
        const transport = await TransportWebUSB.create(15000);
        await LedgerService.checkApp(transport);
        const btc = new AppBtc(transport);
        // eslint-disable-next-line no-restricted-syntax
        for (const item of bundle) {
          const { derivationPath, format } = item;
          // eslint-disable-next-line no-await-in-loop
          const walletPublicKey = await btc.getWalletPublicKey(derivationPath, { format });
          walletAddresses.push({
            address: walletPublicKey.bitcoinAddress,
            serializedPath: derivationPath,
            path: this.getSerializedPath(derivationPath),
            publicKey: walletPublicKey.publicKey,
          });
        }

        await transport.close();
      } catch (e) {
        reject(e);
      }
      resolve(walletAddresses);
    });
  }

  public static getLedgerAddressFormat(accountType: string): 'legacy' | 'p2sh' | 'bech32' {
    let format: 'legacy' | 'p2sh' | 'bech32';
    switch (accountType) {
      case constants.BITCOIN_LEGACY_ADDRESS:
        format = 'legacy';
        break;
      case constants.BITCOIN_SEGWIT_ADDRESS:
        format = 'p2sh';
        break;
      case constants.BITCOIN_NATIVE_SEGWIT_ADDRESS:
        format = 'bech32';
        break;
      default:
        format = 'legacy';
    }
    return format;
  }

  static compressPublicKey(pubKey: string) {
    const { publicKey } = bitcoin.ECPair.fromPublicKey(Buffer.from(pubKey, 'hex'));
    return publicKey.toString('hex');
  }

  public static signTx(tx: LedgerTx): Promise<string> {
    return new Promise<string>((resolve, reject) => {
      TransportWebUSB.create()
        .then((transport: TransportWebUSB) => {
          const btc = new AppBtc(transport);
          return btc.createPaymentTransactionNew({
            inputs: tx.inputs.map((input) => [input.tx, input.outputIndex, null, null]),
            associatedKeysets: tx.associatedKeysets,
            outputScriptHex: tx.outputScriptHex,
          });
        })
        .then(resolve)
        .catch(reject);
    });
  }

  private getRedeem(publicKey: string) {
    const pubkey = LedgerService.compressPublicKey(publicKey);
    const pair = bitcoin.ECPair.fromPublicKey(Buffer.from(pubkey, 'hex'));
    const p2wpkh = bitcoin.payments.p2wpkh({ pubkey: pair.publicKey, network: this.network });
    const p2sh = bitcoin.payments.p2sh({ redeem: p2wpkh, network: this.network });
    return p2sh.redeem?.output;
  }

  signSegwitTx(tx: LedgerTx): Promise<string> {
    const psbt = new bitcoin.Psbt({ network: this.network });
    return new Promise<string>((resolve, reject) => {
      tx.inputs.forEach((input) => {
        const utxo = bitcoin.Transaction.fromHex(input.hex);
        const redeemScript = this.getRedeem(input.publicKey);
        psbt.addInput({
          hash: utxo.getHash(),
          index: input.outputIndex,
          nonWitnessUtxo: utxo.toBuffer(),
          redeemScript,
        });
      });
      tx.outputs.forEach((output) => {
        if (output.op_return_data) {
          const buffer = Buffer.from(output.op_return_data, 'hex');
          const script: bitcoin.Payment = bitcoin.payments.embed({ data: [buffer] });
          if (script.output) {
            psbt.addOutput({
              script: script.output,
              value: 0,
            });
          }
        } else if (output.address) {
          psbt.addOutput({
            address: output.address,
            value: Number(output.amount),
          });
        }
      });
      psbt.setVersion(2);
      this.signP2SH(tx)
        .then((signatures) => signatures
          .map((signature, index) => psbt
            .signInput(index, this.generateSigner(signature, tx.inputs[index].publicKey))))
        .then(() => psbt.validateSignaturesOfAllInputs())
        .then((validatedTx) => {
          if (!validatedTx) reject(new Error('Invalid Transaction.'));
          psbt.finalizeAllInputs();
          const hexTx = psbt.extractTransaction().toHex();
          resolve(hexTx);
        })
        .catch(reject);
    });
  }

  generateSigner(signature: string, publicKey: string): Signer {
    const pair = bitcoin.ECPair.fromPublicKey(Buffer.from(publicKey, 'hex'));
    return {
      network: this.network,
      publicKey: pair.publicKey,
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      sign: ($hash: Buffer) => {
        const encodedSignature = Buffer.from(signature, 'hex');
        const decoded = bitcoin.script.signature.decode(encodedSignature);
        return decoded.signature;
      },
    };
  }

  // eslint-disable-next-line class-methods-use-this
  private signP2SH(tx: LedgerTx): Promise<string[]> {
    return new Promise<string[]>((resolve, reject) => {
      const LOCK_TIME = 0;
      const SIGHASH_ALL = 1;
      const TX_VERSION = 2;
      TransportWebUSB.create()
        .then((transport: TransportWebUSB) => {
          const btc = new AppBtc(transport);
          return btc.signP2SHTransaction({
            inputs: tx.inputs.map((input) => [
              input.tx,
              input.outputIndex,
              this.getLedgerRedeemScript(input.publicKey),
              null,
            ]),
            transactionVersion: TX_VERSION,
            associatedKeysets: tx.associatedKeysets,
            outputScriptHex: tx.outputScriptHex,
            lockTime: LOCK_TIME,
            sigHashType: SIGHASH_ALL,
            segwit: true,
          });
        })
        .then(resolve)
        .catch(reject);
    });
  }

  private getLedgerRedeemScript(publicKey: string): string {
    const pubkey = Buffer.from(LedgerService.compressPublicKey(publicKey), 'hex');
    const p2pkh = bitcoin.payments.p2pkh({ pubkey, network: this.network });
    if (p2pkh.output) {
      return p2pkh.output.toString('hex');
    }
    console.error('Error getting Redeem script');
    return '';
  }

  public static getApp(transport: TransportWebUSB):
    Promise<{name: string; version: string; flags: Buffer}> {
    return new Promise<{name: string; version: string; flags: Buffer}>((resolve, reject) => {
      transport.send(0xb0, 0x01, 0x00, 0x00)
        .then((response: Buffer) => {
          let i = 1;
          // eslint-disable-next-line no-plusplus
          const nameLength = response[i++];
          const name = response.slice(i, (i += nameLength)).toString('ascii');
          // eslint-disable-next-line no-plusplus
          const versionLength = response[i++];
          const version = response.slice(i, (i += versionLength)).toString('ascii');
          // eslint-disable-next-line no-plusplus
          const flagLength = response[i++];
          const flags = response.slice(i, (i += flagLength));
          resolve({ name, version, flags });
        })
        .catch(reject);
    });
  }

  private static async checkApp(transport: TransportWebUSB): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      LedgerService.getApp(transport)
        .then(({ name }) => {
          const network = EnvironmentAccessorService.getEnvironmentVariables().vueAppCoin;
          let valid: boolean;
          switch (name) {
            case constants.LEDGER_APP_BTC_TEST:
              valid = network === constants.BTC_NETWORK_TESTNET;
              break;
            case constants.LEDGER_APP_BTC:
              valid = network === constants.BTC_NETWORK_MAINNET;
              break;
            default:
              valid = false;
          }
          if (valid) resolve();
          else reject(new Error('You are not in the required App. Check your Ledger device and try again'));
        })
        .catch(reject);
    });
  }

  public getUnsignedRawTx(tx: LedgerTx) : string {
    const txBuilder = new bitcoin.TransactionBuilder(this.network);
    tx.inputs.forEach((input) => {
      const utxo = bitcoin.Transaction.fromHex(input.hex);
      txBuilder.addInput(utxo.getHash(), input.outputIndex);
    });
    tx.outputs.forEach((normalizedOutput) => {
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
