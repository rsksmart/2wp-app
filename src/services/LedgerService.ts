import AppBtc from '@ledgerhq/hw-app-btc';
import TransportWebUSB from '@ledgerhq/hw-transport-webusb';
import _ from 'lodash';
import WalletService from '@/services/WalletService';
import * as constants from '@/store/constants';
import { WalletAddress } from '@/store/peginTx/types';
import { LedgerjsTransaction, LedgerTx } from '@/services/types';

export default class LedgerService extends WalletService {
  public static splitTransaction(hexTx: string): Promise<LedgerjsTransaction> {
    return new Promise<LedgerjsTransaction>((resolve, reject) => {
      TransportWebUSB.create()
        .then((transport: TransportWebUSB) => {
          const btc = new AppBtc(transport);
          const tx = btc.splitTransaction(hexTx);
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
            txHexList.map((tx) => btc.splitTransaction(tx, true)),
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
    const walletAddresses: WalletAddress[] = [];
    const bundle = this.getAddressesBundle(0, batch);
    const transport = await TransportWebUSB.create(15000);
    const btc = new AppBtc(transport);
    try {
      for (let i = 0; i < bundle.length; i += 1) {
        const { derivationPath, format } = bundle[i];
        // eslint-disable-next-line no-await-in-loop
        const walletPublicKey = await btc.getWalletPublicKey(derivationPath, { format });
        walletAddresses.push({
          address: walletPublicKey.bitcoinAddress,
          serializedPath: derivationPath,
          path: this.getSerializedPath(derivationPath),
          publicKey: walletPublicKey.publicKey,
        });
      }
    } catch (e) {
      console.error(e);
    }
    await transport.close();
    return walletAddresses;
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

  public static signTx(tx: LedgerTx): Promise<string> {
    return new Promise<string>((resolve, reject) => {
      TransportWebUSB.create()
        .then((transport: TransportWebUSB) => {
          const btc = new AppBtc(transport);
          return btc.createPaymentTransactionNew({
            inputs: tx.inputs.map((input) => [input.tx, input.outputIndex, null, null]),
            associatedKeysets: tx.associatedKeysets,
            outputScriptHex: tx.outputScriptHex,
            // lockTime: 0,
            // segwit: false,
            // sigHashType: 1,
            // useTrustedInputForSegwit: true,
            // changePath: "0'/1'/0'",
          });
        })
        .then(resolve)
        .catch(reject);
    });
  }
}
