export interface EnvironmentContext {
  getBtcTicker: () => string;
  getRbtcTicker: () => string;
  getBtcText: () => string;
  getRskText: () => string;
  getBtcLedgerAppName: () => string;
}
