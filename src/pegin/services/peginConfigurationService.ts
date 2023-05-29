import { BridgeService } from "@/common/services/BridgeService";
import { PeginConfiguration } from "@/common/types";

export default class PeginConfigurationService {
  public static getPeginConfiguration(): Promise<PeginConfiguration> {
    return new Promise<PeginConfiguration>(async (resolve, reject) => {
      const bridgeService = new BridgeService();
      
      Promise.all([
        bridgeService.getMinPeginValue(),
        bridgeService.getFederationAddress(),
        bridgeService.getPeginAvailability(),
      ])
      .then(([minValue, federationAddress, availability]) => {
        const peginConf: PeginConfiguration = ({
          minValue: minValue,
          maxValue: availability,
          federationAddress: federationAddress,
          btcConfirmations: Number(process.env.BTC_CONFIRMATIONS) ?? 100,
        });
        resolve(peginConf);
      })
      .catch((e) => {
        reject(e);
      });
    });
  }
} 