import TrezorConnect, { Address, GetAddress } from 'trezor-connect';
import * as bitcoin from 'bitcoinjs-lib';
import { Network } from 'bitcoinjs-lib';
import { WalletAddress } from '@/types/pegInTx';
import * as constants from '@/store/constants';
import {
  TrezorSignedTx, TrezorTx, Tx,
} from '@/types';
import { WalletService } from '@/services';
import { EnvironmentAccessorService } from './enviroment-accessor.service';

type TrezorCoin = 'TESTNET' | 'BTC';

export default class TrezorService extends WalletService {
  private bitcoinJsNetwork: Network;

  private trezorCoin: TrezorCoin;

  constructor() {
    super();
    switch (this.network) {
      case constants.BTC_NETWORK_MAINNET:
        this.bitcoinJsNetwork = bitcoin.networks.bitcoin;
        this.trezorCoin = 'BTC';
        break;
      default:
        this.bitcoinJsNetwork = bitcoin.networks.testnet;
        this.trezorCoin = 'TESTNET';
        break;
    }
    TrezorConnect.manifest({
      email: EnvironmentAccessorService.getEnvironmentVariables().vueAppManifestEmail,
      appUrl: EnvironmentAccessorService.getEnvironmentVariables().vueAppManifestAppUrl,
    });
  }

  // eslint-disable-next-line class-methods-use-this
  isConnected(): Promise<boolean> {
    return new Promise<boolean>((resolve) => {
      resolve(true);
    });
  }

  // eslint-disable-next-line class-methods-use-this
  reconnect(): Promise<void> {
    return new Promise<void>((resolve) => {
      resolve();
    });
  }

  private getAddressesBundle(): GetAddress[] {
    const bundle: GetAddress[] = [];
    const { legacy, segwit, nativeSegwit } = this.addressesToFetch;
    for (
      let index: number = legacy.lastIndex; index < (legacy.lastIndex + legacy.count); index += 1
    ) {
      bundle.push({
        path: super.getDerivationPath(constants
          .BITCOIN_LEGACY_ADDRESS, this.currentAccount, false, index),
        showOnTrezor: false,
        coin: this.trezorCoin,
      });
      bundle.push({
        path: super.getDerivationPath(constants
          .BITCOIN_LEGACY_ADDRESS, this.currentAccount, true, index),
        showOnTrezor: false,
        coin: this.trezorCoin,
      });
    }
    for (
      let index: number = segwit.lastIndex; index < (segwit.lastIndex + segwit.count); index += 1
    ) {
      bundle.push({
        path: super.getDerivationPath(constants
          .BITCOIN_SEGWIT_ADDRESS, this.currentAccount, false, index),
        showOnTrezor: false,
        coin: this.trezorCoin,
      });
      bundle.push({
        path: super.getDerivationPath(constants
          .BITCOIN_SEGWIT_ADDRESS, this.currentAccount, true, index),
        showOnTrezor: false,
        coin: this.trezorCoin,
      });
    }
    for (
      let index: number = nativeSegwit.lastIndex;
      index < (nativeSegwit.lastIndex + nativeSegwit.count); index += 1
    ) {
      bundle.push({
        path: super.getDerivationPath(constants
          .BITCOIN_NATIVE_SEGWIT_ADDRESS, this.currentAccount, false, index),
        showOnTrezor: false,
        coin: this.trezorCoin,
      });
      bundle.push({
        path: super.getDerivationPath(constants
          .BITCOIN_NATIVE_SEGWIT_ADDRESS, this.currentAccount, true, index),
        showOnTrezor: false,
        coin: this.trezorCoin,
      });
    }
    return bundle;
  }

  public getAccountAddresses():
    Promise<WalletAddress[]> {
    return new Promise((resolve, reject) => {
      const bundle = this.getAddressesBundle();
      TrezorConnect.getAddress({
        bundle,
      })
        .then((result) => {
          if (!result.success) reject(new Error(result.payload.error));
          const addresses: WalletAddress[] = [];
          Object.entries(result.payload).forEach((obj) => {
            const address = obj[1] as Address;
            addresses.push({
              address: address.address,
              derivationPath: address.serializedPath,
              arrayPath: address.path,
              publicKey: '',
            });
          });
          resolve(addresses);
        })
        .catch(reject);
    });
  }

  // eslint-disable-next-line class-methods-use-this
  public getAccountUnusedAddresses(accountType: string): Promise<string[]> {
    return new Promise((resolve, reject) => {
      TrezorConnect.getAccountInfo({
        path: this.getAccountPath(accountType, 0),
        coin: this.trezorCoin,
        details: 'txs',
      })
        .then((result) => {
          if (!result.success) reject(new Error(result.payload.error));
          const unusedAddresses: string[] = [];
          if ('addresses' in result.payload) {
            const { addresses } = result.payload;
            if (addresses && 'unused' in addresses) {
              Object.entries(addresses.unused)
                .forEach((obj) => {
                  unusedAddresses.push(obj[1].address);
                });
            }
          }
          resolve(unusedAddresses);
        })
        .catch(reject);
    });
  }

  public sign(tx: Tx): Promise<TrezorSignedTx> {
    const trezorTx: TrezorTx = tx as TrezorTx;
    return new Promise<TrezorSignedTx>((resolve, reject) => {
      TrezorConnect.signTransaction({
        inputs: trezorTx.inputs,
        outputs: trezorTx.outputs,
        coin: this.trezorCoin,
        version: trezorTx.version,
        push: false,
      })
        .then((res) => {
          if (res.success) {
            resolve({
              success: res.success,
              payload: {
                signatures: res.payload.signatures,
                serializedTx: res.payload.serializedTx,
              },
            });
          } else {
            reject(new Error(res.payload.error));
          }
        })
        .catch(reject);
    });
  }

  // eslint-disable-next-line class-methods-use-this,@typescript-eslint/no-unused-vars
  getXpub(accountType: string, accountNumber: number): Promise<string> {
    throw new Error('Method not implemented.');
  }

  areEnoughUnusedAddresses(): boolean {
    return (this.adjacentUnusedAddresses.legacy >= constants.MAX_ADJACENT_UNUSED_ADDRESSES
      && this.adjacentUnusedAddresses.segwit >= constants.MAX_ADJACENT_UNUSED_ADDRESSES
      && this.adjacentUnusedAddresses.nativeSegwit >= constants.MAX_ADJACENT_UNUSED_ADDRESSES);
  }
}
