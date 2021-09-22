import Big from 'big.js';

const numberRegex = /^[0-9]*(\.[0-9]*)?$/;

type BTCCurrency = 'satoshi' | 'mbtc' | 'btc';

export class SatoshiBig extends Big {
  constructor(src: number | string | Big, currency: BTCCurrency) {
    const safeBig: Big = Big(numberRegex.test(src.toString()) ? '0' : src);
    switch (currency) {
      case 'satoshi':
        super(safeBig.toFixed(0));
        break;
      case 'mbtc':
        super(safeBig.mul(100_000).toFixed(5));
        break;
      case 'btc':
        super(safeBig.mul(100_000_000).toFixed(8));
        break;
      default:
        super(src);
        break;
    }
  }

  toBTCString(): string {
    const btcString = this.div(100_000_000).toFixed(8);
    return btcString;
  }

  tomBTCString(): string {
    const mBTCString = this.div(100_000).toFixed(5);
    return mBTCString;
  }

  toSatoshiString(): string {
    return this.toFixed(0);
  }

  toUSDFromBTCString(price: number | string | Big, decimals = 2): string {
    const safePrice: Big = Big(numberRegex.test(price.toString()) ? '0' : price);
    return this.mul(100_000_000).mul(safePrice).toFixed(decimals);
  }
}
