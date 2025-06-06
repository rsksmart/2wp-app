import {
  AppKitNetwork, bitcoin, bitcoinTestnet, rootstock, rootstockTestnet,
} from '@reown/appkit/networks';
import * as constants from '@/common/store/constants';
import { EnvironmentAccessorService } from '../services/enviroment-accessor.service';

export function getNetworks(): [AppKitNetwork, ...AppKitNetwork[]] {
  let networks = [];
  const env = EnvironmentAccessorService.getEnvironmentVariables();
  if (env.vueAppCoin === constants.BTC_NETWORK_MAINNET) {
    networks = [bitcoin, rootstock];
  } else {
    networks = [bitcoinTestnet, rootstockTestnet];
  }
  return networks as unknown as [AppKitNetwork, ...AppKitNetwork[]];
}
