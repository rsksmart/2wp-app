import * as constants from '@/store/constants';
import { EnvironmentAccessorService } from '@/services/enviroment-accessor.service';
import { AppNetwork } from '@/types';

export function getAccountType(address: string, network: AppNetwork): string {
  const [legacyTestReg, segwitTestReg, nativeTestReg] = network === constants.BTC_NETWORK_MAINNET
    ? [
      /^[1][1-9A-HJ-NP-Za-km-z]{26,35}/,
      /^[3][1-9A-HJ-NP-Za-km-z]{26,35}/,
      /^[b][0-9A-HJ-NP-Za-z]{26,41}/,
    ]
    : [
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

export function getMainLogo() {
  switch (EnvironmentAccessorService.getEnvironmentVariables().vueAppCoin) {
    case constants.BTC_NETWORK_TESTNET:
      // eslint-disable-next-line global-require
      return require('@/assets/logo-beta-testnet.svg');
    case constants.BTC_NETWORK_MAINNET:
    default:
      // eslint-disable-next-line global-require
      return require('@/assets/logo-beta.svg');
  }
}
