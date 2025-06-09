/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable class-methods-use-this */
import * as constants from '@/common/store/constants';
import {
  WalletAddress, Tx, SignedTx, BtcAccount,
} from '../types';
import WalletService from './WalletService';

export default class ReownService extends WalletService {
  connectedAddress: WalletAddress;

  constructor(connectedAddress: WalletAddress) {
    super();
    this.connectedAddress = connectedAddress;
  }

  getAccountAddresses(): Promise<WalletAddress[]> {
    return Promise.resolve([this.connectedAddress]);
  }

  sign(tx: Tx): Promise<SignedTx> {
    throw new Error('Method not implemented.');
  }

  isConnected(): Promise<boolean> {
    return Promise.resolve(!!this.connectedAddress);
  }

  reconnect(): Promise<void> {
    throw new Error('Method not implemented.');
  }

  getXpub(accountType: BtcAccount, accountNumber: number): Promise<string> {
    throw new Error('Method not implemented.');
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

  name(): Record<'formal_name' | 'short_name' | 'long_name', string> {
    return constants.WALLET_NAMES.REOWN;
  }

  public availableAccounts(): BtcAccount[] {
    return [
      BtcAccount.BITCOIN_NATIVE_SEGWIT_ADDRESS,
      BtcAccount.BITCOIN_SEGWIT_ADDRESS,
    ];
  }
}
