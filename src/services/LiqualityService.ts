import * as bitcoin from 'bitcoinjs-lib';
import {
  LiqualityError,
  LiqualityGetAddressesResponse,
  LiqualityMethods, LiqualitySignedTx,
  LiqualityTx,
  WalletAddress,
  WindowBitcoinProvider,
} from '@/types';
import { WalletService } from '@/services';
import { EnvironmentAccessorService } from '@/services/enviroment-accessor.service';

export default class LiqualityService extends WalletService {
  private bitcoinProvider!: WindowBitcoinProvider;

  private recall = false;

  constructor(testBitcoinProvider?: WindowBitcoinProvider) {
    super();
    if (testBitcoinProvider) {
      this.bitcoinProvider = testBitcoinProvider;
    }
  }

  private enable(): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      try {
        console.log('enable called');
        this.bitcoinProvider = window.bitcoin;
        this.bitcoinProvider.enable()
          .then(() => {
            resolve();
          }, (e) => {
            console.log(`ENABLE TRYING TO CAPTURE ${e}`);
            reject(LiqualityService.noEnableError());
          });
      } catch (e) {
        reject(new LiqualityError());
      }
    });
  }

  private static noEnableError(): LiqualityError {
    const error = new LiqualityError();
    error.message = 'Liquality is closed or Account is not selected';
    return error;
  }

  // private attachErrorListener() {
  //   window.addEventListener('unhandledrejection', (event) => {
  //     if (!event.reason) {
  //       this.recall = true;
  //       this.enable();
  //     } else {
  //       throw new LiqualityError();
  //     }
  //   });
  // }

  // eslint-disable-next-line class-methods-use-this
  async isConnected(): Promise<boolean> {
    console.log('isConnected');
    return new Promise<boolean>((resolve, reject) => {
      const walletAddresses: WalletAddress[] = [];
      console.log('enable()');
      this.enable()
        .then(() => Promise.all([
          this.bitcoinProvider.request({
            method: LiqualityMethods.GET_ADDRESS,
            params: [0, 1, true],
          }),
          this.bitcoinProvider.request({
            method: LiqualityMethods.GET_ADDRESS,
            params: [0, 1, false],
          }),
        ]))
        .then(([changeAddreses, noChangeAddresses]) => {
          console.log('ChangeAddreses and noChangeAdresses obtained...');
          const addresses = noChangeAddresses as LiqualityGetAddressesResponse[];
          console.log(`addresses obtained ${addresses} `);
          addresses.concat(changeAddreses as LiqualityGetAddressesResponse[])
            .forEach((liqualityAddress: LiqualityGetAddressesResponse) => {
              console.log(`forEach ${walletAddresses}`);
              walletAddresses.push({
                address: liqualityAddress.address,
                serializedPath: liqualityAddress.derivationPath,
                publicKey: liqualityAddress.publicKey,
                path: [0],
              });
            });
          resolve(true);
        }).catch(reject);
    });
  }

  // eslint-disable-next-line class-methods-use-this
  reconnect(): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      try {
        this.bitcoinProvider = window.bitcoin;
        resolve();
      } catch (e) {
        reject(new LiqualityError());
      }
    });
  }

  getAccountAddresses(batch: number, index: number): Promise<WalletAddress[]> {
    console.log('getAccountAddresses');
    return new Promise<WalletAddress[]>((resolve, reject) => {
      const walletAddresses: WalletAddress[] = [];
      console.log('enable()');
      this.enable()
        .then(() => Promise.all([
          this.bitcoinProvider.request({
            method: LiqualityMethods.GET_ADDRESS,
            params: [index, batch, true],
          }),
          this.bitcoinProvider.request({
            method: LiqualityMethods.GET_ADDRESS,
            params: [index, batch, false],
          }),
        ]))
        .then(([changeAddreses, noChangeAddresses]) => {
          console.log('ChangeAddreses and noChangeAdresses obtained...');
          const addresses = noChangeAddresses as LiqualityGetAddressesResponse[];
          console.log(`addresses obtained ${addresses} `);
          addresses.concat(changeAddreses as LiqualityGetAddressesResponse[])
            .forEach((liqualityAddress: LiqualityGetAddressesResponse) => {
              console.log(`forEach ${walletAddresses}`);
              walletAddresses.push({
                address: liqualityAddress.address,
                serializedPath: liqualityAddress.derivationPath,
                publicKey: liqualityAddress.publicKey,
                path: [0],
              });
            });
          resolve(walletAddresses);
        })
        .then(console.log)
        .catch((error) => {
          console.log(`Error on LiqualityService::getAccountAddresses ${error}`);
          console.log(error);
          reject(new LiqualityError());
        });
    });
  }

  // eslint-disable-next-line class-methods-use-this
  public getWalletAddressesPerCall(): number {
    return EnvironmentAccessorService
      .getEnvironmentVariables().vueAppWalletAddressesPerCallLiquality;
  }

  // eslint-disable-next-line class-methods-use-this
  public getWalletMaxCall(): number {
    return EnvironmentAccessorService.getEnvironmentVariables().vueAppWalletMaxCallLiquality;
  }

  sign(tx: LiqualityTx): Promise<LiqualitySignedTx> {
    const liqualityTx = tx as LiqualityTx;
    return new Promise<LiqualitySignedTx>((resolve, reject) => {
      this.bitcoinProvider.request({
        method: LiqualityMethods.SIGN_PSBT,
        params: [
          liqualityTx.base64UnsignedPsbt,
          liqualityTx.inputs,
        ],
      })
        .then((signedBase64Psbt) => {
          const signedPsbt = bitcoin.Psbt.fromBase64(signedBase64Psbt as string);
          if (!signedPsbt.validateSignaturesOfAllInputs()) {
            reject(new Error('Invalid signature provided'));
          } else {
            resolve({
              signedTx: signedPsbt.finalizeAllInputs().extractTransaction().toHex(),
            });
          }
        })
        .catch(reject);
    });
  }
}
