import { BridgeService } from '@/common/services/BridgeService';
import { EnvironmentAccessorService } from '@/common/services/enviroment-accessor.service';
import { PeginConfiguration } from '@/common/types';

export default class PeginConfigurationService {
  public static getPeginConfiguration(): Promise<PeginConfiguration> {
    return new Promise<PeginConfiguration>((resolve, reject) => {
      const bridgeService = new BridgeService();
      const {
        peginMinAmountAllowedInBtc: minValue,
      } = EnvironmentAccessorService.getEnvironmentVariables();
      bridgeService.getFederationAddress().then((federationAddress) => {
        const peginConf: PeginConfiguration = ({
          minValue,
          federationAddress,
        });
        resolve(peginConf);
      })
        .catch(reject);
    });
  }
}
