export enum FeatureNames {
  TERMS_AND_CONDITIONS = 'terms_and_conditions',
  FLYOVER_PEG_IN = 'flyover_pegin',
  FLYOVER_PEG_OUT = 'flyover_pegout',
  WALLET_EXODUS = 'wallet_exodus',
  WALLET_ENKRYPT = 'wallet_enkrypt',
  WALLET_XVERSE = 'wallet_xverse',
  WALLET_LEATHER = 'wallet_leather',
  WALLET_TREZOR = 'wallet_trezor',
  WALLET_LEDGER = 'wallet_ledger',
  WALLET_REOWN = 'wallet_reown',
}

export enum Browser {
  CHROME = 'Chrome',
  FIREFOX = 'Firefox',
  SAFARI = 'Safari',
  EDGE = 'Edge',
  BRAVE = 'Brave',
  OPERA = 'Opera',
}

export interface SupportedBrowsers {
  chrome: boolean;
  firefox: boolean;
  safari: boolean;
  edge: boolean;
  brave: boolean;
  chromium: boolean;
  opera: boolean;
}
export interface Feature {
  name: FeatureNames;
  value: string;
  version: number;
  supportedBrowsers: SupportedBrowsers;
}
