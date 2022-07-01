import * as constants from '@/store/constants';
import SatoshiBig from '@/types/SatoshiBig';
import { ApiService } from '@/services';
import { SignedTx } from '@/types/Wallets';
import {
  WalletAddress, AccountBalance, Tx, AddressStatus, BtcAccount,
} from '@/types';
import { EnvironmentAccessorService } from '@/services/enviroment-accessor.service';

export default abstract class WalletService {
  protected coin: string;

  protected subscribers:
    Array<(balance: AccountBalance, addressList: WalletAddress[]) => void > = [];

  private loadingBalances = false;

  constructor() {
    this.coin = EnvironmentAccessorService.getEnvironmentVariables().vueAppCoin;
  }

  abstract getAccountAddresses(batch: number, index: number): Promise<WalletAddress[]>;

  abstract getWalletAddressesPerCall(): number;

  abstract getWalletMaxCall(): number;

  abstract sign(tx: Tx): Promise<SignedTx>;

  abstract getXpub(accountType: BtcAccount, accountNumber: number): Promise<string>;

  public isLoadingBalances2(): boolean {
    return this.loadingBalances;
  }

  get isLoadingBalances(): boolean {
    return this.loadingBalances;
  }

  protected getAccountPath(accountType: string, accountIdx: number): string {
    const coinPath: string = this.coin === constants.BTC_NETWORK_MAINNET ? "/0'" : "/1'";
    let accountPath = 'm';
    switch (accountType) {
      case constants.BITCOIN_LEGACY_ADDRESS:
        accountPath += "/44'";
        break;
      case constants.BITCOIN_SEGWIT_ADDRESS:
        accountPath += "/49'";
        break;
      case constants.BITCOIN_NATIVE_SEGWIT_ADDRESS:
        accountPath += "/84'";
        break;
      default:
        accountPath += "/44'";
    }
    return `${accountPath}${coinPath}/${accountIdx}'`;
  }

  protected getDerivationPath(accountType: string, accountIdx: number, change: boolean,
    addressIdx: number): string {
    const changePath: string = change ? '/1' : '/0';
    return `${this.getAccountPath(accountType, accountIdx)}${changePath}/${addressIdx}`;
  }

  // eslint-disable-next-line class-methods-use-this
  protected getSerializedPath(path: string): number[] {
    const tmpPath = path.substr(2, path.length);
    const [accountType, chain, accountIdx, change, addressIdx] = tmpPath.split('/');
    // eslint-disable-next-line no-bitwise
    return [(+accountType.substring(0, 2) | 0x80000000) >>> 0,
      // eslint-disable-next-line no-bitwise
      (+chain.substring(0, 1) | 0x80000000) >>> 0,
      // eslint-disable-next-line no-bitwise
      (+accountIdx.substring(0, 1) | 0x80000000) >>> 0, +change, +addressIdx];
  }

  public subscribe(subscriber: (balance: AccountBalance, addressList: WalletAddress[]) => void):
    void {
    this.subscribers.push(subscriber);
  }

  public unsubscribe(subscriber: (balance: AccountBalance, addressList: WalletAddress[]) => void):
    void {
    const idx = this.subscribers.findIndex((s) => s === subscriber);
    if (idx !== -1) {
      this.subscribers.splice(idx, 1);
    }
  }

  public cleanSubscriptions(): void {
    this.subscribers = [];
  }

  public stopAskingForBalance(): Promise<void> {
    let counter = 60;
    const period = 500;
    return new Promise<void>((resolve, reject) => {
      this.cleanSubscriptions();
      const askingBalance = setInterval(() => {
        if (counter === 0 && this.isLoadingBalances) {
          clearInterval(askingBalance);
          reject(new Error('Can not stop asking for balance'));
        }
        if (!this.isLoadingBalances) {
          clearInterval(askingBalance);
          resolve();
        } else {
          counter -= 1;
        }
      }, period);
    });
  }

  protected informSubscribers(balance: AccountBalance, addressList:WalletAddress[]): void {
    this.subscribers.forEach((s) => s(balance, addressList));
  }

  private hasSubscribers(): boolean {
    return (this.subscribers.length > 0);
  }

  // eslint-disable-next-line class-methods-use-this
  public async startAskingForBalance(sessionId: string, maxAmountPegin: number): Promise<void> {
    // eslint-disable-next-line prefer-const
    let balanceAccumulated: AccountBalance = {
      legacy: new SatoshiBig(0, 'satoshi'),
      segwit: new SatoshiBig(0, 'satoshi'),
      nativeSegwit: new SatoshiBig(0, 'satoshi'),
    };
    this.loadingBalances = true;
    const maxAddressPerCall: number = this.getWalletAddressesPerCall();
    let addresses: WalletAddress[] = [];
    try {
      for (
        let startFrom = 0;
        startFrom < (this.getWalletMaxCall() * maxAddressPerCall) && this.subscribers.length !== 0;
        startFrom += maxAddressPerCall
      ) {
        // eslint-disable-next-line no-await-in-loop
        addresses = await this.getAccountAddresses(maxAddressPerCall, startFrom);
        if (addresses.length === 0) {
          throw new Error('Error getting list of addresses - List of addresses is empty');
        }
        // eslint-disable-next-line no-await-in-loop
        addresses = await WalletService.getUnusedValue(addresses);
        // eslint-disable-next-line no-await-in-loop
        const balancesFound = await ApiService.getBalances(sessionId, addresses);
        const balances = {
          legacy: new SatoshiBig(balancesFound.legacy || 0, 'satoshi'),
          segwit: new SatoshiBig(balancesFound.segwit || 0, 'satoshi'),
          nativeSegwit: new SatoshiBig(balancesFound.nativeSegwit || 0, 'satoshi'),
        };
        if (startFrom + maxAddressPerCall >= (this.getWalletMaxCall() * maxAddressPerCall)) {
          this.loadingBalances = false;
        }
        // eslint-disable-next-line no-extra-boolean-cast
        if (!!balances) {
          if (balances.legacy.gt(0)
            || balances.nativeSegwit.gt(0)
            || balances.segwit.gt(0)) {
            balanceAccumulated = {
              legacy: new SatoshiBig(balanceAccumulated.legacy.plus(balances.legacy), 'satoshi'),
              segwit: new SatoshiBig(balanceAccumulated.segwit.plus(balances.segwit), 'satoshi'),
              nativeSegwit: new SatoshiBig(balanceAccumulated.nativeSegwit.plus(balances.nativeSegwit), 'satoshi'),
            };
          } else {
            const areAllAddressUnused = addresses
              .every((walletAddressItem) => walletAddressItem.unused);
            if (areAllAddressUnused) return;
          }
          this.informSubscribers(balanceAccumulated, addresses);
        } else {
          throw new Error('Error getting balances');
        }
        const maxAmountPeginCompare = new SatoshiBig(maxAmountPegin, 'satoshi');
        if (balanceAccumulated.legacy.gte(maxAmountPeginCompare)
          && balanceAccumulated.segwit.gte(maxAmountPeginCompare)
          && balanceAccumulated.nativeSegwit.gte(maxAmountPeginCompare)
        ) {
          return;
        }
      }
    } catch (error: any) {
      throw new Error(`Balance Error: ${error.message}`);
    } finally {
      this.loadingBalances = false;
      this.informSubscribers(balanceAccumulated, addresses);
    }
  }

  private static getUnusedValue(addressList: WalletAddress[]): Promise<WalletAddress[]> {
    const addressListResponse = [...addressList];
    return ApiService
      .areUnusedAddresses(addressListResponse.map((walletAddress) => walletAddress.address))
      .then((addressStatusList: AddressStatus[]) => {
        addressListResponse.forEach((walletAddressItem) => {
          const status : AddressStatus | undefined = addressStatusList
            .find((statusItem) => walletAddressItem.address === statusItem.address);
            // eslint-disable-next-line no-param-reassign
          walletAddressItem.unused = status ? status.unused : false;
        });
        return addressListResponse;
      });
  }
}
