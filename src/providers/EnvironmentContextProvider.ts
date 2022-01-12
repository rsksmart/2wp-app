import { EnvironmentAccessorService } from '@/services/enviroment-accessor.service';
import EnvironmentContextImpl from './EnvironmentContextImplMainnet';
import EnvironmentContextImplTestnet from './EnvironmentContextImplTestnet';
import { EnvironmentContext } from './types';

export default class EnvironmentContextProviderService {
  static getEnvironmentContext(): EnvironmentContext {
    switch (EnvironmentAccessorService.getEnvironmentVariables().vueAppCoin) {
      case 'main':
        return EnvironmentContextImpl.getInstance();
      case 'test':
        return EnvironmentContextImplTestnet.getInstance();
      default:
        throw new Error('Invalid network');
    }
  }
}
