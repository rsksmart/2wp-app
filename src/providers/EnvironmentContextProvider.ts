import { EnvironmentAccessorService } from '@/services/enviroment-accessor.service';
import { BTC_NETWORK_MAINNET, BTC_NETWORK_TESTNET } from '@/store/constants';
import EnvironmentContextImpl from './EnvironmentContextImplMainnet';
import EnvironmentContextImplTestnet from './EnvironmentContextImplTestnet';
import { EnvironmentContext } from './types';

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
