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

export default class LeatherService extends WalletService {
  private btcProvider = window.btc;

  // eslint-disable-next-line class-methods-use-this
  name(): string {
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
      },
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
    return new Promise<void>((resolve, reject) => {
      try {
        this.btcProvider = window.btc;
        resolve();
      } catch (e) {
        reject();
      }
    });
  }

  getAccountAddresses(): Promise<WalletAddress[]> {
    return new Promise<WalletAddress[]>((resolve, reject) => {
      const walletAddresses: WalletAddress[] = [];
      this.btcProvider?.request('getAddresses')
        .then((addresses) => {
          const [nativeSegwitAddress] = addresses.result.addresses;
          walletAddresses.push({
            address: nativeSegwitAddress.address,
            derivationPath: nativeSegwitAddress.derivationPath,
            publicKey: nativeSegwitAddress.publicKey,
          });
          resolve(walletAddresses);
        })
        .catch((e) => {
          reject(e);
        });
    });
  }

  sign(tx: LeatherTx): Promise<SignedTx> {
    return new Promise((resolve, reject) => {
      this.btcProvider?.request('signPsbt', {
        hex: tx.hex,
      })
        .then((response) => {
          const { hex } = response.result;
          const signedPsbt = bitcoin.Psbt.fromHex(hex)
            .finalizeAllInputs()
            .extractTransaction()
            .toHex();
          resolve({ signedTx: signedPsbt });
        })
        .catch((e) => {
          reject(e);
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
