import RLogin from '@rsksmart/rlogin';
import { EnvironmentAccessorService } from '@/common/services/enviroment-accessor.service';
import WalletConnectProvider from '@walletconnect/web3-provider';
import { trezorProviderOptions } from '@rsksmart/rlogin-trezor-provider';
import { ledgerProviderOptions } from '@rsksmart/rlogin-ledger-provider';
import * as constants from '@/common/store/constants';
import {
  Browser, Feature, FeatureNames, SupportedBrowsers,
} from '../types';
import { getBrowserName } from './utils';

export function getRloginInstance(features: Array<Feature>): RLogin {
  const currentBrowser = getBrowserName() as Browser;
  const rpcUrls = {};
  const customLedgerProviderOptions = ledgerProviderOptions;
  customLedgerProviderOptions.connector = async (ProviderPackage, options) => {
    const ledgerOptions = options;
    ledgerOptions.messageHashed = true;
    const provider = new ProviderPackage(ledgerOptions);
    await provider.connect();
    return provider;
  };
  const customTrezorProviderOptions = {
    ...trezorProviderOptions,
    options: {
      dPath: "m/44'/37310'/0'/0/0",
      manifestEmail: EnvironmentAccessorService
        .getEnvironmentVariables().vueAppManifestEmail,
      manifestAppUrl: EnvironmentAccessorService
        .getEnvironmentVariables().vueAppManifestAppUrl,
    },
  };
  const { vueAppRskNodeHost, chainId } = EnvironmentAccessorService.getEnvironmentVariables();
  Object
    .defineProperty(rpcUrls, chainId, {
      value: vueAppRskNodeHost,
      writable: false,
      configurable: true,
      enumerable: true,
    });
  const supportedChains = Object.keys(rpcUrls).map(Number);
  const rLoginOptions = {
    cacheProvider: false,
    defaultTheme: 'dark' as 'dark' | 'light',
    providerOptions: {
      walletconnect: {
        package: WalletConnectProvider,
        options: {
          rpc: rpcUrls,
        },
      },
    },
    rpcUrls,
    supportedChains,
  };
  const ledgerFeature = features.find((feature) => feature.name === FeatureNames.WALLET_LEDGER);
  if (ledgerFeature?.value === constants.ENABLED
    && ledgerFeature.supportedBrowsers[currentBrowser.toLowerCase() as keyof SupportedBrowsers]) {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    rLoginOptions.providerOptions['custom-ledger'] = customLedgerProviderOptions;
  }
  const trezorFeature = features.find((feature) => feature.name === FeatureNames.WALLET_TREZOR);
  if (trezorFeature?.value === constants.ENABLED
    && trezorFeature.supportedBrowsers[currentBrowser.toLowerCase() as keyof SupportedBrowsers]) {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    rLoginOptions.providerOptions['custom-trezor'] = customTrezorProviderOptions;
  }
  const rLoginSetup = new RLogin(rLoginOptions);
  return rLoginSetup;
}
