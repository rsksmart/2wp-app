export class EnvironmentVariables {
  public vueAppCoin: string;

  public baseUrl: string;

  public vueAppApiBaseUrl: string;

  public vueAppRskNodeHost: string;

  public vueAppManifestEmail: string;

  public vueAppManifestAppUrl: string;

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
  }
}
