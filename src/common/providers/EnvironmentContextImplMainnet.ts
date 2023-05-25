import { EnvironmentContext } from './types';

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
}
