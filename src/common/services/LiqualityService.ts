import * as bitcoin from 'bitcoinjs-lib';
import {
  BtcAccount,
  LiqualityError,
  LiqualityGetAddressesResponse,
  LiqualityMethods, LiqualitySignedTx,
  LiqualityTx,
  WalletAddress,
  WindowBitcoinProvider,
  LiqualityGetNetworkResponse,
} from '@/common/types';
import { WalletService } from '@/common/services/index';
import * as constants from '@/common/store/constants';
import { EnvironmentAccessorService } from '@/common/services/enviroment-accessor.service';

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
    error.messageInstallationToUser = '';
    error.installationLink = '';
    return error;
  }

  private static wrongNetwork(): LiqualityError {
    const error = new LiqualityError();
    error.message = 'You are not in the required Network. Check Liquality and try again';
    error.messageInstallationToUser = '';
    error.installationLink = '';
    return error;
  }

  private static unableToRetrieveInfo(): LiqualityError {
    const error = new LiqualityError();
    error.message = 'Unable to retrieve information from Liquality. Make sure is the only wallet extension enabled and try again.';
    error.messageInstallationToUser = '';
    error.installationLink = '';
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
          if (!changeAddreses || !noChangeAddresses) {
            reject(LiqualityService.unableToRetrieveInfo());
          }

          const addresses = noChangeAddresses as LiqualityGetAddressesResponse[];
          addresses.concat(changeAddreses as LiqualityGetAddressesResponse[])
            .forEach((liqualityAddress: LiqualityGetAddressesResponse) => {
              walletAddresses.push({
                address: liqualityAddress.address,
                derivationPath: liqualityAddress.derivationPath,
                publicKey: liqualityAddress.publicKey,
                arrayPath: [0],
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

  getAccountAddresses(): Promise<WalletAddress[]> {
    return new Promise<WalletAddress[]>((resolve, reject) => {
      const walletAddresses: WalletAddress[] = [];
      const { lastIndex, count } = this.addressesToFetch.nativeSegwit;
      this.enable()
        .then(() => this.checkApp())
        .then(() => Promise.all([
          this.bitcoinProvider.request({
            method: LiqualityMethods.GET_ADDRESS,
            params: [lastIndex, count, true],
          }),
          this.bitcoinProvider.request({
            method: LiqualityMethods.GET_ADDRESS,
            params: [lastIndex, count, false],
          }),
        ]))
        .then(([changeAddreses, noChangeAddresses]) => {
          if (!changeAddreses || !noChangeAddresses) {
            reject(LiqualityService.unableToRetrieveInfo());
          }
          const addresses = noChangeAddresses as LiqualityGetAddressesResponse[];
          addresses.concat(changeAddreses as LiqualityGetAddressesResponse[])
            .forEach((liqualityAddress: LiqualityGetAddressesResponse) => {
              walletAddresses.push({
                address: liqualityAddress.address,
                derivationPath: liqualityAddress.derivationPath,
                publicKey: liqualityAddress.publicKey,
                arrayPath: [0],
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
        .catch(() => {
          reject(new LiqualityError('User declined transaction sign'));
        });
    });
  }

  // eslint-disable-next-line class-methods-use-this,@typescript-eslint/no-unused-vars
  getXpub(accountType: BtcAccount, accountNumber: number): Promise<string> {
    return Promise.reject(new Error('Liquality does not provide the xpub value yet'));
  }

  areEnoughUnusedAddresses(): boolean {
    return this.adjacentUnusedAddresses.nativeSegwit >= constants.MAX_ADJACENT_UNUSED_ADDRESSES;
  }
}