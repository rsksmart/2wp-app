import { AppNetwork } from '@/common/types/Common';

export class EnvironmentVariables {
  public vueAppCoin: AppNetwork;

  public baseUrl: string;

  public vueAppApiBaseUrl: string;

  public vueAppRskNodeHost: string;

  public vueAppManifestEmail: string;

  public vueAppManifestAppUrl: string;

  public vueAppWalletAddressHardStop: number;

  public vueAppWalletAddressPerCall: number;

  public vueAppRskExplorer: string;

  public vueAppClarityId: number;

  public pegoutMinValue: number;

  public pegoutMaxValue: number;

  public minFeePerKb: {
    fast: number;
    average: number;
    slow: number;
  };

  public miningSpeedBlock: {
    fast: number;
    average: number;
    slow: number;
  };

  public burnDustValue: number;

  public maxAmountAllowedInSatoshis: number;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  constructor(defaultValues: any = {}) {
    this.vueAppCoin = import.meta.env.VITE_COIN || defaultValues.vueAppCoin;
    this.baseUrl = import.meta.env.BASE_URL || defaultValues.baseUrl;
    this.vueAppApiBaseUrl = import.meta.env.VITE_API_BASE_URL
      || defaultValues.vueAppApiBaseUrl;
    this.vueAppRskNodeHost = import.meta.env.VITE_RSK_NODE_HOST
      || defaultValues.vueAppRskNodeHost;
    this.vueAppManifestEmail = import.meta.env.VITE_MANIFEST_EMAIL
      || defaultValues.vueAppManifestEmail;
    this.vueAppManifestAppUrl = import.meta.env.VITE_MANIFEST_APP_URL
      || defaultValues.vueAppManifestAppUrl;
    this.vueAppWalletAddressHardStop = Number(process.env.VUE_APP_WALLET_ADDRESSES_HARD_STOP)
      || defaultValues.vueAppWalletAddressHardStop;
    this.vueAppWalletAddressPerCall = Number(process.env.VUE_APP_WALLET_ADDRESS_PER_CALL)
      || defaultValues.vueAppWalletAddressPerCall;
    this.vueAppRskExplorer = process.env.VUE_APP_RSK_EXPLORER || defaultValues.vueAppRskExplorer;
    this.vueAppClarityId = process.env.VUE_APP_CLARITY_ID || defaultValues.vueAppClarityId;
    this.pegoutMinValue = process.env.VUE_APP_PEGOUT_MIN_AMOUNT_ALLOWED_IN_RBTC
      || defaultValues.pegoutMinValue;
    this.pegoutMaxValue = process.env.VUE_APP_PEGOUT_MAX_AMOUNT_ALLOWED_IN_RBTC
      || defaultValues.pegoutMaxValue;
    this.minFeePerKb = {
      fast: import.meta.env.VITE_FEE_PER_KB_FAST_MIN
        || (defaultValues.minFeePerKb ? defaultValues.minFeePerKb.fast : 0),
      average: import.meta.env.VITE_FEE_PER_KB_AVERAGE_MIN
        || (defaultValues.minFeePerKb ? defaultValues.minFeePerKb.average : 0),
      slow: import.meta.env.VITE_FEE_PER_KB_SLOW_MIN
        || (defaultValues.minFeePerKb ? defaultValues.minFeePerKb.slow : 0),
    };
    this.miningSpeedBlock = {
      fast: import.meta.env.VITE_FAST_MINING_BLOCK
        || (defaultValues.miningSpeedBlock ? defaultValues.miningSpeedBlock.fast : 0),
      average: import.meta.env.VITE_AVERAGE_MINING_BLOCK
        || (defaultValues.miningSpeedBlock ? defaultValues.miningSpeedBlock.average : 0),
      slow: import.meta.env.VITE_SLOW_MINING_BLOCK
        || (defaultValues.miningSpeedBlock ? defaultValues.miningSpeedBlock.slow : 0),
    };
    this.burnDustValue = Number(import.meta.env.BURN_DUST_VALUE) || defaultValues.burnDustValue;
    this.maxAmountAllowedInSatoshis = import.meta.env.VITE_MAX_AMOUNT_ALLOWED_IN_SATOSHI
      || defaultValues.maxAmountAllowedInSatoshis;
  }
}
