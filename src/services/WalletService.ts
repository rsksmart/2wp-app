import * as constants from '@/store/constants';
import SatoshiBig from '@/types/SatoshiBig';
import ApiService from '@/services/ApiService';
import { AccountBalance } from '@/types';
import { WalletAddress } from '@/store/peginTx/types';

export abstract class WalletService {
  protected coin: string;

  protected subscribers: Array<(balance: AccountBalance) => void > = [];

  constructor(coin: string) {
    this.coin = coin;
  }

  abstract getAddressList(batch: number): Promise<WalletAddress[]>;

  abstract getAccountAddressListSinceInit(batch: number, index: number): Promise<WalletAddress[]>;

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

  public subscribe(addBalance: (balance: AccountBalance) => void): void {
    this.subscribers.push(addBalance);
    console.log('[WalletService - subscribe]');
    console.log(this.subscribers.length);
  }

  public unsubscribe(addBalance: (balance: AccountBalance) => void): void {
    console.log('[WalletService - unsubscribe]');
    const idx = (this.subscribers.findIndex((s) => s === addBalance));
    if (idx !== -1) {
      this.subscribers.splice(idx, 1);
    }
  }

  protected informSubscribers(balance: AccountBalance): void {
    console.log('[WalletService - informSubscribers] ready to inform');
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

    for (
      let index = 0;
      index < Number(process.env.VUE_APP_MAX_ADDRESS_GENERAL);
      index += Number(process.env.VUE_APP_MAX_ADDRESS_PER_CALL)
    ) {
      try {
        // eslint-disable-next-line no-await-in-loop
        const addresses = await this.getAccountAddressListSinceInit(
          Number(process.env.VUE_APP_MAX_ADDRESS_PER_CALL),
          index,
        );
        console.log('[WalletService - startAskingForBalance] number for list of addresses');
        console.log(addresses.length);

        if (addresses.length === 0) {
          throw new Error('Error getting list of addreses - List of addresses is empty');
        }

        // eslint-disable-next-line no-await-in-loop
        const balancesFound = await ApiService.getBalances(sessionId, addresses);

        // eslint-disable-next-line no-extra-boolean-cast
        if (!!balancesFound) {
          console.log('[WalletService - startAskingForBalance] balancesFound');
          console.log(balancesFound.legacy);
          console.log(balancesFound.segwit);
          console.log(balancesFound.nativeSegwit);

          balanceAccumulated = {
            legacy: new SatoshiBig(balanceAccumulated.legacy.plus(balancesFound.legacy), 'satoshi'),
            segwit: new SatoshiBig(balanceAccumulated.segwit.plus(balancesFound.segwit), 'satoshi'),
            nativeSegwit: new SatoshiBig(balanceAccumulated.nativeSegwit.plus(balancesFound.nativeSegwit), 'satoshi'),
          };
          this.informSubscribers(balanceAccumulated);
          console.log('[WalletService - startAskingForBalance] balance accumulated');
          console.log(balanceAccumulated.legacy);
          console.log(balanceAccumulated.segwit);
          console.log(balanceAccumulated.nativeSegwit);
        } else {
          console.log('[WalletService - startAskingForBalance] balancesFound null or undefined');
          throw new Error('Error getting balances');
        }
      } catch (e) {
        console.log(e.message);
        throw new Error('Error getting list of Addreses from device');
      }
      if (balanceAccumulated.legacy >= maxAmountPegin
        && balanceAccumulated.segwit >= maxAmountPegin
        && balanceAccumulated.nativeSegwit >= maxAmountPegin
      ) {
        console.log('[WalletService - startAskingForBalance] promise1!!!!');
        // eslint-disable-next-line no-unused-expressions
        return Promise.resolve();
      }
    }
    console.log('[WalletService - startAskingForBalance] promise2!!!!');
    // eslint-disable-next-line no-unused-expressions
    return Promise.resolve();
  }
}
