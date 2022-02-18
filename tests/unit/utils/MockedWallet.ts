import { WalletService } from '@/services/WalletService';
import * as constants from '@/store/constants';
import { WalletAddress } from '@/store/peginTx/types';
import { LedgerSignedTx, TrezorSignedTx, Tx } from '@/types';

interface TestCase {
  accountAddresses: WalletAddress[];
  walletAddressPerCall: number;
  walletMaxCall: number;
  signedTx: TrezorSignedTx | LedgerSignedTx | Error;
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

  getAccountAddresses(batch: number, startFrom: number): Promise<WalletAddress[]> {
    return new Promise<WalletAddress[]>((resolve, reject) => {
      const walletAddresses: WalletAddress[] = [];
      if (this.testCase.accountAddresses.length >= (startFrom + batch)) {
        for (let index = startFrom; index < (startFrom + batch); index += 1) {
          walletAddresses.push(this.testCase.accountAddresses[index]);
        }
        resolve(walletAddresses);
      } else {
        reject(new Error('Not enough WalletAddresses defined'));
      }
    });
  }

  getWalletAddressesPerCall(): number {
    return this.testCase.walletAddressPerCall;
  }

  getWalletMaxCall(): number {
    return this.testCase.walletMaxCall;
  }

  sign(tx: Tx): Promise<TrezorSignedTx | LedgerSignedTx> {
    return new Promise<TrezorSignedTx | LedgerSignedTx>((resolve, reject) => {
      if (this.testCase.signedTx instanceof Error) {
        reject(this.testCase.signedTx);
      } else {
        resolve(this.testCase.signedTx);
      }
    });
  }
}
