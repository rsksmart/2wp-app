import * as constants from '@/common/store/constants';
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
      legacy: new RegExp(constants.MAINNET_ADDRESS_LEGACY),
      segwit: new RegExp(constants.MAINNET_ADDRESS_SEGWIT),
      nativeSegwit: new RegExp(constants.MAINNET_ADDRESS_NSEGWIT),
      taproot: new RegExp(constants.MAINNET_ADDRESS_TAPROOT),
    };
  }

  // eslint-disable-next-line class-methods-use-this
  getNetworkName(): string {
    return 'Mainnet';
  }
}
