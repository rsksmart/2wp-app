import Big, { BigSource } from 'big.js';

const numberRegex = /^[0-9]*(\.[0-9]*)?$/;

type RbtcMultiple = 'wei' | 'kwei' | 'mwei' | 'gwei' | 'rbtc';

export default class WeiBig extends Big {
  constructor(src: number | string | Big, currency: RbtcMultiple) {
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

  minus(amount: WeiBig) {
    return new WeiBig(super.minus(amount), 'wei');
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
}
