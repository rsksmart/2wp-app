import * as trezorConnectModule from 'trezor-connect';
// import MockedTrezorConnect from '../utils/MockedTrezorConnect';
import { EnvironmentAccessorService } from '@/services/enviroment-accessor.service';
import * as constants from '@/store/constants';
import TrezorConnect, { BundledResponse, Address, Success, GetAddress } from 'trezor-connect';
import TrezorService from '@/services/TrezorService';
import sinon from 'sinon';
import { WalletService } from '../../../src/services';
import { TrezorServiceMockedData } from '../../utils/TrezorServiceMockedData';
import getAddress = TrezorConnect.getAddress;
import { forEach } from 'lodash';

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
