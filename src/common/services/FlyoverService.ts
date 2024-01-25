import { BlockchainConnection, Network } from '@rsksmart/bridges-core-sdk';
import { Flyover, LiquidityProvider, PegoutQuote } from '@rsksmart/flyover-sdk';
import * as constants from '@/common/store/constants';
import { QuotePegOut2WP, WeiBig } from '@/common/types';
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

    public getProviders(): Promise<LiquidityProvider[]> {
      return new Promise<LiquidityProvider[]>((resolve, reject) => {
        this.flyover?.getLiquidityProviders()
          .then((providers: LiquidityProvider[]) => {
            resolve(providers);
          }).catch(reject);
      });
    }

    public getPegoutQuotes(
      rskRefundAddress: string,
      btcRefundAddress: string,
      btcRecipientAddress: string,
      valueToTransfer: WeiBig,
    ): Promise<QuotePegOut2WP[]> {
      return new Promise<QuotePegOut2WP[]>((resolve, reject) => {
        this.flyover?.getPegoutQuotes({
          bitcoinRefundAddress: btcRefundAddress,
          rskRefundAddress,
          to: btcRecipientAddress,
          valueToTransfer: valueToTransfer.toWeiBigInt(),
        })
          .then((quotes: PegoutQuote[]) => {
            const pegoutQuotes = quotes.map((pegoutQuote: PegoutQuote) => ({
              quote: {
                ...pegoutQuote.quote,
                callFee: new WeiBig(pegoutQuote.quote.callFee, 'wei'),
                gasFee: new WeiBig(pegoutQuote.quote.gasFee, 'wei'),
                penaltyFee: new WeiBig(pegoutQuote.quote.penaltyFee, 'wei'),
                productFeeAmount: new WeiBig(pegoutQuote.quote.productFeeAmount, 'wei'),
                value: new WeiBig(pegoutQuote.quote.value, 'wei'),
              },
              quoteHash: pegoutQuote.quoteHash,
            }));
            resolve(pegoutQuotes);
          })
          .catch(reject);
      });
    }
}
