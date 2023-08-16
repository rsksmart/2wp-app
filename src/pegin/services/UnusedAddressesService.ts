import axios from 'axios';
import { EnvironmentAccessorService } from '@/common/services/enviroment-accessor.service';
import { AddressStatus, SatoshiBig } from '@/common/types';
import { AddressInfo } from '../types';

export default class UnusedAddressesService {
  private static getAddressInfo(address: string): Promise<AddressInfo> {
    const baseUrl = EnvironmentAccessorService.getEnvironmentVariables().vueAppApiBaseUrl;

    return axios.get(`${baseUrl}/api/v2/address/${address}`)
      .then((response) => response.data);
  }

  public static areUnusedAddresses(addressList: string[]): Promise<AddressStatus[]> {
    const addressInfoPromises = addressList.map((address) => this.getAddressInfo(address));

    return Promise.all(addressInfoPromises)
      .then((addressesInfo) => addressesInfo.map(
        (addressInfo) => {
          const totalReceived = new SatoshiBig(addressInfo.totalReceived, 'satoshi');
          const totalSent = new SatoshiBig(addressInfo.totalSent, 'satoshi');
          const unused = totalReceived.eq(0) && totalSent.eq(0);
          return { address: addressInfo.address, unused };
        },
      )).catch((e) => { throw e; });
  }
}