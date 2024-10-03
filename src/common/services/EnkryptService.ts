/* eslint-disable class-methods-use-this, @typescript-eslint/no-explicit-any */
import * as bitcoin from 'bitcoinjs-lib';
import {
  BtcAccount,
  WalletAddress,
  SignedTx,
} from '@/common/types';
import { WalletService } from '@/common/services/index';
import { EnkryptTx } from '@/pegin/middleware/TxBuilder/EnkryptTxBuilder';
import * as constants from '@/common/store/constants';
import ProviderError from '@enkryptcom/types';

export default class EnkryptService extends WalletService {
  private btcProvider;

  constructor() {
    super();
    if (this.network === 'test') window.enkrypt.providers.bitcoin.switchNetwork('testnet');
    this.btcProvider = window.enkrypt.providers.bitcoin;
  }

  name(): Record<'formal_name' | 'short_name' | 'long_name', string> {
    return constants.WALLET_NAMES.ENKRYPT;
  }

  getAccountAddresses(): Promise<WalletAddress[]> {
    return new Promise<WalletAddress[]>((resolve, reject) => {
      this.btcProvider.getAccounts()
        .then((addresses: string[]) => {
          const walletAddresses = addresses
            .map((address) => ({ address, derivationPath: '', publicKey: '' } as WalletAddress));
          resolve(walletAddresses);
        })
        .catch((e: typeof ProviderError) => reject(e));
    });
  }

  availableAccounts(): BtcAccount[] {
    return [constants.BITCOIN_NATIVE_SEGWIT_ADDRESS];
  }

  isConnected(): Promise<boolean> {
    return new Promise<boolean>((resolve) => {
      resolve(this.btcProvider.isConnected());
    });
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
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

  sign(tx: EnkryptTx): Promise<SignedTx> {
    return new Promise((resolve, reject) => {
      this.btcProvider?.signPsbt(tx.hex, { autoFinalized: false })
        .then((hex: string) => {
          const signedPsbt = bitcoin.Psbt.fromHex(hex)
            .finalizeAllInputs()
            .extractTransaction()
            .toHex();
          resolve({ signedTx: signedPsbt });
        })
        .catch((e: typeof ProviderError) => {
          reject(e);
        });
    });
  }

  async reconnect(): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      try {
        if (this.network === 'test') window.enkrypt.providers.bitcoin.switchNetwork('testnet');
        this.btcProvider = window.enkrypt.providers.bitcoin;
        resolve();
      } catch (e: any) {
        reject(e);
      }
    });
  }
}
