import { AddressRegexPattern, EnvironmentContext } from './types';

export default class EnvironmentContextImpl implements EnvironmentContext {
  // eslint-disable-next-line no-useless-constructor, @typescript-eslint/no-empty-function
  private constructor() {}

  private static instance: EnvironmentContext;

  public static getInstance() {
    if (!this.instance) {
      this.instance = new this();
    }
    return this.instance;
  }

  // eslint-disable-next-line class-methods-use-this
  getBtcTicker() {
    return 'BTC';
  }

  // eslint-disable-next-line class-methods-use-this
  getRbtcTicker() {
    return 'RBTC';
  }

  // eslint-disable-next-line class-methods-use-this
  getBtcText() {
    return 'Bitcoin';
  }

  // eslint-disable-next-line class-methods-use-this
  getRskText() {
    return 'RSK';
  }

  getBtcLedgerAppName() {
    return this.getBtcText();
  }

  // eslint-disable-next-line class-methods-use-this
  getAddressRegexPattern(): AddressRegexPattern {
    return {
      legacy: new RegExp('^[1][1-9A-HJ-NP-Za-km-z]{26,35}'),
      segwit: new RegExp('^[3][1-9A-HJ-NP-Za-km-z]{26,35}'),
      nativeSegwit: new RegExp('^[bc1][0-9A-HJ-NP-Za-z]{41,62}'),
    };
  }
}
