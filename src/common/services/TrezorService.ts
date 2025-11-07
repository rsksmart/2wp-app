import TrezorConnect, { Address } from '@trezor/connect-web';
import * as bitcoin from 'bitcoinjs-lib';
import { Network } from 'bitcoinjs-lib';
import { BtcAccount, WalletAddress } from '@/common/types/pegInTx';
import * as constants from '@/common/store/constants';
import {
  GetAddress,
  SignedTx,
  TrezorTx, Tx,
} from '@/common/types';
import { WalletService } from '@/common/services/index';
import { TrezorError } from '@/common/types/exception/TrezorError';
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
      appName: 'PowPeg App',
    });
  }

  private static unableToConnect(): TrezorError {
    const error = new TrezorError();
    error.message = 'It appears there was an error connecting to the Trezor, please reconnect and try again.';
    return error;
  }

  private static unableToSignTx(): TrezorError {
    const error = new TrezorError();
    error.message = 'It appears there was an error while signing the transaction, please try again.';
    return error;
  }

  // eslint-disable-next-line class-methods-use-this
  name() {
    return constants.WALLET_NAMES.TREZOR;
  }

  // eslint-disable-next-line class-methods-use-this
  public availableAccounts(): BtcAccount[] {
    return [
      BtcAccount.BITCOIN_LEGACY_ADDRESS,
      BtcAccount.BITCOIN_SEGWIT_ADDRESS,
      BtcAccount.BITCOIN_NATIVE_SEGWIT_ADDRESS,
    ];
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

  public getAccountAddresses(): Promise<WalletAddress[]> {
    return new Promise((resolve, reject) => {
      const bundle = this.getAddressesBundle();
      TrezorConnect.getAddress({
        bundle,
      })
        .then((result) => {
          if (!result.success) {
            reject(TrezorService.unableToConnect());
          }
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
        .catch(() => reject(TrezorService.unableToConnect()));
    });
  }

  public sign(tx: Tx): Promise<SignedTx> {
    const trezorTx: TrezorTx = tx as TrezorTx;
    trezorTx.inputs = JSON.parse(JSON.stringify(trezorTx.inputs));
    return new Promise<SignedTx>((resolve, reject) => {
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
              signedTx: res.payload.serializedTx,
            });
          } else {
            reject(TrezorService.unableToSignTx());
          }
        })
        .catch(() => reject(TrezorService.unableToSignTx()));
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
