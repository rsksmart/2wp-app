import { EnvironmentAccessorService } from '@/common/services/enviroment-accessor.service';
import * as constants from '@/common/store/constants';
import TrezorConnect, {
  BundledResponse, Address, Success,
} from 'trezor-connect';
import TrezorService from '@/common/services/TrezorService';
import sinon from 'sinon';
import { WalletService } from '../../../src/common/services';
import { TrezorServiceMockedData } from '../../utils/TrezorServiceMockedData';

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
        id: 1,
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
      return Promise.resolve(result) as BundledResponse<Address>;
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
