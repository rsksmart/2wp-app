import TrezorConnect, { GetAddress } from 'trezor-connect';
import { WalletAddress } from '@/store/peginTx/types';
import * as constants from '@/store/constants';
import { TrezorSignedTx, TrezorTx, Tx } from '@/services/types';

export default class TrezorService {
  private coin: string;

  constructor(coin: string) {
    this.coin = coin;
    TrezorConnect.manifest({
      email: process.env.VUE_APP_MANIFEST_EMAIL ?? '',
      appUrl: process.env.VUE_APP_MANIFEST_APP_URL ?? '',
    });
  }

  private getAccountPath(accountType: string, accountIdx: number) {
    const coinPath: string = this.coin === 'bitcoin' ? "/0'" : "/1'";
    let accountPath = 'm';
    switch (accountType) {
      case constants.BITCOIN_LEGACY_ADDRESS:
        accountPath += "/44'";
        break;
      case constants.BITCOIN_SEGWIT_ADDRESS:
        accountPath += "/49'";
        break;
      case constants.BITCOIN_NATIVE_SEGWIT_ADDRESS:
        accountPath += "/84'";
        break;
      default:
        accountPath += "/44'";
    }
    return `${accountPath}${coinPath}/${accountIdx}'`;
  }

  private getDerivationPath(accountType: string, accountIdx: number, change: boolean,
    addressIdx: number): string {
    const changePath: string = change ? '/1' : '/0';
    return `${this.getAccountPath(accountType, accountIdx)}${changePath}/${addressIdx}`;
  }

  private getAddressesBundle(accountIndex: number, batch: number): GetAddress [] {
    const bundle: GetAddress[] = [];
    for (let index = 0; index < batch; index += 1) {
      bundle.push({
        path: this.getDerivationPath(constants
          .BITCOIN_LEGACY_ADDRESS, accountIndex, false, index),
        showOnTrezor: false,
        coin: this.coin,
      });
      bundle.push({
        path: this.getDerivationPath(constants
          .BITCOIN_LEGACY_ADDRESS, accountIndex, true, index),
        showOnTrezor: false,
        coin: this.coin,
      });
      bundle.push({
        path: this.getDerivationPath(constants
          .BITCOIN_SEGWIT_ADDRESS, accountIndex, false, index),
        showOnTrezor: false,
        coin: this.coin,
      });
      bundle.push({
        path: this.getDerivationPath(constants
          .BITCOIN_SEGWIT_ADDRESS, accountIndex, true, index),
        showOnTrezor: false,
        coin: this.coin,
      });
      bundle.push({
        path: this.getDerivationPath(constants
          .BITCOIN_NATIVE_SEGWIT_ADDRESS, accountIndex, false, index),
        showOnTrezor: false,
        coin: this.coin,
      });
      bundle.push({
        path: this.getDerivationPath(constants
          .BITCOIN_NATIVE_SEGWIT_ADDRESS, accountIndex, true, index),
        showOnTrezor: false,
        coin: this.coin,
      });
    }
    return bundle;
  }

  public getAddressList(batch: number): Promise<WalletAddress[]> {
    return new Promise((resolve, reject) => {
      const bundle = this.getAddressesBundle(0, batch);
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

  public getAccountUnusedAddresses(accountType: string): Promise<string[]> {
    return new Promise((resolve, reject) => {
      TrezorConnect.getAccountInfo({
        path: this.getAccountPath(accountType, 0),
        coin: this.coin,
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

  // eslint-disable-next-line class-methods-use-this
  private getSerializedPath(path: string): number[] {
    const tmpPath = path.substr(2, path.length);
    const [accountType, chain, accountIdx, change, addressIdx] = tmpPath.split('/');
    // eslint-disable-next-line no-bitwise
    return [(+accountType.substring(0, 2) | 0x80000000) >>> 0,
      // eslint-disable-next-line no-bitwise
      (+chain.substring(0, 1) | 0x80000000) >>> 0,
      // eslint-disable-next-line no-bitwise
      (+accountIdx.substring(0, 1) | 0x80000000) >>> 0, +change, +addressIdx];
  }

  sign(tx: Tx): Promise<TrezorSignedTx> {
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
          }
        })
        .catch(reject);
    });
  }
}
