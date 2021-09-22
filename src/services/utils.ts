import Big from 'big.js';
import * as constants from '@/store/constants';

export function getAccountType(address: string): string {
  const [legacyTestReg, segwitTestReg, nativeTestReg] = [
    /^[mn][1-9A-HJ-NP-Za-km-z]{26,35}/,
    /^[2][1-9A-HJ-NP-Za-km-z]{26,35}/,
    /^[tb][0-9A-HJ-NP-Za-z]{26,41}/,
  ];
  if (legacyTestReg.test(address)) return constants.BITCOIN_LEGACY_ADDRESS;
  if (segwitTestReg.test(address)) return constants.BITCOIN_SEGWIT_ADDRESS;
  if (nativeTestReg.test(address)) return constants.BITCOIN_NATIVE_SEGWIT_ADDRESS;
  return constants.BITCOIN_MULTISIGNATURE_ADDRESS;
}

export class Machine<States extends string> {
  value: States;

  constructor(value: States) {
    this.value = value;
  }

  public matches(values: string[]) {
    return values.map((v) => v === this.value).some((e) => e);
  }

  public send(newValue: States) {
    this.value = newValue;
  }
}

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

  toUSD(price: number | string | Big): string {
    const safePrice: Big = Big(numberRegex.test(price.toString()) ? '0' : price);
    return this.mul(safePrice).toFixed(2);
  }
}
