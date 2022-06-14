import { EnvironmentAccessorService } from '@/services/enviroment-accessor.service';
import EnvironmentContextImpl from './EnvironmentContextImplMainnet';
import EnvironmentContextImplTestnet from './EnvironmentContextImplTestnet';
import { EnvironmentContext } from './types';
import { BTC_NETWORK_MAINNET, BTC_NETWORK_TESTNET } from '@/store/constants';

export default class EnvironmentContextProviderService {
  static getEnvironmentContext(): EnvironmentContext {
    switch (EnvironmentAccessorService.getEnvironmentVariables().vueAppCoin) {
      case BTC_NETWORK_MAINNET:
        return EnvironmentContextImpl.getInstance();
      case BTC_NETWORK_TESTNET:
        return EnvironmentContextImplTestnet.getInstance();
      default:
        throw new Error('Invalid network');
    }
  }
}
