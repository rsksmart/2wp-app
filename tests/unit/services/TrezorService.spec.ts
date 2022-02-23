import { expect } from 'chai';
import { ImportMock, MockManager } from 'ts-mock-imports';
import * as trezorConnectModule from 'trezor-connect';
import MockedTrezorConnect from '../utils/MockedTrezorConnect';
import { EnvironmentAccessorService } from '@/services/enviroment-accessor.service';
import * as constants from '@/store/constants';
import TrezorService from '@/services/TrezorService';

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
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  let trezorConnectMock: MockManager<trezorConnectModule.TrezorConnect>;
  // eslint-disable-next-line prefer-const
  trezorConnectMock = ImportMock.mockStaticClass(trezorConnectModule, 'default');
  trezorConnectMock.mock('manifest', 'nothing');
  const trezorService = new TrezorService();
  beforeEach(initEnvironment);
  it('should create a TrezorService instance', () => expect(trezorService).to.be.instanceOf(TrezorService));
  it('should get the same number of requested addresses', () => {
    const batch = 2;
    const startFrom = 0;
    const bundle = MockedTrezorConnect.getAddressesBundle(startFrom, batch);
    trezorConnectMock.mock(
      'getAddress',
      MockedTrezorConnect
        .getAddress({
          bundle,
        }),
    );
    return trezorService.getAccountAddresses(batch, startFrom)
      .then((addresses) => expect(addresses.length === bundle.length));
  });
});
