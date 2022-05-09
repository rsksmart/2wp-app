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
  it('should extends TxBuilder class');
  it('should ensure enable before each call');
  it('should  get the specified # of address');
  it('should sign a psbt in base64 format');
  it('should return an error if the sign can not be verified');
});
