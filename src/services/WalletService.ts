import * as constants from '@/store/constants';
import SatoshiBig from '@/types/SatoshiBig';
import { ApiService } from '@/services';
import { Purpose, SignedTx, WalletCount } from '@/types/Wallets';
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

  protected adjacentUnusedAddresses: {
    legacy: {
      external: number;
      change: number;
    };
    segwit: {
      external: number;
      change: number;
    };
    nativeSegwit: {
      external: number;
      change: number;
    };
  };

  protected maxAddressPerCall: number;

  protected addressesToFetch: WalletCount;

  constructor() {
    this.network = EnvironmentAccessorService.getEnvironmentVariables().vueAppCoin;
    this.maxAddressPerCall = EnvironmentAccessorService
      .getEnvironmentVariables().vueAppWalletAddressPerCall;
    this.extendedPubKeys = {
      p2pkh: '',
      p2sh: '',
      p2wpkh: '',
    };
    this.adjacentUnusedAddresses = {
      legacy: {
        external: 0,
        change: 0,
      },
      segwit: {
        external: 0,
        change: 0,
      },
      nativeSegwit: {
        external: 0,
        change: 0,
      },
    };
    this.addressesToFetch = {
      legacy: {
        external: { lastIndex: 0, count: this.maxAddressPerCall },
        change: { lastIndex: 0, count: this.maxAddressPerCall },
      },
      segwit: {
        external: { lastIndex: 0, count: this.maxAddressPerCall },
        change: { lastIndex: 0, count: this.maxAddressPerCall },
      },
      nativeSegwit: {
        external: { lastIndex: 0, count: this.maxAddressPerCall },
        change: { lastIndex: 0, count: this.maxAddressPerCall },
      },
    };
  }

  abstract getAccountAddresses(): Promise<WalletAddress[]>;

  abstract sign(tx: Tx): Promise<SignedTx>;

  abstract isConnected(): Promise<boolean>;

  abstract reconnect(): Promise<void>;

  abstract getXpub(accountType: BtcAccount, accountNumber: number): Promise<string>;

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
    this.adjacentUnusedAddresses = {
      legacy: {
        external: 0,
        change: 0,
      },
      segwit: {
        external: 0,
        change: 0,
      },
      nativeSegwit: {
        external: 0,
        change: 0,
      },
    };
    const maxAddressesHardStop = EnvironmentAccessorService
      .getEnvironmentVariables().vueAppWalletAddressHardStop;
    try {
      while (this.hasSubscribers() && !this.areEnoughUnusedAddresses()) {
        // eslint-disable-next-line no-await-in-loop
        await this.askForBalance(sessionId);
        const maxAmountPeginCompare = new SatoshiBig(maxAmountPegin, 'satoshi');
        if (this.balanceAccumulated.legacy.gte(maxAmountPeginCompare)
          && this.balanceAccumulated.segwit.gte(maxAmountPeginCompare)
          && this.balanceAccumulated.nativeSegwit.gte(maxAmountPeginCompare)
        ) {
          break;
        }
        this.setAddressesToFetch();
        const maxIndexReached = Math.max(
          this.addressesToFetch.legacy.external.lastIndex,
          this.addressesToFetch.legacy.change.lastIndex,
          this.addressesToFetch.segwit.external.lastIndex,
          this.addressesToFetch.segwit.change.lastIndex,
          this.addressesToFetch.nativeSegwit.external.lastIndex,
          this.addressesToFetch.nativeSegwit.change.lastIndex,
        );
        if (maxIndexReached >= maxAddressesHardStop) {
          break;
        }
      }
      this.loadingBalances = false;
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

  private async askForBalance(sessionId: string): Promise<void> {
    let addresses = await this.getAccountAddresses();
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
    if (!balances) {
      throw new Error('Error getting balances');
    }
    this.balanceAccumulated = {
      legacy: new SatoshiBig(this.balanceAccumulated.legacy.plus(balances.legacy), 'satoshi'),
      segwit: new SatoshiBig(this.balanceAccumulated.segwit.plus(balances.segwit), 'satoshi'),
      nativeSegwit: new SatoshiBig(this.balanceAccumulated.nativeSegwit.plus(balances.nativeSegwit), 'satoshi'),
    };
    this.informSubscribers(this.balanceAccumulated, addresses);
  }

  private getUnusedValue(addressList: Array<WalletAddress>): Promise<Array<WalletAddress>> {
    const addressListResponse: Array<WalletAddress> = [];
    return ApiService
      .areUnusedAddresses(addressList.map((walletAddress) => walletAddress.address))
      .then((addressStatusList: AddressStatus[]) => {
        addressList.forEach((walletAddressItem: WalletAddress) => {
          const addressStatus = addressStatusList
            .find((statusItem) => statusItem.address === walletAddressItem.address);
          if (!addressStatus) {
            throw new Error('Unused value from Api not found');
          }
          const {
            derivationPath, address, publicKey, arrayPath,
          } = walletAddressItem;
          addressListResponse.push({
            derivationPath, arrayPath, address, publicKey, unused: addressStatus.unused,
          });
          const accountType = getAccountType(address, this.network);
          const isChange = derivationPath.split('/')[4] === '1';
          switch (accountType) {
            case constants.BITCOIN_LEGACY_ADDRESS:
              if (isChange) {
                this.adjacentUnusedAddresses.legacy.change = addressStatus.unused
                  ? this.adjacentUnusedAddresses.legacy.change + 1 : 0;
              } else {
                this.adjacentUnusedAddresses.legacy.external = addressStatus.unused
                  ? this.adjacentUnusedAddresses.legacy.external + 1 : 0;
              }
              break;
            case constants.BITCOIN_SEGWIT_ADDRESS:
              if (isChange) {
                this.adjacentUnusedAddresses.segwit.change = addressStatus.unused
                  ? this.adjacentUnusedAddresses.segwit.change + 1 : 0;
              } else {
                this.adjacentUnusedAddresses.segwit.external = addressStatus.unused
                  ? this.adjacentUnusedAddresses.segwit.external + 1 : 0;
              }
              break;
            case constants.BITCOIN_NATIVE_SEGWIT_ADDRESS:
              if (isChange) {
                this.adjacentUnusedAddresses.nativeSegwit.change = addressStatus.unused
                  ? this.adjacentUnusedAddresses.nativeSegwit.change + 1 : 0;
              } else {
                this.adjacentUnusedAddresses.nativeSegwit.external = addressStatus.unused
                  ? this.adjacentUnusedAddresses.nativeSegwit.external + 1 : 0;
              }
              break;
            default:
          }
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

  protected getDerivedAddresses(
    batch: number, startFrom: number, accountType: BtcAccount, change: boolean,
  )
    : Array<WalletAddress> {
    switch (accountType) {
      case constants.BITCOIN_LEGACY_ADDRESS:
        return deriveBatchAddresses(
          this.extendedPubKeys.p2pkh,
          Purpose.P2PKH,
          startFrom,
          batch,
          change,
        );
      case constants.BITCOIN_NATIVE_SEGWIT_ADDRESS:
        return deriveBatchAddresses(
          this.extendedPubKeys.p2wpkh,
          Purpose.P2WPKH,
          startFrom,
          batch,
          change,
        );
      case constants.BITCOIN_SEGWIT_ADDRESS:
        return deriveBatchAddresses(
          this.extendedPubKeys.p2sh,
          Purpose.P2SH,
          startFrom,
          batch,
          change,
        );
      default:
        return [];
    }
  }

  protected areEnoughUnusedAddresses(): boolean {
    return (this.adjacentUnusedAddresses.legacy.external >= constants.MAX_ADJACENT_UNUSED_ADDRESSES
      && this.adjacentUnusedAddresses.legacy.change >= constants.MAX_ADJACENT_UNUSED_ADDRESSES
      && this.adjacentUnusedAddresses.segwit.external >= constants.MAX_ADJACENT_UNUSED_ADDRESSES
      && this.adjacentUnusedAddresses.segwit.change >= constants.MAX_ADJACENT_UNUSED_ADDRESSES
      && this.adjacentUnusedAddresses.nativeSegwit.external
      >= constants.MAX_ADJACENT_UNUSED_ADDRESSES
      && this.adjacentUnusedAddresses.nativeSegwit.change
      >= constants.MAX_ADJACENT_UNUSED_ADDRESSES);
  }

  private setAddressesToFetch(): void {
    const {
      legacy: unusedLegacy,
      segwit: unusedSegwit,
      nativeSegwit: unusedNativeSegwit,
    } = this.adjacentUnusedAddresses;
    const { legacy, nativeSegwit, segwit } = this.addressesToFetch;
    const maxUnusedAddresses = constants.MAX_ADJACENT_UNUSED_ADDRESSES;
    this.addressesToFetch = {
      legacy: {
        external: {
          lastIndex: legacy.external.lastIndex + legacy.external.count,
          count: unusedLegacy.external > maxUnusedAddresses
            ? 0 : Math.min(this.maxAddressPerCall, maxUnusedAddresses - unusedLegacy.external),
        },
        change: {
          lastIndex: legacy.change.lastIndex + legacy.change.count,
          count: unusedLegacy.change > maxUnusedAddresses
            ? 0 : Math.min(this.maxAddressPerCall, maxUnusedAddresses - unusedLegacy.change),
        },
      },
      segwit: {
        external: {
          lastIndex: segwit.external.lastIndex + segwit.external.count,
          count: unusedSegwit.external > maxUnusedAddresses
            ? 0 : Math.min(this.maxAddressPerCall, maxUnusedAddresses - unusedSegwit.external),
        },
        change: {
          lastIndex: segwit.change.lastIndex + segwit.change.count,
          count: unusedSegwit.change > maxUnusedAddresses
            ? 0 : Math.min(this.maxAddressPerCall, maxUnusedAddresses - unusedSegwit.change),
        },
      },
      nativeSegwit: {
        external: {
          lastIndex: nativeSegwit.external.lastIndex + nativeSegwit.external.count,
          count: unusedNativeSegwit.external > maxUnusedAddresses
            ? 0
            : Math.min(this.maxAddressPerCall, maxUnusedAddresses - unusedNativeSegwit.external),
        },
        change: {
          lastIndex: nativeSegwit.change.lastIndex + nativeSegwit.change.count,
          count: unusedNativeSegwit.change > maxUnusedAddresses
            ? 0 : Math.min(this.maxAddressPerCall, maxUnusedAddresses - unusedNativeSegwit.change),
        },
      },
    };
  }
}
