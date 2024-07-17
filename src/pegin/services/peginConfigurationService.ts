import { BridgeService } from '@/common/services/BridgeService';
import { EnvironmentAccessorService } from '@/common/services/enviroment-accessor.service';
import { PeginConfiguration } from '@/common/types';

export default class PeginConfigurationService {
  public static getPeginConfiguration(): Promise<PeginConfiguration> {
    return new Promise<PeginConfiguration>((resolve, reject) => {
      const bridgeService = new BridgeService();
      const {
        peginMinAmountAllowedInBtc: minValue,
        peginMaxAmountAllowedInBtc: maxValue,
      } = EnvironmentAccessorService.getEnvironmentVariables();
      bridgeService.getFederationAddress().then((federationAddress) => {
        const peginConf: PeginConfiguration = ({
          minValue,
          maxValue,
          federationAddress,
          // sessionId should be removed eventually
          sessionId: '',
        });
        resolve(peginConf);
      })
        .catch(reject);
    });
  }
}
