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
    return new Promise(() => new SatoshiBig(config.maxValue, 'satoshi'));
  }

  public subscribe(addBalance: (balance: AccountBalance) => void): void {
    this.subscribers.push(addBalance);
  }

  public unsubscribe(addBalance: (balance: AccountBalance) => void): void {
    const idx = (this.subscribers.findIndex((s) => s === addBalance));
    if (idx !== -1) {
      this.subscribers.splice(idx, 1);
    }
  }

  protected informSubscribers(balance: AccountBalance): void {
    this.subscribers.forEach((s) => s(balance));
  }

  // public async startAskingForBalance(sessionId: string): Promise<void> {
  //   const maxAmountPegin = await this.getMaxAmountForPegin();
  //   for (
  //     let index = 0;
  //     index < Number(process.env.VUE_APP_MAX_ADDRESS_GENERAL);
  //     index += Number(process.env.VUE_APP_MAX_ADDRESS_PER_CALL)
  //   ) {
  //     this.getAccountAddressListSinceInit(
  //       index,
  //       Number(process.env.VUE_APP_MAX_ADDRESS_PER_CALL),
  //     )
  //       .then((addresses) => ApiService.getBalances(sessionId, addresses))
  //       .then((balancesFound: AccountBalance) => {
  //         this.informSubscribers(balancesFound);
  //         if (balancesFound.legacy >= maxAmountPegin
  //           && balancesFound.segwit >= maxAmountPegin
  //           && balancesFound.nativeSegwit >= maxAmountPegin
  //         ) {
  //           // eslint-disable-next-line no-unused-expressions
  //           Promise.resolve;
  //         }
  //       });
  //   }
  //   // eslint-disable-next-line no-unused-expressions
  //   Promise.resolve;
  // }
}
