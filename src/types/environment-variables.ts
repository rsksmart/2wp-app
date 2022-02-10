export class EnvironmentVariables {
  public vueAppCoin: string;

  public baseUrl: string;

  public vueAppApiBaseUrl: string;

  public vueAppRskNodeHost: string;

  public vueAppManifestEmail: string;

  public vueAppManifestAppUrl: string;

  public vueAppWalletMaxCallTrezor: number;

  public vueAppWalletAddressesPerCallTrezor: number;

  public vueAppWalletMaxCallLedger: number;

  public vueAppWalletAddressesPerCallLedger: number;

  public vueAppHotjarId: string;

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
    this.vueAppWalletMaxCallTrezor = Number(process.env.VUE_APP_WALLET_MAX_CALLS_TREZOR)
      || defaultValues.vueAppWalletMaxCallTrezor;
    this.vueAppWalletAddressesPerCallTrezor
    // eslint-disable-next-line operator-linebreak
      = Number(process.env.VUE_APP_WALLET_ADDRESSES_PER_CALL_TREZOR)
      || defaultValues.vueAppWalletAddressesPerCallTrezor;
    this.vueAppWalletMaxCallLedger = Number(process.env.VUE_APP_WALLET_MAX_CALLS_LEDGER)
      || defaultValues.vueAppWalletMaxCallLedger;
    this.vueAppWalletAddressesPerCallLedger
    // eslint-disable-next-line operator-linebreak
      = Number(process.env.VUE_APP_WALLET_ADDRESSES_PER_CALL_LEDGER)
      || defaultValues.vueAppWalletAddressesPerCallLedger;


    this.vueAppHotjarId = process.env.VUE_APP_HOTJAR_ID;
  }
}
