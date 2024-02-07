import { BlockchainConnection, Network } from '@rsksmart/bridges-core-sdk';
import {
  AcceptedPegoutQuote, Flyover,
  LiquidityProvider, PegoutQuote,
} from '@rsksmart/flyover-sdk';
import * as constants from '@/common/store/constants';
import {
  LiquidityProvider2WP, QuotePegOut2WP,
  SatoshiBig, WeiBig,
} from '@/common/types';
import { providers } from 'ethers';
import { EnvironmentAccessorService } from './enviroment-accessor.service';

export default class FlyoverService {
  flyover?: Flyover;

  flyovernetwork: Network;

  private lbcAddress = EnvironmentAccessorService.getEnvironmentVariables().lbcAddress;

  private liquidityProviders: LiquidityProvider[] = [];

  private pegoutQuotes: PegoutQuote[] = [];

  private providerUrl?: string;

  constructor(providerUrl?: string) {
    this.providerUrl = providerUrl;
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
      const provider = this.providerUrl
        ? new providers.JsonRpcProvider(this.providerUrl) : window.ethereum;
      BlockchainConnection.createUsingStandard(provider)
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

  public getProviders(): Promise<LiquidityProvider2WP[]> {
    return new Promise<LiquidityProvider2WP[]>((resolve, reject) => {
      this.flyover?.getLiquidityProviders()
        .then((liquidityProviders: LiquidityProvider[]) => {
          this.liquidityProviders = liquidityProviders;
          const providers2wp: LiquidityProvider2WP[] = liquidityProviders
            .map((provider: LiquidityProvider) => ({
              ...provider,
              pegin: {
                requiredConfirmations: provider.pegin.requiredConfirmations,
                fee: new SatoshiBig(provider.pegin.fee, 'satoshi'),
                maxTransactionValue: new SatoshiBig(provider.pegin.maxTransactionValue, 'satoshi'),
                minTransactionValue: new SatoshiBig(provider.pegin.minTransactionValue, 'satoshi'),
              },
              pegout: {
                requiredConfirmations: provider.pegout.requiredConfirmations,
                fee: new WeiBig(provider.pegout.fee, 'wei'),
                maxTransactionValue: new WeiBig(provider.pegout.maxTransactionValue, 'wei'),
                minTransactionValue: new WeiBig(provider.pegout.minTransactionValue, 'wei'),
              },
            }));
          resolve(providers2wp);
        }).catch(reject);
    });
  }

  public useLiquidityProvider(providerId: number): void {
    const provider = this.liquidityProviders.find((p: LiquidityProvider) => p.id === providerId);
    if (provider) {
      this.flyover?.useLiquidityProvider(provider);
    }
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
          this.pegoutQuotes = quotes;
          const pegoutQuotes = quotes.map((pegoutQuote: PegoutQuote) => ({
            quote: {
              ...pegoutQuote.quote,
              callFee: new WeiBig(pegoutQuote.quote.callFee ?? 0, 'wei'),
              gasFee: new WeiBig(pegoutQuote.quote.gasFee ?? 0, 'wei'),
              penaltyFee: new WeiBig(pegoutQuote.quote.penaltyFee ?? 0, 'wei'),
              productFeeAmount: new WeiBig(pegoutQuote.quote.productFeeAmount ?? 0, 'wei'),
              value: new WeiBig(pegoutQuote.quote.value ?? 0, 'wei'),
            },
            quoteHash: pegoutQuote.quoteHash,
          }));
          const valids = pegoutQuotes.filter((quote: QuotePegOut2WP) => this.isValidQuote({
            rskRefundAddress,
            btcRefundAddress,
            btcRecipientAddress,
            valueToTransfer,
          }, quote));
          resolve(valids);
        })
        .catch(reject);
    });
  }

  public acceptPegoutQuote(quoteHash: string): Promise<AcceptedPegoutQuote> {
    return new Promise<AcceptedPegoutQuote>((resolve, reject) => {
      const selectedQuote = this.pegoutQuotes
        .find((quote: PegoutQuote) => quote.quoteHash === quoteHash);
      if (selectedQuote) {
        this.flyover?.acceptPegoutQuote(selectedQuote)
          .then(resolve)
          .catch(reject);
      } else {
        reject(new Error('Quote not found'));
      }
    });
  }

  public acceptAndSendPegoutQuote(quoteHash: string): Promise<string> {
    return new Promise<string>((resolve, reject) => {
      this.acceptPegoutQuote(quoteHash)
        .then((acceptedQuote: AcceptedPegoutQuote) => Promise
          .all([this.isValidAcceptedQuote(quoteHash, acceptedQuote.signature), acceptedQuote]))
        .then(([isValidQuote, acceptedQuote]) => {
          if (!isValidQuote) {
            reject(new Error('Invalid accepted quote'));
          }
          const selectedQuote = this.pegoutQuotes
            .find((quote: PegoutQuote) => quote.quoteHash === quoteHash);
          if (selectedQuote) {
            const amountToTransfer = this.calculateFinalAmountToTransfer(quoteHash);
            this.flyover?.depositPegout(selectedQuote, acceptedQuote.signature, amountToTransfer)
              .then((txHash: string) => resolve(txHash));
          }
        })
        .catch(reject);
    });
  }

  private calculateFinalAmountToTransfer(quoteHash: string): bigint {
    let amount = 0n;
    const selectedQuote = this.pegoutQuotes
      .find((quote: PegoutQuote) => quote.quoteHash === quoteHash);
    if (selectedQuote) {
      const { quote } = selectedQuote;
      amount = BigInt(quote.value)
            + BigInt(quote.productFeeAmount)
            + BigInt(quote.gasFee)
            + BigInt(quote.callFee);
    }
    return amount;
  }

  // eslint-disable-next-line
  private isValidAcceptedQuote(quoteHash: string, signature: string): Promise<boolean> {
    // TODO: Validate with getRegisteredPegOutQuote method from LBC
    return Promise.resolve(true);
  }

  private isValidQuote(
    quoteRequest: {
      rskRefundAddress: string;
      btcRefundAddress: string;
      btcRecipientAddress: string;
      valueToTransfer: WeiBig;
    },
    quoteResponse: QuotePegOut2WP,
  ): boolean {
    const { quote } = quoteResponse;
    if (
      new Date(quote.agreementTimestamp).getTime() <= 0
      || new Date(quote.depositDateLimit).getTime() <= 0
      || new Date(quote.expireDate).getTime() <= 0
      || new Date(quote.transferTime).getTime() <= 0
    ) {
      return false;
    }
    if (
      quoteRequest.btcRefundAddress !== quote.btcRefundAddress
      || quoteRequest.btcRecipientAddress !== quote.depositAddr // TODO: Check if this is correct
      || quoteRequest.rskRefundAddress !== quote.rskRefundAddress
    ) {
      return false;
    }
    if (
      quote.callFee.lte(0)
      || quote.gasFee.lte(0)
      || quote.penaltyFee.lte(0)
      || quote.productFeeAmount.lte(0)
      || quote.value.lte(0)
    ) {
      return false;
    }
    if (quote.lbcAddress !== this.lbcAddress) {
      return false;
    }
    if (
      quote.depositConfirmations <= 0
      || quote.expireBlocks <= 0
      || quote.transferConfirmations <= 0
    ) {
      return false;
    }

    // TODO: Validate liquidityProviderRskAddress and lpBtcAddr
    // TODO: Check if nonce needs to be validated
    return true;
  }
}
