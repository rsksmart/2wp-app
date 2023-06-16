import axios from 'axios';
import { UnusedAddressesService } from '@/pegin/services';
import { AddressInfo } from '@/pegin/types';
import { EnvironmentAccessorService } from '@/common/services/enviroment-accessor.service';
import * as constants from '@/common/store/constants';
import sinon from 'sinon';

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
    axiosStub.get
      .withArgs(`${API_URL}/api/v2/address/A`)
      .resolves({ data: addressesInfo[0] })
      .withArgs(`${API_URL}/api/v2/address/B`)
      .resolves({ data: addressesInfo[1] });

    const addressesWithStatus = [
      { address: 'A', unused: true },
      { address: 'B', unused: false },
    ];

    expect(UnusedAddressesService.areUnusedAddresses(['A', 'B']))
      .resolves
      .toEqual(addressesWithStatus);
  });
});
