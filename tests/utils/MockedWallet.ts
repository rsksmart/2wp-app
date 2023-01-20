import {
  BtcAccount,
  LedgerSignedTx, TrezorSignedTx, Tx, WalletAddress,
} from '@/types';
import { WalletService } from '@/services';
import * as constants from '@/store/constants';

interface TestCase {
  accountAddresses: WalletAddress[];
  walletAddressPerCall: number;
  walletMaxCall: number;
  signedTx: TrezorSignedTx | LedgerSignedTx | Error;
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
  sign(tx: Tx): Promise<TrezorSignedTx | LedgerSignedTx> {
    return new Promise<TrezorSignedTx | LedgerSignedTx>((resolve, reject) => {
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
}
