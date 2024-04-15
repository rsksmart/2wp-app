import {
  BtcAccount,
  WalletAddress,
  Step,
  SignedTx,
} from '@/common/types';
import { WalletService } from '@/common/services/index';
import * as constants from '@/common/store/constants';
import { LeatherTx } from '@/pegin/middleware/TxBuilder/LeatherTxBuilder';
// import { GetAddressPayload, AddressPurposes, Address, GetAddressResponse } from '@/common/types/Exodus';
import { AppConfig, UserSession } from '@stacks/connect';

export default class ExodusService extends WalletService {
  private btcProvider;

  userSession: UserSession;

  constructor() {
    super();
    this.btcProvider = window.btc;
    const appConfig = new AppConfig();
    this.userSession = new UserSession({ appConfig });
  }

  // eslint-disable-next-line class-methods-use-this
  name(): string {
    return constants.WALLET_NAMES.EXODUS.short_name;
  }

  // eslint-disable-next-line class-methods-use-this
  public availableAccounts(): BtcAccount[] {
    return [
      constants.BITCOIN_NATIVE_SEGWIT_ADDRESS,
      constants.BITCOIN_SEGWIT_ADDRESS,
      constants.BITCOIN_LEGACY_ADDRESS,
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
    // IMPLEMENT
    return Promise.resolve(false);
  }

  // eslint-disable-next-line class-methods-use-this
  reconnect(): Promise<void> {
    // IMPLEMENT
    return Promise.resolve();
  }

  // eslint-disable-next-line class-methods-use-this
  getAccountAddresses(): Promise<WalletAddress[]> {
    // IMPLEMENT
    return Promise.reject();
  }

  // eslint-disable-next-line class-methods-use-this
  sign(tx: LeatherTx): Promise<SignedTx> {
    console.log(tx);
    // IMPLEMENT
    return Promise.reject();
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
