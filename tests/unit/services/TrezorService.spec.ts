import sinon from 'sinon';
import { expect } from 'chai';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import Proxyquire from 'proxyquire';
// import TrezorService from '@/services/TrezorService';
import { EnvironmentAccessorService } from '@/services/enviroment-accessor.service';
import * as constants from '@/store/constants';

const initEnvironment = () => {
  const defaultEnvironmentVariables = {
    vueAppCoin: constants.BTC_NETWORK_TESTNET,
    vueAppManifestAppUrl: '',
    vueAppManifestEmail: '',
    vueAppWalletMaxCallTrezor: 1,
    vueAppWalletAddressesPerCallTrezor: 1,
  };
  EnvironmentAccessorService.initializeEnvironmentVariables(defaultEnvironmentVariables);
};
describe('TrezorService:', () => {
  const proxyquire = Proxyquire.noCallThru();
  const TrezorService = proxyquire('@/services/TrezorService', {
    'trezor-connect': '../utils/MockedTrezorConnect',
  });
  beforeEach(initEnvironment);
  it('should create a TrezorService instance', () => {
    const trezorService = new TrezorService();
    return expect(trezorService).to.be.instanceOf(TrezorService);
  });
});
