import {
  LiqualityTx,
  WalletAddress,
  LiqualityError,
  LiqualityMethods,
  LiqualitySignedTx,
  WindowBitcoinProvider,
  LiqualityGetNetworkResponse,
  LiqualityGetAddressesResponse,
  LiqualityResponse,
} from '@/types';
import * as bitcoin from 'bitcoinjs-lib';
import { WalletService } from '@/services';
import * as constants from '@/store/constants';
import { EnvironmentAccessorService } from '@/services/enviroment-accessor.service';

export default class LiqualityService extends WalletService {
  private bitcoinProvider!: WindowBitcoinProvider;

  constructor(testBitcoinProvider?: WindowBitcoinProvider) {
    super();
    if (testBitcoinProvider) {
      this.bitcoinProvider = testBitcoinProvider;
    }
  }

  private enable(): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      try {
        this.bitcoinProvider = window.bitcoin;
        this.bitcoinProvider.enable()
          .then(() => {
            resolve();
          }, () => {
            reject(LiqualityService.deniedOrPopUpClosed());
          });
      } catch (e) {
        reject(new LiqualityError());
      }
    });
  }

  private static deniedOrPopUpClosed(): LiqualityError {
    const error = new LiqualityError();
    error.message = 'Liquality is closed or Account is not selected';
    return error;
  }

  private static wrongNetwork(): LiqualityError {
    const error = new LiqualityError();
    error.message = 'You are not in the required Network. Check Liquality and try again';
    return error;
  }

  // eslint-disable-next-line class-methods-use-this
  async isConnected(): Promise<boolean> {
    return new Promise<boolean>((resolve, reject) => {
      const walletAddresses: WalletAddress[] = [];
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
          const addresses = noChangeAddresses as LiqualityGetAddressesResponse[];
          addresses.concat(changeAddreses as LiqualityGetAddressesResponse[])
            .forEach((liqualityAddress: LiqualityGetAddressesResponse) => {
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
    return new Promise<WalletAddress[]>((resolve, reject) => {
      const walletAddresses: WalletAddress[] = [];
      this.enable()
        .then(() => this.checkApp())
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
          const addresses = noChangeAddresses as LiqualityGetAddressesResponse[];
          addresses.concat(changeAddreses as LiqualityGetAddressesResponse[])
            .forEach((liqualityAddress: LiqualityGetAddressesResponse) => {
              walletAddresses.push({
                address: liqualityAddress.address,
                serializedPath: liqualityAddress.derivationPath,
                publicKey: liqualityAddress.publicKey,
                path: [0],
              });
            });
          resolve(walletAddresses);
        })
        .catch((e) => {
          let error = e;
          if (!e.errorType) {
            error = new LiqualityError();
          }
          reject(error);
        });
    });
  }

  private async checkApp(): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      try {
        this.bitcoinProvider = window.bitcoin;
        this.bitcoinProvider.request({
          method: LiqualityMethods.GET_CONNECTED_NETWORK,
          params: [],
        })
          .then((liqualityResponse) => {
            const response = liqualityResponse as LiqualityGetNetworkResponse;
            const network = EnvironmentAccessorService.getEnvironmentVariables().vueAppCoin;
            let valid: boolean;
            switch (response.isTestnet) {
              case true:
                valid = network === constants.BTC_NETWORK_TESTNET;
                break;
              case false:
                valid = network === constants.BTC_NETWORK_MAINNET;
                break;
              default:
                valid = false;
            }
            if (valid) resolve();
            else reject(LiqualityService.wrongNetwork());
          }, () => {
            reject(LiqualityService.wrongNetwork());
          });
      } catch (e) {
        reject(new LiqualityError());
      }
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

  signOld(tx: LiqualityTx): Promise<LiqualitySignedTx> {
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

  sign(tx: LiqualityTx): Promise<LiqualitySignedTx> {
    const liqualityTx = tx as LiqualityTx;
    return new Promise<LiqualitySignedTx>((resolve, reject) => {
      this.enable()
        .then(() => this.checkApp())
        .then(() => this.liqualitySign(liqualityTx))
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

  liqualitySign(liqualityTx: LiqualityTx): Promise<LiqualityResponse> {
    return this.bitcoinProvider.request({
      method: LiqualityMethods.SIGN_PSBT,
      params: [
        liqualityTx.base64UnsignedPsbt,
        liqualityTx.inputs,
      ],
    });
  }
}
