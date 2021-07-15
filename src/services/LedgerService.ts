import AppBtc from '@ledgerhq/hw-app-btc';
import TransportWebUSB from '@ledgerhq/hw-transport-webusb';
import _ from 'lodash';
import WalletService from '@/services/WalletService';
import * as constants from '@/store/constants';
import { WalletAddress } from '@/store/peginTx/types';
import {
  LedgerjsTransaction, LedgerTx, Signer,
} from '@/types';
import * as bitcoin from 'bitcoinjs-lib';

export default class LedgerService extends WalletService {
  private network: bitcoin.Network;

  constructor(coin: string) {
    super(coin);
    this.network = coin === constants.BTC_NETWORK_MAINNET
      ? bitcoin.networks.bitcoin : bitcoin.networks.testnet;
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

  private getAddressesBundle(accountIndex: number, batch: number):
    { derivationPath: string; format: 'legacy' | 'p2sh' | 'bech32' | undefined }[] {
    const bundle: { derivationPath: string; format: 'legacy' | 'p2sh' | 'bech32' | undefined }[] = [];
    for (let index = 0; index < batch; index += 1) {
      let change = true;
      _.range(2).forEach(() => {
        bundle.push({
          derivationPath: this.getDerivationPath(constants
            .BITCOIN_LEGACY_ADDRESS, accountIndex, change, index),
          format: 'legacy',
        });
        bundle.push({
          derivationPath: this.getDerivationPath(constants
            .BITCOIN_SEGWIT_ADDRESS, accountIndex, change, index),
          format: 'p2sh',
        });
        bundle.push({
          derivationPath: this.getDerivationPath(constants
            .BITCOIN_NATIVE_SEGWIT_ADDRESS, accountIndex, change, index),
          format: 'bech32',
        });
        change = !change;
      });
    }
    return bundle;
  }

  public async getAddressList(batch: number):
    Promise<WalletAddress[]> {
    // eslint-disable-next-line no-async-promise-executor
    return new Promise<WalletAddress[]>(async (resolve, reject) => {
      const walletAddresses: WalletAddress[] = [];
      const bundle = this.getAddressesBundle(0, batch);
      try {
        const transport = await TransportWebUSB.create(15000);
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
}
