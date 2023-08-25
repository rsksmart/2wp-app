import Btc from '@ledgerhq/hw-app-btc';
import TransportWebUSB from '@ledgerhq/hw-transport-webusb';
import * as bitcoin from 'bitcoinjs-lib';
import * as constants from '@/common/store/constants';
import { BtcAccount, WalletAddress } from '@/common/types/pegInTx';
import {
  LedgerjsTransaction, LedgerSignedTx, LedgerTx, Tx,
} from '@/common/types';
import { EnvironmentAccessorService } from '@/common/services/enviroment-accessor.service';
import { WalletService } from '@/common/services/index';
import LedgerTransportService from '@/common/services/LedgerTransportService';

export default class LedgerService extends WalletService {
  private bitcoinJsNetwork: bitcoin.Network;

  constructor() {
    super();
    this.bitcoinJsNetwork = this.network === constants.BTC_NETWORK_MAINNET
      ? bitcoin.networks.bitcoin : bitcoin.networks.testnet;
  }

  // eslint-disable-next-line class-methods-use-this
  public reconnect(): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      try {
        LedgerTransportService.newInstance();
        resolve();
      } catch (e) {
        reject(e);
      }
    });
  }

  // eslint-disable-next-line @typescript-eslint/adjacent-overload-signatures
  public isConnected(): Promise<boolean> {
    return LedgerTransportService.getInstance()
      .enqueueRequest(
        // eslint-disable-next-line no-async-promise-executor
        (transport: TransportWebUSB) => new Promise<boolean>(async (resolve) => {
          try {
            await this.checkApp(transport);
            resolve(true);
          } catch (e) {
            resolve(false);
          }
        }),
      );
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

  public getAccountAddresses(): Promise<WalletAddress[]> {
    return new Promise<WalletAddress[]>((resolve, reject) => {
      const { p2pkh, p2sh, p2wpkh } = this.extendedPubKeys;
      const enabledXpub = true;
      if (p2pkh && p2sh && p2wpkh) {
        resolve(this.getFullBatchAddresses());
      } else if (enabledXpub) {
        this.setAccountsXpub(this.currentAccount)
          .then(() => this.getFullBatchAddresses())
          .then(resolve)
          .catch(reject);
      }
    });
  }

  private getFullBatchAddresses(): Array<WalletAddress> {
    let addressList: Array<WalletAddress> = [];
    const { legacy, segwit, nativeSegwit } = this.addressesToFetch;
    addressList = addressList.concat(
      this.getDerivedAddresses(legacy.count, legacy.lastIndex, constants.BITCOIN_LEGACY_ADDRESS),
    ).concat(
      this.getDerivedAddresses(segwit.count, segwit.lastIndex, constants.BITCOIN_SEGWIT_ADDRESS),
    ).concat(
      this.getDerivedAddresses(
        nativeSegwit.count,
        nativeSegwit.lastIndex,
        constants.BITCOIN_NATIVE_SEGWIT_ADDRESS,
      ),
    );
    return addressList;
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

  // eslint-disable-next-line class-methods-use-this
  public getApp(transport: TransportWebUSB):
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

  private async checkApp(transport: TransportWebUSB): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      this.getApp(transport)
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

  areEnoughUnusedAddresses(): boolean {
    return (this.adjacentUnusedAddresses.legacy >= constants.MAX_ADJACENT_UNUSED_ADDRESSES
      && this.adjacentUnusedAddresses.segwit >= constants.MAX_ADJACENT_UNUSED_ADDRESSES
      && this.adjacentUnusedAddresses.nativeSegwit >= constants.MAX_ADJACENT_UNUSED_ADDRESSES);
  }
}
