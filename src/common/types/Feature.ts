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
}
export interface Feature {
  name: FeatureNames;
  value: string;
  version: number;
}
