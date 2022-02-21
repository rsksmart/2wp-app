import TrezorConnect, { GetAddress } from 'trezor-connect';
import * as bitcoin from 'bitcoinjs-lib';
import { Network } from 'bitcoinjs-lib';
import { WalletAddress } from '@/store/peginTx/types';
import * as constants from '@/store/constants';
import {
  TrezorSignedTx, TrezorTx, Tx,
} from '@/types';
import { WalletService } from '@/services/WalletService';
import { EnvironmentAccessorService } from './enviroment-accessor.service';

export default class TrezorService extends WalletService {
  private network: Network;

  constructor() {
    super();
    this.network = this.coin === constants.BTC_NETWORK_MAINNET
      ? bitcoin.networks.bitcoin : bitcoin.networks.testnet;
    TrezorConnect.manifest({
      email: EnvironmentAccessorService.getEnvironmentVariables().vueAppManifestEmail,
      appUrl: EnvironmentAccessorService.getEnvironmentVariables().vueAppManifestAppUrl,
    });
  }

  // eslint-disable-next-line class-methods-use-this
  public getWalletAddressesPerCall(): number {
    return EnvironmentAccessorService.getEnvironmentVariables().vueAppWalletAddressesPerCallTrezor;
  }

  // eslint-disable-next-line class-methods-use-this
  public getWalletMaxCall(): number {
    return EnvironmentAccessorService.getEnvironmentVariables().vueAppWalletMaxCallTrezor;
  }

  // eslint-disable-next-line @typescript-eslint/no-inferrable-types
  private getAddressesBundle(startFrom: number, batchSize: number, accountIndex: number = 0):
      GetAddress[] {
    const bundle: GetAddress[] = [];
    for (let index: number = startFrom; index < (startFrom + batchSize); index += 1) {
      bundle.push({
        path: super.getDerivationPath(constants
          .BITCOIN_LEGACY_ADDRESS, accountIndex, false, index),
        showOnTrezor: false,
        coin: this.coin,
      });
      bundle.push({
        path: super.getDerivationPath(constants
          .BITCOIN_LEGACY_ADDRESS, accountIndex, true, index),
        showOnTrezor: false,
        coin: this.coin,
      });
      bundle.push({
        path: super.getDerivationPath(constants
          .BITCOIN_SEGWIT_ADDRESS, accountIndex, false, index),
        showOnTrezor: false,
        coin: this.coin,
      });
      bundle.push({
        path: super.getDerivationPath(constants
          .BITCOIN_SEGWIT_ADDRESS, accountIndex, true, index),
        showOnTrezor: false,
        coin: this.coin,
      });
      bundle.push({
        path: super.getDerivationPath(constants
          .BITCOIN_NATIVE_SEGWIT_ADDRESS, accountIndex, false, index),
        showOnTrezor: false,
        coin: this.coin,
      });
      bundle.push({
        path: super.getDerivationPath(constants
          .BITCOIN_NATIVE_SEGWIT_ADDRESS, accountIndex, true, index),
        showOnTrezor: false,
        coin: this.coin,
      });
    }
    return bundle;
  }

  // eslint-disable-next-line class-methods-use-this
  public getAccountAddresses(batch: number, startFrom: number):
    Promise<WalletAddress[]> {
    return new Promise((resolve, reject) => {
      const bundle = this.getAddressesBundle(startFrom, batch);
      TrezorConnect.getAddress({
        bundle,
      })
        .then((result) => {
          if (!result.success) reject(new Error(result.payload.error));
          const addresses: WalletAddress[] = [];
          Object.entries(result.payload).forEach((obj) => {
            addresses.push(obj[1]);
          });
          resolve(addresses);
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
        coin: this.coin,
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
}
