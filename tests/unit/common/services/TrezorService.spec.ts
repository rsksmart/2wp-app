import TrezorConnect, {
  Response, Address, Success,
} from '@trezor/connect-web';
import sinon from 'sinon';
import { EnvironmentAccessorService } from '@/common/services/enviroment-accessor.service';
import * as constants from '@/common/store/constants';
import TrezorService from '@/common/services/TrezorService';
import { WalletService } from '../../../../src/common/services';
import { TrezorServiceMockedData } from '../../../utils/TrezorServiceMockedData';

const initEnvironment = () => {
  const defaultEnvironmentVariables = {
    vueAppCoin: constants.BTC_NETWORK_TESTNET,
    vueAppManifestAppUrl: '',
    vueAppManifestEmail: '',
    vueAppWalletAddressHardStop: 100,
    vueAppWalletAddressPerCall: 20,
  };
  EnvironmentAccessorService.initializeEnvironmentVariables(defaultEnvironmentVariables);
};
describe('TrezorService:', () => {
  beforeEach(() => {
    initEnvironment();
    sinon.stub(TrezorConnect, 'manifest').returns();
    sinon.stub(TrezorConnect, 'getAddress').callsFake(({ bundle }) => {
      const result: Success<Address[]> = {
        success: true,
        payload: [],
      };
      const payload: Array<{address:string, path: number[], serializedPath:string}> = [];
      for (let getAddressIdx = 0; getAddressIdx < bundle.length; getAddressIdx += 1) {
        const found = TrezorServiceMockedData.addressList
          .find((addressItem) => addressItem.serializedPath === bundle[getAddressIdx].path);
        if (found) {
          payload.push(found);
        }
      }
      result.payload = payload.map((addressItem) => ({
        address: addressItem.address,
        path: addressItem.path,
        serializedPath: addressItem.serializedPath,
      }));
      return Promise.resolve(result) as Response<Address[]>;
    });
  });

  afterEach(() => {
    sinon.restore();
  });
  it('should create a WalletService instance', () => {
    const trezorService = new TrezorService();
    expect(trezorService).toBeInstanceOf(WalletService);
  });
  it('should return required number of addresses', () => {
    const trezorService = new TrezorService();
    return trezorService.getAccountAddresses()
      .then((addresses) => {
        expect(addresses.length).toEqual(60);
      });
  });
});
