import Big, { BigSource } from 'big.js';
import WeiBig from './WeiBig';

const numberRegex = /^[0-9]*(\.[0-9]*)?$/;

type BTCCurrency = 'satoshi' | 'mbtc' | 'btc';

const rightZeroPaddedRegex = /^0\.0+$/;

export default class SatoshiBig extends Big {
  constructor(src: number | string | Big | bigint, currency: BTCCurrency) {
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

  public static fromWeiBig(weiBig: WeiBig): SatoshiBig {
    const safeSatBig = new Big(weiBig.toRBTCString());
    return new SatoshiBig(safeSatBig.mul(100_000_000).toFixed(0, Big.roundUp), 'satoshi');
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

  toBTCStringBg(): string {
    const btcString = super.div(100_000_000_000_000_000).toFixed(4);
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

  toBTCStringNotZeroPadded(): string {
    const btcString = this.toBTCString();
    const isRightZeroPadded = rightZeroPaddedRegex.test(btcString);
    return isRightZeroPadded ? '0' : btcString;
  }

  toSatoshiBigIntUnsafe(): bigint {
    return BigInt(this.toFixed(0));
  }

  toWeiBigIntUnsafe(): bigint {
    return BigInt(this.mul(10_000_000_000).toFixed(0));
  }

  toSatoshiNumberUnsafe(): number {
    return Number(this.toFixed(0));
  }
}
