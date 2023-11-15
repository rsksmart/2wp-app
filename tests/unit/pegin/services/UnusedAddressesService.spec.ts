import axios from 'axios';
import sinon from 'sinon';
import { UnusedAddressesService } from '@/pegin/services';
import { AddressInfo } from '@/pegin/types';
import { EnvironmentAccessorService } from '@/common/services/enviroment-accessor.service';
import * as constants from '@/common/store/constants';

const API_URL = 'https://api.url';

function setEnvironment() {
  const defaultEnvironmentVariables = {
    vueAppCoin: constants.BTC_NETWORK_TESTNET,
    vueAppRskNodeHost: '',
    vueAppApiBaseUrl: API_URL,
  };
  EnvironmentAccessorService.initializeEnvironmentVariables(defaultEnvironmentVariables);
}

describe('UnusedAddresses Service', () => {
  beforeEach(setEnvironment);
  afterEach(() => {
    sinon.restore();
  });

  it('should return given an address list which addresses are unused', () => {
    const addressesInfo: AddressInfo[] = [
      { address: 'A', totalReceived: '0', totalSent: '0' },
      { address: 'B', totalReceived: '1', totalSent: '0' },
    ];

    const axiosStub = sinon.stub(axios);
    axiosStub.post
      .withArgs(`${API_URL}/addressesInfo`)
      .resolves({ data: addressesInfo });

    const addressesWithStatus = [
      { address: 'A', unused: true },
      { address: 'B', unused: false },
    ];

    expect(UnusedAddressesService.areUnusedAddresses(['A', 'B']))
      .resolves
      .toEqual(addressesWithStatus);
  });
});
