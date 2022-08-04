import * as constants from '@/store/constants';
import SatoshiBig from '@/types/SatoshiBig';
import { ApiService } from '@/services';
import { Purpose, SignedTx } from '@/types/Wallets';
import {
  AccountBalance, AddressStatus, AppNetwork, BtcAccount, Tx, WalletAddress,
} from '@/types';
import { EnvironmentAccessorService } from '@/services/enviroment-accessor.service';
import { deriveBatchAddresses } from '@/utils';
import { getAccountType } from '@/services/utils';

export default abstract class WalletService {
  protected network: AppNetwork;

  protected extendedPubKeys: {
    p2pkh: string;
    p2sh: string;
    p2wpkh: string;
  };

  protected currentAccount = 0;

  protected subscribers:
    Array<(balance: AccountBalance, addressList: WalletAddress[]) => void > = [];

  private loadingBalances = false;

  private balanceAccumulated: AccountBalance = {
    legacy: new SatoshiBig(0, 'satoshi'),
    segwit: new SatoshiBig(0, 'satoshi'),
    nativeSegwit: new SatoshiBig(0, 'satoshi'),
  };

  private adjacentUnusedAddresses: { segwit: number; legacy: number; nativeSegwit: number };

  constructor() {
    this.network = EnvironmentAccessorService.getEnvironmentVariables().vueAppCoin;
    this.extendedPubKeys = {
      p2pkh: '',
      p2sh: '',
      p2wpkh: '',
    };
    this.adjacentUnusedAddresses = {
      legacy: 0,
      segwit: 0,
      nativeSegwit: 0,
    };
  }

  abstract getAccountAddresses(batch: number, index: number): Promise<WalletAddress[]>;

  abstract sign(tx: Tx): Promise<SignedTx>;

  abstract isConnected(): Promise<boolean>;

  abstract reconnect(): Promise<void>;

  abstract getXpub(accountType: BtcAccount, accountNumber: number): Promise<string>;

  public isLoadingBalances2(): boolean {
    return this.loadingBalances;
  }

  get isLoadingBalances(): boolean {
    return this.loadingBalances;
  }

  protected getAccountPath(accountType: string, accountIdx: number): string {
    const coinPath: string = this.network === constants.BTC_NETWORK_MAINNET ? "/0'" : "/1'";
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

  public async startAskingForBalance(sessionId: string, maxAmountPegin: number): Promise<void> {
    this.balanceAccumulated = {
      legacy: new SatoshiBig(0, 'satoshi'),
      segwit: new SatoshiBig(0, 'satoshi'),
      nativeSegwit: new SatoshiBig(0, 'satoshi'),
    };
    this.loadingBalances = true;
    const maxAddressPerCall: number = EnvironmentAccessorService
      .getEnvironmentVariables().vueAppWalletAddressPerCall;
    const addressHardStop: number = EnvironmentAccessorService
      .getEnvironmentVariables().vueAppWalletAddressHardStop;
    let startFrom = 0;
    this.adjacentUnusedAddresses = {
      legacy: 0,
      segwit: 0,
      nativeSegwit: 0,
    };
    try {
      while (this.subscribers.length !== 0 && !this.areEnoughUnusedAddresses()) {
        // eslint-disable-next-line no-await-in-loop
        await this.askForBalance(sessionId, startFrom);
        const maxAmountPeginCompare = new SatoshiBig(maxAmountPegin, 'satoshi');
        if (this.balanceAccumulated.legacy.gte(maxAmountPeginCompare)
          && this.balanceAccumulated.segwit.gte(maxAmountPeginCompare)
          && this.balanceAccumulated.nativeSegwit.gte(maxAmountPeginCompare)
        ) {
          return;
        }
        if (startFrom >= addressHardStop) {
          throw new Error('Max address number reached');
        }
        startFrom += maxAddressPerCall;
      }
      this.informSubscribers(this.balanceAccumulated, []);
    } catch (error) {
      if (!error.message) {
        error.message = 'Error fetching balance';
      }
      throw error;
    } finally {
      this.loadingBalances = false;
    }
  }

  private async askForBalance(sessionId: string, startFrom: number): Promise<void> {
    const maxAddressPerCall: number = EnvironmentAccessorService
      .getEnvironmentVariables().vueAppWalletAddressPerCall;
    let addresses = await this.getAccountAddresses(maxAddressPerCall, startFrom);
    if (addresses.length === 0) {
      throw new Error('Error getting list of addresses - List of addresses is empty');
    }
    addresses = await this.getUnusedValue(addresses);
    const balancesFound = await ApiService.getBalances(sessionId, addresses);
    const balances = {
      legacy: new SatoshiBig(balancesFound.legacy || 0, 'satoshi'),
      segwit: new SatoshiBig(balancesFound.segwit || 0, 'satoshi'),
      nativeSegwit: new SatoshiBig(balancesFound.nativeSegwit || 0, 'satoshi'),
    };
    if (balances) {
      this.balanceAccumulated = {
        legacy: new SatoshiBig(this.balanceAccumulated.legacy.plus(balances.legacy), 'satoshi'),
        segwit: new SatoshiBig(this.balanceAccumulated.segwit.plus(balances.segwit), 'satoshi'),
        nativeSegwit: new SatoshiBig(this.balanceAccumulated.nativeSegwit.plus(balances.nativeSegwit), 'satoshi'),
      };
      this.informSubscribers(this.balanceAccumulated, addresses);
      return;
    }
    throw new Error('Error getting balances');
  }

  private getUnusedValue(addressList: Array<WalletAddress>): Promise<Array<WalletAddress>> {
    const addressListResponse: Array<WalletAddress> = [];
    return ApiService
      .areUnusedAddresses(addressList.map((walletAddress) => walletAddress.address))
      .then((addressStatusList: AddressStatus[]) => {
        addressStatusList.forEach((addressStatus: AddressStatus) => {
          const walletAddressItem = addressList
            .find((walletAddress) => walletAddress.address === addressStatus.address);
          if (walletAddressItem) {
            walletAddressItem.unused = addressStatus.unused;
            if (walletAddressItem.unused) {
              const accountType = getAccountType(addressStatus.address, this.network);
              switch (accountType) {
                case constants.BITCOIN_LEGACY_ADDRESS:
                  this.adjacentUnusedAddresses.legacy += 1;
                  break;
                case constants.BITCOIN_SEGWIT_ADDRESS:
                  this.adjacentUnusedAddresses.segwit += 1;
                  break;
                case constants.BITCOIN_NATIVE_SEGWIT_ADDRESS:
                  this.adjacentUnusedAddresses.nativeSegwit += 1;
                  break;
                default:
              }
            }
            addressListResponse.push(walletAddressItem);
          }
        });
        addressListResponse.forEach((walletAddressItem) => {
          const status : AddressStatus | undefined = addressStatusList
            .find((statusItem) => walletAddressItem.address === statusItem.address);
            // eslint-disable-next-line no-param-reassign
          walletAddressItem.unused = status ? status.unused : false;
        });
        return addressListResponse;
      });
  }

  protected async setAccountsXpub(accountIdx: number): Promise<void> {
    this.extendedPubKeys = {
      p2pkh: await this.getXpub(constants.BITCOIN_LEGACY_ADDRESS, accountIdx),
      p2sh: await this.getXpub(constants.BITCOIN_SEGWIT_ADDRESS, accountIdx),
      p2wpkh: await this.getXpub(constants.BITCOIN_NATIVE_SEGWIT_ADDRESS, accountIdx),
    };
  }

  protected getDerivedAddresses(batch: number, startFrom: number) : Array<WalletAddress> {
    const batchPerAccount = Math.ceil(batch / 3);
    return deriveBatchAddresses(
      this.extendedPubKeys.p2wpkh,
      Purpose.P2WPKH,
      startFrom,
      batchPerAccount,
    ).concat(deriveBatchAddresses(
      this.extendedPubKeys.p2sh,
      Purpose.P2SH,
      startFrom,
      batchPerAccount,
    )).concat(deriveBatchAddresses(
      this.extendedPubKeys.p2pkh,
      Purpose.P2PKH,
      startFrom,
      batchPerAccount,
    ));
  }

  private areEnoughUnusedAddresses(): boolean {
    return (this.adjacentUnusedAddresses.legacy >= 20
      && this.adjacentUnusedAddresses.segwit >= 20
      && this.adjacentUnusedAddresses.nativeSegwit >= 20);
  }
}
