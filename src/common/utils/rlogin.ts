import RLogin from '@rsksmart/rlogin';
import { EnvironmentAccessorService } from '@/common/services/enviroment-accessor.service';
import WalletConnectProvider from '@walletconnect/web3-provider';
import { trezorProviderOptions } from '@rsksmart/rlogin-trezor-provider';
import { ledgerProviderOptions } from '@rsksmart/rlogin-ledger-provider';
import * as constants from '@/common/store/constants';

export function getRloginInstance(): RLogin {
  const rpcUrls = {};
  const customLedgerProviderOptions = ledgerProviderOptions;
  customLedgerProviderOptions.connector = async (ProviderPackage, options) => {
    const ledgerOptions = options;
    ledgerOptions.messageHashed = true;
    const provider = new ProviderPackage(ledgerOptions);
    await provider.connect();
    return provider;
  };
  const network = EnvironmentAccessorService.getEnvironmentVariables().vueAppCoin;
  if (network === constants.BTC_NETWORK_MAINNET) {
    Object
      .defineProperty(rpcUrls, constants.SUPPORTED_NETWORKS.RSK_MAINNET.chainId, {
        value: constants.SUPPORTED_NETWORKS.RSK_MAINNET.rpcUrl,
        writable: false,
        configurable: true,
        enumerable: true,
      });
  } else {
    Object
      .defineProperty(rpcUrls, constants.SUPPORTED_NETWORKS.RSK_TESTNET.chainId, {
        value: constants.SUPPORTED_NETWORKS.RSK_TESTNET.rpcUrl,
        writable: false,
        configurable: true,
        enumerable: true,
      });
  }
  const supportedChains = Object.keys(rpcUrls).map(Number);
  const rLoginSetup = new RLogin({
    cacheProvider: true,
    defaultTheme: 'dark',
    providerOptions: {
      walletconnect: {
        package: WalletConnectProvider,
        options: {
          rpc: rpcUrls,
        },
      },
      'custom-ledger': customLedgerProviderOptions,
      'custom-trezor': {
        ...trezorProviderOptions,
        options: {
          dPath: "m/44'/37310'/0'/0/0",
          manifestEmail: EnvironmentAccessorService
            .getEnvironmentVariables().vueAppManifestEmail,
          manifestAppUrl: EnvironmentAccessorService
            .getEnvironmentVariables().vueAppManifestAppUrl,
        },
      },
    },
    rpcUrls,
    supportedChains,
  });
  return rLoginSetup;
}
