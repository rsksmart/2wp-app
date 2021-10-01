import Big, { BigSource } from 'big.js';

const numberRegex = /^[0-9]*(\.[0-9]*)?$/;

type BTCCurrency = 'satoshi' | 'mbtc' | 'btc';

export default class SatoshiBig extends Big {
  constructor(src: number | string | Big, currency: BTCCurrency) {
    const safeSrc = src ? src.toString() : '0';
    const safeBig: Big = src instanceof Big
      ? src : Big(numberRegex.test(safeSrc) ? safeSrc : '0');
    switch (currency) {
      case 'satoshi':
        super(safeBig.toFixed(0));
        break;
      case 'mbtc':
        super(safeBig.mul(100_000).toFixed(0));
        break;
      case 'btc':
        super(safeBig.mul(100_000_000).toFixed(0));
        break;
      default:
        super(safeBig);
        break;
    }
  }

  plus(amount: SatoshiBig) {
    return new SatoshiBig(super.plus(amount), 'satoshi');
  }

  minus(amount: SatoshiBig) {
    return new SatoshiBig(super.minus(amount), 'satoshi');
  }

  mul(amount: BigSource) {
    return new SatoshiBig(super.mul(amount), 'satoshi');
  }

  div(amount: BigSource) {
    return new SatoshiBig(super.div(amount), 'satoshi');
  }

  toBTCString(): string {
    const btcString = super.div(100_000_000).toFixed(8);
    return btcString;
  }

  toBTCTrimmedString(): string {
    const btcString = super.div(100_000_000).toString();
    return btcString;
  }

  tomBTCString(): string {
    const mBTCString = super.div(100_000).toFixed(5);
    return mBTCString;
  }

  toSatoshiString(): string {
    return this.toFixed(0);
  }

  toUSDFromBTCString(price: number | string | Big, decimals = 2): string {
    const safePrice: Big = Big(numberRegex.test(price.toString()) ? price : '0');
    return Big(this.toBTCString()).mul(safePrice).toFixed(decimals);
  }
}
