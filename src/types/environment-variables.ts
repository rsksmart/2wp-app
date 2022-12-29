import { AppNetwork } from '@/types/Common';

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

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  constructor(defaultValues: any = {}) {
    this.vueAppCoin = defaultValues.vueAppCoin || process.env.VUE_APP_COIN;
    this.baseUrl = defaultValues.baseUrl || process.env.BASE_URL;
    this.vueAppApiBaseUrl = defaultValues.vueAppApiBaseUrl
      || process.env.VUE_APP_API_BASE_URL;
    this.vueAppRskNodeHost = defaultValues.vueAppRskNodeHost
      || process.env.VUE_APP_RSK_NODE_HOST;
    this.vueAppManifestEmail = defaultValues.vueAppManifestEmail
      || process.env.VUE_APP_MANIFEST_EMAIL;
    this.vueAppManifestAppUrl = defaultValues.vueAppManifestAppUrl
      || process.env.VUE_APP_MANIFEST_APP_URL;
    this.vueAppWalletAddressHardStop = defaultValues.vueAppWalletAddressHardStop
      || Number(process.env.VUE_APP_WALLET_ADDRESSES_HARD_STOP);
    this.vueAppWalletAddressPerCall = defaultValues.vueAppWalletAddressPerCall
      || Number(process.env.VUE_APP_WALLET_ADDRESS_PER_CALL);
    this.vueAppRskExplorer = defaultValues.vueAppRskExplorer || process.env.VUE_APP_RSK_EXPLORER;
    this.vueAppHotjarId = defaultValues.vueAppHotjarId || process.env.VUE_APP_HOTJAR_ID;
  }
}
