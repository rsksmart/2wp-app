import * as constants from '@/store/constants';
import SatoshiBig from '@/types/SatoshiBig';
import ApiService from './ApiService';
import { AccountBalance } from '@/types';
import { WalletAddress } from '@/store/peginTx/types';
import store from '@/store';

export abstract class WalletService {
  protected coin: string;

  protected subscribers: Array<(balance: AccountBalance) => void > = [];

  constructor(coin: string) {
    this.coin = coin;
  }

  abstract getAccountAddresses(batch: number, index: number): Promise<WalletAddress[]>;

  abstract getWalletAddressesPerCall(): number;

  abstract getWalletMaxCall(): number;

  protected getAccountPath(accountType: string, accountIdx: number) {
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

  public subscribe(subscriber: (balance: AccountBalance) => void): void {
    this.subscribers.push(subscriber);
  }

  public unsubscribe(subscriber: (balance: AccountBalance) => void): void {
    const idx = this.subscribers.findIndex((s) => s === subscriber);
    if (idx !== -1) {
      this.subscribers.splice(idx, 1);
    }
  }

  public cleanSubscriptions() {
    this.subscribers = [];
  }

  protected informSubscribers(balance: AccountBalance): void {
    this.subscribers.forEach((s) => s(balance));
  }

  // eslint-disable-next-line class-methods-use-this
  public async startAskingForBalance(sessionId: string, maxAmountPegin: number): Promise<void> {
    // eslint-disable-next-line prefer-const
    let balanceAccumulated: AccountBalance = {
      legacy: new SatoshiBig(0, 'satoshi'),
      segwit: new SatoshiBig(0, 'satoshi'),
      nativeSegwit: new SatoshiBig(0, 'satoshi'),
    };

    const maxAddressPerCall: number = this.getWalletAddressesPerCall();
    for (
      let startFrom = 0;
      startFrom < (this.getWalletMaxCall() * maxAddressPerCall);
      startFrom += maxAddressPerCall
    ) {
      // eslint-disable-next-line no-await-in-loop
      const addresses = await this.getAccountAddresses(maxAddressPerCall, startFrom);
      if (addresses.length === 0) {
        throw new Error('Error getting list of addreses - List of addresses is empty');
      }
      // eslint-disable-next-line no-await-in-loop
      await store.dispatch(`pegInTx/${constants.PEGIN_TX_ADD_ADDRESSES}`, addresses);

      // eslint-disable-next-line no-await-in-loop
      const balancesFound = await ApiService.getBalances(sessionId, addresses);
      const balances = {
        legacy: new SatoshiBig(balancesFound.legacy, 'satoshi'),
        segwit: new SatoshiBig(balancesFound.segwit, 'satoshi'),
        nativeSegwit: new SatoshiBig(balancesFound.nativeSegwit, 'satoshi'),
      };
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
          this.informSubscribers(balanceAccumulated);
        } else {
          const listOfAddresses: string[] = [];
          addresses.forEach((element) => { listOfAddresses.push(element.address); });
          // eslint-disable-next-line no-await-in-loop
          if (await ApiService.areUnusedAddresses(listOfAddresses)) {
            return;
          }
        }
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
  }
}
