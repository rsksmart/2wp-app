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

  public vueAppHotjarId: number;

  public pegoutMinValue: number;

  public pegoutMaxValue: number;

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
    this.pegoutMinValue = process.env.VUE_APP_PEGOUT_MIN_AMOUNT_ALLOWED_IN_RBTC
      || defaultValues.pegoutMinValue;
    this.pegoutMaxValue = process.env.VUE_APP_PEGOUT_MAX_AMOUNT_ALLOWED_IN_RBTC
      || defaultValues.pegoutMaxValue;
  }
}
