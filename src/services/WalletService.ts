import * as constants from '@/store/constants';
import SatoshiBig from '@/types/SatoshiBig';
import ApiService from './ApiService';
import { AccountBalance } from '@/types';
import { WalletAddress } from '@/store/peginTx/types';

export abstract class WalletService {
  protected coin: string;

  protected subscribers: Array<(balance: AccountBalance) => void > = [];

  constructor(coin: string) {
    this.coin = coin;
  }

  abstract getAccountAddresses(batch: number, index: number): Promise<WalletAddress[]>;

  abstract getMaxAddressPerCall(): number;

  abstract getMaxAddressCallNumber(): number;

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

  // eslint-disable-next-line class-methods-use-this
  protected async getMaxAmountForPegin(): Promise<SatoshiBig> {
    const config = await ApiService.getPeginConfiguration();
    return new SatoshiBig(config.maxValue, 'satoshi');
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

  protected informSubscribers(balance: AccountBalance): void {
    this.subscribers.forEach((s) => s(balance));
  }

  // eslint-disable-next-line class-methods-use-this
  public async startAskingForBalance(sessionId: string): Promise<void> {
    const maxAmountPegin = await this.getMaxAmountForPegin();
    // eslint-disable-next-line prefer-const
    let balanceAccumulated: AccountBalance = {
      legacy: new SatoshiBig(0, 'satoshi'),
      segwit: new SatoshiBig(0, 'satoshi'),
      nativeSegwit: new SatoshiBig(0, 'satoshi'),
    };

    const maxAddressPerCall: number = this.getMaxAddressPerCall();
    for (
      let startFrom = 0;
      startFrom < (this.getMaxAddressCallNumber() * maxAddressPerCall);
      startFrom += maxAddressPerCall
    ) {
      try {
        // eslint-disable-next-line no-await-in-loop
        const addresses = await this.getAccountAddresses(maxAddressPerCall, startFrom);
        if (addresses.length === 0) {
          throw new Error('Error getting list of addreses - List of addresses is empty');
        }

        // eslint-disable-next-line no-await-in-loop
        const balancesFound = await ApiService.getBalances(sessionId, addresses);

        // eslint-disable-next-line no-extra-boolean-cast
        if (!!balancesFound) {
          balanceAccumulated = {
            legacy: new SatoshiBig(balanceAccumulated.legacy.plus(balancesFound.legacy), 'satoshi'),
            segwit: new SatoshiBig(balanceAccumulated.segwit.plus(balancesFound.segwit), 'satoshi'),
            nativeSegwit: new SatoshiBig(balanceAccumulated.nativeSegwit.plus(balancesFound.nativeSegwit), 'satoshi'),
          };
          this.informSubscribers(balanceAccumulated);
        } else {
          throw new Error('Error getting balances');
        }
      } catch (e) {
        throw new Error('Error getting list of Addreses from device');
      }
      if (balanceAccumulated.legacy.gte(maxAmountPegin)
        && balanceAccumulated.segwit.gte(maxAmountPegin)
        && balanceAccumulated.nativeSegwit.gte(maxAmountPegin)
      ) {
        return;
      }
    }
  }
}
