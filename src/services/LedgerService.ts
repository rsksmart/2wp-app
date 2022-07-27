import Btc from '@ledgerhq/hw-app-btc';
import TransportWebUSB from '@ledgerhq/hw-transport-webusb';
import _ from 'lodash';
import * as bitcoin from 'bitcoinjs-lib';
import * as constants from '@/store/constants';
import { BtcAccount, WalletAddress } from '@/types/pegInTx';
import {
  LedgerjsTransaction, LedgerSignedTx, LedgerTx, Tx,
} from '@/types';
import { EnvironmentAccessorService } from '@/services/enviroment-accessor.service';
import { WalletService } from '@/services';
import LedgerTransportService from '@/services/LedgerTransportService';

export default class LedgerService extends WalletService {
  private network: bitcoin.Network;

  constructor() {
    super();
    this.network = this.coin === constants.BTC_NETWORK_MAINNET
      ? bitcoin.networks.bitcoin : bitcoin.networks.testnet;
  }

  // eslint-disable-next-line class-methods-use-this
  public getWalletAddressesPerCall(): number {
    return EnvironmentAccessorService.getEnvironmentVariables().vueAppWalletAddressesPerCallLedger;
  }

  // eslint-disable-next-line class-methods-use-this
  public getWalletMaxCall(): number {
    return EnvironmentAccessorService.getEnvironmentVariables().vueAppWalletMaxCallLedger;
  }

  public static splitTransaction(hexTx: string): Promise<LedgerjsTransaction> {
    return LedgerTransportService.getInstance()
      .enqueueRequest(
        (transport:TransportWebUSB) => new Promise<LedgerjsTransaction>((resolve) => {
          const btc = new Btc(transport);
          const bitcoinJsTx = bitcoin.Transaction.fromHex(hexTx);
          resolve(btc.splitTransaction(hexTx, bitcoinJsTx.hasWitnesses()));
        }),
      );
  }

  static splitTransactionList(txHexList: string[]): Promise<LedgerjsTransaction[]> {
    return LedgerTransportService.getInstance()
      .enqueueRequest((transport: TransportWebUSB) => {
        const btc = new Btc(transport);
        return Promise.all(txHexList.map((tx) => {
          const bitcoinJsTx = bitcoin.Transaction.fromHex(tx);
          return btc.splitTransaction(tx, bitcoinJsTx.hasWitnesses());
        }));
      });
  }

  public static serializeTransactionOutputs(splitTx: LedgerjsTransaction): Promise<string> {
    return LedgerTransportService.getInstance()
      .enqueueRequest(
        (transport: TransportWebUSB) => new Promise<string>((resolve) => {
          const btc = new Btc(transport);
          const txOutputsBuffer: Buffer = btc.serializeTransactionOutputs(splitTx);
          resolve(txOutputsBuffer.toString('hex'));
        }),
      );
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
        bundle.push({
          derivationPath: super.getDerivationPath(constants
            .BITCOIN_NATIVE_SEGWIT_ADDRESS, accountIndex, change, index),
          format: 'bech32',
        });
        change = !change;
      });
    }
    return bundle;
  }

  private getAccountAddressesFromWallet(batch: number, index: number): Promise<WalletAddress[]> {
    const bundle = this.getAddressesBundle(index, batch);
    return LedgerTransportService.getInstance()
      .enqueueRequest(
        // eslint-disable-next-line no-async-promise-executor
        (transport: TransportWebUSB) => new Promise<WalletAddress[]>(async (resolve, reject) => {
          const walletAddresses: WalletAddress[] = [];
          try {
            await LedgerService.checkApp(transport);
            const btc = new Btc(transport);
            // eslint-disable-next-line no-restricted-syntax
            for (const item of bundle) {
              if (this.subscribers.length === 0) {
                break;
              }
              const { derivationPath, format } = item;
              // eslint-disable-next-line no-await-in-loop
              const walletPublicKey = await btc.getWalletPublicKey(derivationPath, { format });
              walletAddresses.push({
                address: walletPublicKey.bitcoinAddress,
                derivationPath,
                publicKey: walletPublicKey.publicKey,
              });
            }
          } catch (e) {
            reject(e);
          }
          resolve(walletAddresses);
        }),
      );
  }

  public getAccountAddresses(batch: number, index: number): Promise<WalletAddress[]> {
    return new Promise<WalletAddress[]>((resolve, reject) => {
      const { p2pkh, p2sh, p2wpkh } = this.extendedPubKeys;
      const enabledXpub = true;
      if (p2pkh && p2sh && p2wpkh) {
        resolve(this.getDerivedAddresses(batch, index));
      } else if (enabledXpub) {
        this.setAccountsXpub(this.currentAccount)
          .then(() => this.getDerivedAddresses(batch, index))
          .then(resolve)
          .catch(reject);
      } else {
        this.getAccountAddressesFromWallet(batch, index)
          .then(resolve)
          .catch(reject);
      }
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

  // eslint-disable-next-line class-methods-use-this
  sign(tx: Tx): Promise<LedgerSignedTx> {
    const ledgerTx: LedgerTx = tx as LedgerTx;
    const isSegwit = ledgerTx.accountType === constants.BITCOIN_SEGWIT_ADDRESS;
    const isNativeSegwit = ledgerTx.accountType === constants.BITCOIN_NATIVE_SEGWIT_ADDRESS;
    return LedgerTransportService.getInstance()
      .enqueueRequest(
        (transport: TransportWebUSB) => new Promise<LedgerSignedTx>((resolve, reject) => {
          const btc = new Btc(transport);
          btc.createPaymentTransactionNew({
            inputs: ledgerTx.inputs.map((input) => [input.tx, input.outputIndex, null, null]),
            associatedKeysets: ledgerTx.associatedKeysets,
            outputScriptHex: ledgerTx.outputScriptHex,
            segwit: isSegwit || isNativeSegwit,
            useTrustedInputForSegwit: isSegwit || isNativeSegwit,
            additionals: isNativeSegwit ? ['bech32'] : [],
          })
            .then((signedTx) => resolve({ signedTx }))
            .catch(reject);
        }),
      );
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

  getXpub(accountType: BtcAccount, accountNumber: number): Promise<string> {
    return LedgerTransportService.getInstance()
      .enqueueRequest((transport: TransportWebUSB) => {
        const btc = new Btc(transport);
        const network = EnvironmentAccessorService.getEnvironmentVariables().vueAppCoin;
        const xpubVersion = network === constants.BTC_NETWORK_MAINNET
          ? constants.LEDGER_BTC_MAIN_XPUB_VERSION : constants.LEDGER_BTC_TEST_XPUB_VERSION;
        return btc.getWalletXpub({
          path: super.getAccountPath(accountType, accountNumber),
          xpubVersion,
        });
      });
  }
}
