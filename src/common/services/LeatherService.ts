import * as bitcoin from 'bitcoinjs-lib';
import {
  BtcAccount,
  WalletAddress,
  Step,
  SignedTx,
} from '@/common/types';
import { WalletService } from '@/common/services/index';
import * as constants from '@/common/store/constants';
import { LeatherTx } from '@/pegin/middleware/TxBuilder/LeatherTxBuilder';
import { AppConfig, UserSession, showConnect } from '@stacks/connect';
import {
  RpcErrorResponse,
  LeatherProvider,
  RpcResponse,
} from '@leather.io/rpc';

export default class LeatherService extends WalletService {
  private btcProvider: typeof LeatherProvider;

  userSession: UserSession;

  constructor() {
    super();
    this.btcProvider = window.LeatherProvider;
    const appConfig = new AppConfig();
    this.userSession = new UserSession({ appConfig });
    this.userSession.signUserOut();
  }

  // eslint-disable-next-line class-methods-use-this
  name() {
    return constants.WALLET_NAMES.LEATHER;
  }

  // eslint-disable-next-line class-methods-use-this
  public availableAccounts(): BtcAccount[] {
    return [
      constants.BITCOIN_NATIVE_SEGWIT_ADDRESS,
    ];
  }

  // eslint-disable-next-line class-methods-use-this
  confirmationSteps(): Step[] {
    return [
      {
        title: 'Transaction information',
        subtitle: '',
        outputsToshow: {
          opReturn: {
            value: false,
            amount: true,
          },
          change: {
            address: false,
            amount: true,
          },
          federation: {
            address: true,
            amount: true,
          },
        },
        fee: true,
        fullAmount: false,
      },
    ];
  }

  // eslint-disable-next-line class-methods-use-this
  isConnected(): Promise<boolean> {
    return new Promise<boolean>((resolve) => {
      resolve(this.userSession.isUserSignedIn());
    });
  }

  reconnect(): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      try {
        showConnect(
          {
            userSession: this.userSession,
            appDetails: {
              name: 'Powpeg App',
              icon: `${window.location.origin}/favicon.ico`,
            },
            onFinish: () => {
              this.btcProvider = window.LeatherProvider;
              resolve();
            },
            onCancel: () => {
              reject(new Error('User closed the modal'));
            },
          },
          this.btcProvider,
        );
      } catch (e) {
        reject();
      }
    });
  }

  getAccountAddresses(): Promise<WalletAddress[]> {
    return new Promise<WalletAddress[]>((resolve, reject) => {
      const walletAddresses: WalletAddress[] = [];
      this.btcProvider?.request('getAddresses')
        .then((addresses: typeof RpcResponse) => {
          const [nativeSegwitAddress] = addresses.result.addresses;
          walletAddresses.push({
            address: nativeSegwitAddress.address,
            derivationPath: nativeSegwitAddress.derivationPath,
            publicKey: nativeSegwitAddress.publicKey,
          });
          resolve(walletAddresses);
        })
        .catch((e: Error) => {
          reject(e);
        });
    });
  }

  sign(tx: LeatherTx): Promise<SignedTx> {
    return new Promise((resolve, reject) => {
      this.btcProvider?.request('signPsbt', {
        hex: tx.hex,
      })
        .then((response: typeof RpcResponse) => {
          const { hex } = response.result;
          const signedPsbt = bitcoin.Psbt.fromHex(hex)
            .finalizeAllInputs()
            .extractTransaction()
            .toHex();
          resolve({ signedTx: signedPsbt });
        })
        .catch((e: typeof RpcErrorResponse) => {
          if (e.error.code) {
            reject(new Error(e.error.message));
          } else {
            reject(e);
          }
        });
    });
  }

  // eslint-disable-next-line class-methods-use-this,@typescript-eslint/no-unused-vars
  getXpub(accountType: BtcAccount, accountNumber: number): Promise<string> {
    return Promise.reject(new Error());
  }

  /** Needed to load account balance */
  executed = false;

  areEnoughUnusedAddresses(): boolean {
    if (!this.executed) {
      this.executed = true;
      return !this.executed;
    }
    return this.executed;
  }
}
