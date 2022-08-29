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

  private adjacentUnusedAddresses: {
    legacy: number;
    segwit: number;
    nativeSegwit: number;
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
      legacy: 0,
      segwit: 0,
      nativeSegwit: 0,
    };
    this.addressesToFetch = {
      legacy: { lastIndex: 0, count: this.maxAddressPerCall },
      segwit: { lastIndex: 0, count: this.maxAddressPerCall },
      nativeSegwit: { lastIndex: 0, count: this.maxAddressPerCall },
    };
  }

  // abstract isWalletEnabled(): Promise<boolean>;

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
      legacy: 0,
      segwit: 0,
      nativeSegwit: 0,
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
          this.addressesToFetch.legacy.lastIndex,
          this.addressesToFetch.segwit.lastIndex,
          this.addressesToFetch.nativeSegwit.lastIndex,
        );
        if (maxIndexReached >= maxAddressesHardStop) {
          break;
        }
      }
      this.loadingBalances = false;
      this.informSubscribers(this.balanceAccumulated, []);
    } catch (error: any) {
      throw new Error(`Balance Error: ${error.message}`);
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
          switch (accountType) {
            case constants.BITCOIN_LEGACY_ADDRESS:
              this.adjacentUnusedAddresses.legacy = addressStatus.unused
                ? this.adjacentUnusedAddresses.legacy + 1 : 0;
              break;
            case constants.BITCOIN_SEGWIT_ADDRESS:
              this.adjacentUnusedAddresses.segwit = addressStatus.unused
                ? this.adjacentUnusedAddresses.segwit + 1 : 0;
              break;
            case constants.BITCOIN_NATIVE_SEGWIT_ADDRESS:
              this.adjacentUnusedAddresses.nativeSegwit = addressStatus.unused
                ? this.adjacentUnusedAddresses.nativeSegwit + 1 : 0;
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

  protected getDerivedAddresses(batch: number, startFrom: number, accountType: BtcAccount)
    : Array<WalletAddress> {
    switch (accountType) {
      case constants.BITCOIN_LEGACY_ADDRESS:
        return deriveBatchAddresses(
          this.extendedPubKeys.p2pkh,
          Purpose.P2PKH,
          startFrom,
          batch,
        );
      case constants.BITCOIN_NATIVE_SEGWIT_ADDRESS:
        return deriveBatchAddresses(
          this.extendedPubKeys.p2wpkh,
          Purpose.P2WPKH,
          startFrom,
          batch,
        );
      case constants.BITCOIN_SEGWIT_ADDRESS:
        return deriveBatchAddresses(
          this.extendedPubKeys.p2sh,
          Purpose.P2SH,
          startFrom,
          batch,
        );
      default:
        return [];
    }
  }

  private areEnoughUnusedAddresses(): boolean {
    return (this.adjacentUnusedAddresses.legacy >= constants.MAX_ADJACENT_UNUSED_ADDRESSES
      && this.adjacentUnusedAddresses.segwit >= constants.MAX_ADJACENT_UNUSED_ADDRESSES
      && this.adjacentUnusedAddresses.nativeSegwit >= constants.MAX_ADJACENT_UNUSED_ADDRESSES);
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
        lastIndex: legacy.lastIndex + legacy.count,
        count: unusedLegacy > maxUnusedAddresses
          ? 0 : Math.min(this.maxAddressPerCall, maxUnusedAddresses - unusedLegacy),
      },
      segwit: {
        lastIndex: segwit.lastIndex + segwit.count,
        count: unusedSegwit > maxUnusedAddresses
          ? 0 : Math.min(this.maxAddressPerCall, maxUnusedAddresses - unusedSegwit),
      },
      nativeSegwit: {
        lastIndex: nativeSegwit.lastIndex + nativeSegwit.count,
        count: unusedNativeSegwit > maxUnusedAddresses
          ? 0 : Math.min(this.maxAddressPerCall, maxUnusedAddresses - unusedNativeSegwit),
      },
    };
  }
}
