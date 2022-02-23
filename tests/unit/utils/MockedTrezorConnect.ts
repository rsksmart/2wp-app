import {
  GetAddress, SignTransaction,
} from 'trezor-connect';
import { WalletAddress } from '@/store/peginTx/types';
import { mockedData } from './mockedData';
import * as constants from '@/store/constants';

interface getAddressResponse {
  success: boolean;
  payload:WalletAddress[] | { error: string };
}
interface signTransactionResponse {
  success: boolean;
  payload: { serializedTx: string } | { error: string };
}
export default class TrezorConnect {
  static getAccountPath(accountType: string, accountIdx: number): string {
    const coinPath = "/1'";
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

  static getDerivationPath(accountType: string, accountIdx: number, change: boolean,
    addressIdx: number): string {
    const changePath: string = change ? '/1' : '/0';
    return `${TrezorConnect.getAccountPath(accountType, accountIdx)}${changePath}/${addressIdx}`;
  }

  static getAddressesBundle(startFrom: number, batchSize: number, accountIndex = 0):
    GetAddress[] {
    const bundle: GetAddress[] = [];
    const coin = constants.BTC_NETWORK_TESTNET;
    for (let index: number = startFrom; index < (startFrom + batchSize); index += 1) {
      bundle.push({
        path: TrezorConnect.getDerivationPath(constants
          .BITCOIN_LEGACY_ADDRESS, accountIndex, false, index),
        showOnTrezor: false,
        coin,
      });
      bundle.push({
        path: TrezorConnect.getDerivationPath(constants
          .BITCOIN_LEGACY_ADDRESS, accountIndex, true, index),
        showOnTrezor: false,
        coin,
      });
      bundle.push({
        path: TrezorConnect.getDerivationPath(constants
          .BITCOIN_SEGWIT_ADDRESS, accountIndex, false, index),
        showOnTrezor: false,
        coin,
      });
      bundle.push({
        path: TrezorConnect.getDerivationPath(constants
          .BITCOIN_SEGWIT_ADDRESS, accountIndex, true, index),
        showOnTrezor: false,
        coin,
      });
      bundle.push({
        path: TrezorConnect.getDerivationPath(constants
          .BITCOIN_NATIVE_SEGWIT_ADDRESS, accountIndex, false, index),
        showOnTrezor: false,
        coin,
      });
      bundle.push({
        path: TrezorConnect.getDerivationPath(constants
          .BITCOIN_NATIVE_SEGWIT_ADDRESS, accountIndex, true, index),
        showOnTrezor: false,
        coin,
      });
    }
    return bundle;
  }

  // eslint-disable-next-line max-len
  // eslint-disable-next-line no-inner-declarations,@typescript-eslint/no-empty-function,@typescript-eslint/no-unused-vars
  static manifest(params: { email: string, appUrl: string }): void {}

  static getAddress(params: { bundle: GetAddress[] }):
    Promise<getAddressResponse> {
    return new Promise<getAddressResponse>((resolve) => {
      const response: getAddressResponse = {
        success: true,
        payload: [],
      };
      if (params.bundle.length > 0 && params.bundle.length <= mockedData.addressList.length) {
        response.payload = params.bundle.map((getAddressItem: GetAddress, index: number) => ({
          address: mockedData.addressList[index].address,
          serializedPath: getAddressItem.path.toString(),
          path: mockedData.addressList[index].path,
        }));
      } else {
        response.success = false;
        response.payload = { error: 'Missing bundle data' };
      }
      resolve(response);
    });
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  static signTransaction(params: SignTransaction):
    Promise<signTransactionResponse> {
    return new Promise<signTransactionResponse>((resolve) => {
      const response: signTransactionResponse = {
        success: true,
        payload: {
          serializedTx: mockedData.signedTx,
        },
      };
      resolve(response);
    });
  }
}
