import * as bitcoin from 'bitcoinjs-lib';
import {
  LiqualityAddress,
  LiqualityGetAddressesResponse,
  LiqualityMethods,
  LiqualityTx,
  SignedTx,
  Tx,
  WalletAddress,
  WindowBitcoinProvider,
} from '@/types';
import { WalletService } from '@/services';
import { EnvironmentAccessorService } from '@/services/enviroment-accessor.service';

export default class LiqualityService extends WalletService {
  bitcoinProvider!: WindowBitcoinProvider;

  enabled = false;

  private enable(): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      const w = window as Window;
      if (!this.enabled) {
        try {
          if (w.bitcoin) {
            this.bitcoinProvider = window.bitcoin;
            this.bitcoinProvider.enable()
              .then(([address]: LiqualityAddress[]) => {
                this.enabled = !!address;
                resolve();
              });
          }
        } catch (e) {
          reject(e);
        }
      } else {
        resolve();
      }
    });
  }

  getAccountAddresses(batch: number, index: number): Promise<WalletAddress[]> {
    return new Promise<WalletAddress[]>((resolve, reject) => {
      const walletAddresses: WalletAddress[] = [];
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
        .catch(reject);
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

  // eslint-disable-next-line class-methods-use-this
  sign(tx: Tx): Promise<SignedTx> {
    const liqualityTx = tx as LiqualityTx;
    return new Promise<SignedTx>((resolve, reject) => {
      this.bitcoinProvider.request({
        method: LiqualityMethods.SIGN_PSBT,
        params: [
          liqualityTx.base64UnsignedPsbt,
          liqualityTx.inputs,
        ],
      })
        .then((signedBase64Psbt) => {
          const signedPsbt = bitcoin.Psbt.fromBase64(signedBase64Psbt as string);
          signedPsbt.finalizeAllInputs();
          if (!signedPsbt.validateSignaturesOfAllInputs()) {
            reject(new Error('Invalid signature provided'));
          } else {
            resolve({
              signedTx: signedPsbt.extractTransaction().toHex(),
            });
          }
        })
        .catch(reject);
    });
  }
}
