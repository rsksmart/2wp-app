import * as constants from '@/common/store/constants';
import { AddressRegexPattern, EnvironmentContext } from './types';

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

  // eslint-disable-next-line class-methods-use-this
  getAddressRegexPattern(): AddressRegexPattern {
    return {
      legacy: new RegExp(constants.TESTNET_ADDRESS_LEGACY),
      segwit: new RegExp(constants.TESTNET_ADDRESS_SEGWIT),
      nativeSegwit: new RegExp(constants.TESTNET_ADDRESS_NSEGWIT),
      taproot: new RegExp(constants.TESTNET_ADDRESS_TAPROOT),
    };
  }

  // eslint-disable-next-line class-methods-use-this
  getNetworkName(): string {
    return 'Testnet';
  }
}
