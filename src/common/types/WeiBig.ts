import Big, { BigSource } from 'big.js';
import SatoshiBig from './SatoshiBig';

const numberRegex = /^[0-9]*(\.[0-9]*)?$/;

type RbtcMultiple = 'wei' | 'kwei' | 'mwei' | 'gwei' | 'rbtc';

export default class WeiBig extends Big {
  constructor(src: number | string | Big | bigint, currency: RbtcMultiple) {
    const safeSrc = src ? src.toString() : '0';
    const safeBig: Big = src instanceof Big
      ? src : Big(numberRegex.test(safeSrc) ? safeSrc : '0');
    switch (currency) {
      case 'wei':
        super(safeBig.toFixed(0));
        break;
      case 'mwei':
        super(safeBig.mul(100_000).toFixed(0));
        break;
      case 'kwei':
        super(safeBig.mul(1000).toFixed(0));
        break;
      case 'gwei':
        super(safeBig.mul(100_000_000_0).toFixed(0));
        break;
      case 'rbtc':
        super(safeBig.mul(100_000_000_000_000_000_0).toFixed(0));
        break;
      default:
        super(safeBig);
        break;
    }
  }

  plus(amount: WeiBig) {
    return new WeiBig(super.plus(amount), 'wei');
  }

  safeMinus(amount: WeiBig) {
    const result = super.minus(amount);
    if (result.lt(0)) {
      throw new Error('WeiBig underflow: result cannot be negative');
    }
    return new WeiBig(result, 'wei');
  }

  mul(amount: BigSource) {
    return new WeiBig(super.mul(amount), 'wei');
  }

  div(amount: BigSource) {
    return new WeiBig(super.div(amount), 'wei');
  }

  toRBTCString(): string {
    return super.div(100_000_000_000_000_000_0)
      .toFixed(18);
  }

  toRBTCTrimmedString(): string {
    return super.div(100_000_000_000_000_000_0)
      .toString();
  }

  toUSDFromRBTCString(price: number | string | Big, decimals = 2): string {
    const safePrice: Big = Big(numberRegex.test(price.toString()) ? price : '0');
    return Big(this.toRBTCString()).mul(safePrice).toFixed(decimals);
  }

  toWeiString(): string {
    return this.toFixed(0);
  }

  toGweiString(): string {
    return super.div(100_000_000_0)
      .toFixed(9);
  }

  toGweiTrimmedString(): string {
    return super.div(100_000_000_0)
      .toString();
  }

  toWeiBigIntUnsafe(): bigint {
    return BigInt(this.toFixed(0));
  }

  toWeiNumberUnsafe(): number {
    return Number(this.toFixed(0));
  }

  static max(a: WeiBig, b: WeiBig): WeiBig {
    return a.gt(b) ? a : b;
  }

  static min(a: WeiBig, b: WeiBig): WeiBig {
    return a.lt(b) ? a : b;
  }

  public static fromSatoshiBig(satoshiBig: SatoshiBig): WeiBig {
    const safeWeiBig = new Big(satoshiBig.toBTCString());
    return new WeiBig(safeWeiBig.mul(100_000_000_000_000_000_0).toFixed(0, Big.roundUp), 'wei');
  }
}
