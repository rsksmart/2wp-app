import { AppNetwork } from '@/common/types';
import * as constants from '@/common/store/constants';

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

  public debugMode: boolean;

  public burnDustValue: number;

  public lbcAddress: string;

  public peginMinAmountAllowedInBtc: number;

  public flyoverGetProvidersTimeout: number;

  public flyoverPegoutDiffPercentage: number;

  public grecaptchaTime: number;

  public flyoverProviderId: number;

  public cspConfiguration: string;

  public apiResponseTimeout: number;

  public reownProjectId: string;

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
    this.lbcAddress = process.env.VUE_APP_LBC_ADDRESS || defaultValues.lbcAddress;
    this.debugMode = process.env.VUE_APP_DEBUG_MODE === 'true' || defaultValues.debugMode;
    this.peginMinAmountAllowedInBtc = Number(process.env.VUE_APP_PEGIN_MIN_AMOUNT_ALLOWED_IN_BTC)
      || defaultValues.peginMinValue;
    this.flyoverGetProvidersTimeout = Number(process.env.VUE_APP_FLYOVER_GET_PROVIDERS_TIMEOUT)
      || defaultValues.flyoverGetProvidersTimeout;
    this.flyoverPegoutDiffPercentage = Number(process.env
      .VUE_APP_FLYOVER_PEGOUT_QUOTE_DIFF_PERCENTAGE) || defaultValues.flyoverPegoutDiffPercentage;
    this.grecaptchaTime = Number(process.env.VUE_APP_RECAPTCHA_NEW_TOKEN_TIME)
      || defaultValues.grecaptchaTime;
    this.flyoverProviderId = Number(process.env.VUE_APP_FLYOVER_PROVIDER_ID)
      || defaultValues.flyoverProviderId;
    this.cspConfiguration = process.env.VUE_APP_CSP || defaultValues.cspConfiguration;
    this.apiResponseTimeout = Number(process.env.VUE_APP_API_RESPONSE_TIMEOUT)
      || defaultValues.apiResponseTimeout;
    this.reownProjectId = process.env.VUE_APP_REOWN_PROJECT_ID || '';
  }

  public get chainId(): number {
    return this.vueAppCoin === constants.BTC_NETWORK_MAINNET
      ? constants.SUPPORTED_NETWORKS.RSK_MAINNET.chainId
      : constants.SUPPORTED_NETWORKS.RSK_TESTNET.chainId;
  }
}
