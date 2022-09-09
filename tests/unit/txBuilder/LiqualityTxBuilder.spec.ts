import * as constants from '@/store/constants';
import { EnvironmentAccessorService } from '@/services/enviroment-accessor.service';

const initEnvironment = () => {
  const defaultEnvironmentVariables = {
    vueAppCoin: constants.BTC_NETWORK_TESTNET,
    vueAppManifestAppUrl: '',
    vueAppManifestEmail: '',
    vueAppWalletMaxCallLiquality: 1,
    vueAppWalletAddressesPerCallLiquality: 1,
  };
  EnvironmentAccessorService.initializeEnvironmentVariables(defaultEnvironmentVariables);
};
describe('Liquality TxBuilder', () => {
  beforeEach(initEnvironment);
  test.todo('should extends TxBuilder class');
  test.todo('should ensure enable before each call');
  test.todo('should  get the specified # of address');
  test.todo('should sign a psbt in base64 format');
  test.todo('should return an error if the sign can not be verified');
});
