import { AppNetwork } from '@/common/types';

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

  public vueAppHotjarId: number;

  public vueAppClarityId: string;

  public pegoutMinValue: number;

  public pegoutMaxValue: number;

  public minFeeSatPerByte: {
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

  public lbcAddress: string;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  constructor(defaultValues: any = {}) {
    this.vueAppCoin = process.env.VUE_APP_COIN || defaultValues.vueAppCoin;
    this.baseUrl = process.env.BASE_URL || defaultValues.baseUrl;
    this.vueAppApiBaseUrl = process.env.VUE_APP_API_BASE_URL
      || defaultValues.vueAppApiBaseUrl;
    this.vueAppRskNodeHost = process.env.VUE_APP_RSK_NODE_HOST
      || defaultValues.vueAppRskNodeHost;
    this.vueAppManifestEmail = process.env.VUE_APP_MANIFEST_EMAIL
      || defaultValues.vueAppManifestEmail;
    this.vueAppManifestAppUrl = process.env.VUE_APP_MANIFEST_APP_URL
      || defaultValues.vueAppManifestAppUrl;
    this.vueAppWalletAddressHardStop = Number(process.env.VUE_APP_WALLET_ADDRESSES_HARD_STOP)
      || defaultValues.vueAppWalletAddressHardStop;
    this.vueAppWalletAddressPerCall = Number(process.env.VUE_APP_WALLET_ADDRESS_PER_CALL)
      || defaultValues.vueAppWalletAddressPerCall;
    this.vueAppRskExplorer = process.env.VUE_APP_RSK_EXPLORER || defaultValues.vueAppRskExplorer;
    this.vueAppHotjarId = process.env.VUE_APP_HOTJAR_ID || defaultValues.vueAppHotjarId;
    this.vueAppClarityId = process.env.VUE_APP_CLARITY_ID || defaultValues.vueAppClarityId;
    this.pegoutMinValue = process.env.VUE_APP_PEGOUT_MIN_AMOUNT_ALLOWED_IN_RBTC
      || defaultValues.pegoutMinValue;
    this.pegoutMaxValue = process.env.VUE_APP_PEGOUT_MAX_AMOUNT_ALLOWED_IN_RBTC
      || defaultValues.pegoutMaxValue;
    this.minFeeSatPerByte = {
      fast: process.env.VUE_APP_MIN_FEE_SAT_PER_BYTE_FAST
        || (defaultValues.minFeeSatPerByte ? defaultValues.minFeeSatPerByte.fast : 0),
      average: process.env.VUE_APP_MIN_FEE_SAT_PER_BYTE_AVG
        || (defaultValues.minFeeSatPerByte ? defaultValues.minFeeSatPerByte.average : 0),
      slow: process.env.VUE_APP_MIN_FEE_SAT_PER_BYTE_SLOW
        || (defaultValues.minFeeSatPerByte ? defaultValues.minFeeSatPerByte.slow : 0),
    };
    this.miningSpeedBlock = {
      fast: process.env.VUE_APP_FAST_MINING_BLOCK
        || (defaultValues.miningSpeedBlock ? defaultValues.miningSpeedBlock.fast : 0),
      average: process.env.VUE_APP_AVERAGE_MINING_BLOCK
        || (defaultValues.miningSpeedBlock ? defaultValues.miningSpeedBlock.average : 0),
      slow: process.env.VUE_APP_SLOW_MINING_BLOCK
        || (defaultValues.miningSpeedBlock ? defaultValues.miningSpeedBlock.slow : 0),
    };
    this.burnDustValue = Number(process.env.VUE_APP_BURN_DUST_VALUE) || defaultValues.burnDustValue;
    this.maxAmountAllowedInSatoshis = process.env.VUE_APP_MAX_AMOUNT_ALLOWED_IN_SATOSHI
      || defaultValues.maxAmountAllowedInSatoshis;
    this.lbcAddress = process.env.VUE_APP_LBC_CONTRACT_ADDRESS || defaultValues.lbcAddress;
  }
}
