import { AddressStatus, SatoshiBig } from '@/common/types';
import { ApiService } from '@/common/services';

export default class UnusedAddressesService {
  public static areUnusedAddresses(addressList: string[]): Promise<AddressStatus[]> {
    return ApiService.getAddressesInfo(addressList)
      .then((addressesInfo) => addressesInfo.map(
        (addressInfo) => {
          const totalReceived = new SatoshiBig(addressInfo.totalReceived, 'satoshi');
          const totalSent = new SatoshiBig(addressInfo.totalSent, 'satoshi');
          const unused = totalReceived.eq(0) && totalSent.eq(0);
          return {
            address: addressInfo.address,
            unused,
          };
        },
      ))
      .catch((e) => {
        throw e;
      });
  }
}
