import TrezorConnect, { GetAddress, SignTransaction } from 'trezor-connect';
import {WalletAddress} from "@/store/peginTx/types";
import * as constants from '@/store/constants';

export default class TrezorService {
  private coin: string;

  constructor() {
    this.coin = 'test';
    TrezorConnect.manifest({
        email: 'ronald@trugroup.tech',
        appUrl: 'https://trugroup.tech/',
    });
  }

  private getDerivationPath(accountType: string, accountIdx: number,
                            change: boolean, addressIdx: number ): string {
    const coinPath: string = this.coin == 'bitcoin' ? "/0'": "/1'";
    let derivationPath: string = "m";
    switch (accountType) {
      case constants.BITCOIN_LEGACY_ADDRESS:
        derivationPath += "/44'";
        break;
      case constants.BITCOIN_SEGWIT_ADDRESS:
        derivationPath += "/49'";
        break;
      case constants.BITCOIN_NATIVE_SEGWIT_ADDRESS:
        derivationPath += "/84'";
        break;
      default:
        derivationPath += "/44'";
    }
    const changePath: string = change ? "/1" : "/0";
    derivationPath += coinPath + `/${accountIdx}'` + changePath + `/${addressIdx}`;
    return derivationPath;
  }

  getAddressList(accountType: string, accountIndex: number, addressStartIndex: number,
                 batch: number): Promise<WalletAddress> | Error{
    return new Promise((resolve, reject) => {
      let bundle: GetAddress[] = [];
      for (let index = addressStartIndex; index < batch + addressStartIndex; index++) {
        bundle.push({
          path: this.getDerivationPath(accountType,accountIndex,false, index),
          showOnTrezor: false,
          coin: this.coin,
        });
        bundle.push({
          path: this.getDerivationPath(accountType,accountIndex,true, index),
          showOnTrezor: false,
          coin: this.coin,
        });
      }
      TrezorConnect.getAddress({
        bundle: bundle,
      })
      .then((result) => {
        if (!result.success) reject(new Error(result.payload.error));
        
      })
    });
  }
}
