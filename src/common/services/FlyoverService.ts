import { BlockchainConnection, Network } from '@rsksmart/bridges-core-sdk';
import { Flyover, LiquidityProvider } from '@rsksmart/flyover-sdk';
import * as constants from '@/common/store/constants';
import { EnvironmentAccessorService } from './enviroment-accessor.service';

export default class FlyoverService {
    flyover?: Flyover;

    flyovernetwork: Network;

    constructor() {
      const appNetwork = EnvironmentAccessorService.getEnvironmentVariables().vueAppCoin;
      switch (appNetwork) {
        case constants.BTC_NETWORK_MAINNET:
          this.flyovernetwork = 'Mainnet';
          break;
        case constants.BTC_NETWORK_TESTNET:
          this.flyovernetwork = 'Testnet';
          break;
        default:
          this.flyovernetwork = 'Regtest';
          break;
      }
    }

    initialize(): Promise<void> {
      return new Promise<void>((resolve, reject) => {
        BlockchainConnection.createUsingStandard(window.ethereum)
          .then((connection: BlockchainConnection) => {
            this.flyover = new Flyover({
              network: this.flyovernetwork,
              rskConnection: connection,
              captchaTokenResolver: this.tokenResolver,
            });
            resolve();
          })
          .catch(reject);
      });
    }

    // eslint-disable-next-line class-methods-use-this
    private tokenResolver(): Promise<string> {
      // TODO: Implement captcha token resolver
      return Promise.resolve('testToken');
    }

    public async getProviders(): Promise<LiquidityProvider[]> {
      return new Promise<LiquidityProvider[]>((resolve, reject) => {
        this.flyover?.getLiquidityProviders()
          .then((providers: LiquidityProvider[]) => {
            resolve(providers);
          }).catch(reject);
      });
    }
}
