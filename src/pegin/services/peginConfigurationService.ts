import { BridgeService } from '@/common/services/BridgeService';
import { PeginConfiguration } from '@/common/types';

export default class PeginConfigurationService {
  public static getPeginConfiguration(): Promise<PeginConfiguration> {
    return new Promise<PeginConfiguration>((resolve, reject) => {
      const bridgeService = new BridgeService();

      Promise.all([
        bridgeService.getMinPeginValue(),
        bridgeService.getFederationAddress(),
        bridgeService.getPeginAvailability(),
      ])
        .then(([minValue, federationAddress, availability]) => {
          const peginConf: PeginConfiguration = ({
            minValue,
            maxValue: availability,
            federationAddress,
            btcConfirmations: Number(process.env.BTC_CONFIRMATIONS) ?? 100,
            // sessionId should be remove eventually
            sessionId: '',
          });
          resolve(peginConf);
        })
        .catch((e) => {
          reject(e);
        });
    });
  }
}
