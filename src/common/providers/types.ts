export interface AddressRegexPattern {
  legacy: RegExp;
  segwit: RegExp;
  nativeSegwit: RegExp;
  taproot: RegExp;
}

export interface EnvironmentContext {
  getBtcTicker: () => string;
  getRbtcTicker: () => string;
  getBtcText: () => string;
  getRskText: () => string;
  getBtcLedgerAppName: () => string;
  getAddressRegexPattern: () => AddressRegexPattern;
  getNetworkName: () => string;
}
