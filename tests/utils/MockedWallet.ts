import {
  BtcAccount, SignedTx, Step, Tx, WalletAddress,
} from '@/common/types';
import { WalletService } from '@/common/services';
import * as constants from '@/common/store/constants';

interface TestCase {
  accountAddresses: WalletAddress[];
  walletAddressPerCall: number;
  walletMaxCall: number;
  signedTx: SignedTx | Error;
  xpub: {
    legacy: string;
    segwit: string;
    nativeSegwit: string;
  }
}
export default class MockedWallet extends WalletService {
  testCase:TestCase;

  constructor(testCase: TestCase) {
    super();
    this.testCase = testCase;
  }

  // eslint-disable-next-line class-methods-use-this
  name() {
    return { formal_name: 'Mocked', short_name: 'mocked', long_name: 'MOCKED_WALLET' };
  }

  // eslint-disable-next-line class-methods-use-this
  public availableAccounts(): BtcAccount[] {
    return [
      constants.BITCOIN_LEGACY_ADDRESS,
      constants.BITCOIN_SEGWIT_ADDRESS,
      constants.BITCOIN_NATIVE_SEGWIT_ADDRESS,
    ];
  }

  // eslint-disable-next-line class-methods-use-this
  confirmationSteps(): Step[] {
    return [];
  }

  setAddresses(walletAddresses: WalletAddress[]): void {
    this.testCase.accountAddresses = walletAddresses;
  }

  getAccountAddresses(): Promise<WalletAddress[]> {
    return new Promise<WalletAddress[]>((resolve) => {
      resolve(this.testCase.accountAddresses);
    });
  }

  getWalletAddressesPerCall(): number {
    return this.testCase.walletAddressPerCall;
  }

  getWalletMaxCall(): number {
    return this.testCase.walletMaxCall;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  sign(tx: Tx): Promise<SignedTx> {
    return new Promise<SignedTx>((resolve, reject) => {
      if (this.testCase.signedTx instanceof Error) {
        reject(this.testCase.signedTx);
      } else {
        resolve(this.testCase.signedTx);
      }
    });
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  getXpub(accountType: BtcAccount, accountNumber: number): Promise<string> {
    switch (accountType) {
      case constants.BITCOIN_LEGACY_ADDRESS:
        return Promise.resolve(this.testCase.xpub.legacy);
      case constants.BITCOIN_NATIVE_SEGWIT_ADDRESS:
        return Promise.resolve(this.testCase.xpub.segwit);
      case constants.BITCOIN_SEGWIT_ADDRESS:
        return Promise.resolve(this.testCase.xpub.nativeSegwit);
      default:
        return Promise.resolve(this.testCase.xpub.legacy);
    }
  }

  // eslint-disable-next-line class-methods-use-this
  isConnected(): Promise<boolean> {
    return Promise.resolve(false);
  }

  // eslint-disable-next-line class-methods-use-this
  reconnect(): Promise<void> {
    return Promise.resolve();
  }

  // eslint-disable-next-line class-methods-use-this
  areEnoughUnusedAddresses(): boolean {
    return false;
  }
}
