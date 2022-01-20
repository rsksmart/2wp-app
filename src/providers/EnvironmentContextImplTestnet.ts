import { EnvironmentContext } from './types';

export default class EnvironmentContextImplTestnet implements EnvironmentContext {
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
    return 'TBTC';
  }

  // eslint-disable-next-line class-methods-use-this
  getRbtcTicker() {
    return 'TRBTC';
  }

  // eslint-disable-next-line class-methods-use-this
  getBtcText() {
    return 'Testnet Bitcoin';
  }

  // eslint-disable-next-line class-methods-use-this
  getRskText() {
    return 'Testnet RSK';
  }

  // eslint-disable-next-line class-methods-use-this
  getBtcLedgerAppName() {
    return 'Bitcoin Test';
  }
}
