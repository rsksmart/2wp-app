import { BlockchainConnection, Network } from '@rsksmart/bridges-core-sdk';
import {
  AcceptedPegoutQuote, Flyover,
  LiquidityProvider, PegoutQuote, Quote,
  AcceptedQuote,
} from '@rsksmart/flyover-sdk';
import * as constants from '@/common/store/constants';
import {
  LiquidityProvider2WP, QuotePegIn2WP, QuotePegOut2WP,
  SatoshiBig, WeiBig,
} from '@/common/types';
import { providers } from 'ethers';
import { EnvironmentAccessorService } from './enviroment-accessor.service';
import { isValidSiteKey, ServiceError } from '../utils';

export default class FlyoverService {
  flyover?: Flyover;

  flyovernetwork: Network;

  private lbcAddress = EnvironmentAccessorService.getEnvironmentVariables().lbcAddress;

  private liquidityProviders: LiquidityProvider[] = [];

  private pegoutQuotes: PegoutQuote[] = [];

  private providerUrl?: string;

  private peginQuotes: Quote[] = [];

  public siteKey = '';

  private token = '';

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
            captchaTokenResolver: this.tokenResolver.bind(this),
            disableChecksum: true,
          });
          resolve();
        })
        .catch((error: Error) => {
          reject(new ServiceError(
            'FlyoverService',
            'initialize',
            'There was an error connecting to the Flyover server',
            error.message,
          ));
        });
    });
  }

  // eslint-disable-next-line class-methods-use-this
  private tokenResolver(): Promise<string> {
    return new Promise((resolve, reject) => {
      const token = window.grecaptcha.getResponse();
      if (token) resolve(token);
      reject(new ServiceError(
        'FlyoverService',
        'tokenResolver',
        'There is no token available',
        'Token not found',
      ));
    });
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
          const providerKey = liquidityProviders[0].siteKey;
          if (isValidSiteKey(providerKey)) this.siteKey = liquidityProviders[0].siteKey;
          resolve(providers2wp);
        })
        .catch((error: Error) => {
          reject(new ServiceError(
            'FlyoverService',
            'getProviders',
            'There was an error getting the liquidity providers from the Flyover server',
            error.message,
          ));
        });
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
          const valids = pegoutQuotes.filter((quote: QuotePegOut2WP) => this.isValidPegoutQuote({
            rskRefundAddress,
            btcRefundAddress,
            btcRecipientAddress,
            valueToTransfer,
          }, quote));
          resolve(valids);
        })
        .catch((error: Error) => {
          reject(new ServiceError(
            'FlyoverService',
            'getPegoutQuotes',
            'There was an error getting the options from the Flyover server',
            error.message,
          ));
        });
    });
  }

  public acceptPegoutQuote(quoteHash: string): Promise<AcceptedPegoutQuote> {
    return new Promise<AcceptedPegoutQuote>((resolve, reject) => {
      const selectedQuote = this.pegoutQuotes
        .find((quote: PegoutQuote) => quote.quoteHash === quoteHash);
      if (selectedQuote) {
        this.flyover?.acceptPegoutQuote(selectedQuote)
          .then(resolve)
          .catch((error: Error) => {
            reject(new ServiceError(
              'FlyoverService',
              'acceptPegoutQuote',
              'There was an error accepting the option from the Flyover server',
              error.message,
            ));
          });
      } else {
        reject(new ServiceError(
          'FlyoverService',
          'acceptPegoutQuote',
          'The selected option does not exist',
          'Quote not found',
        ));
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
            reject(new ServiceError(
              'FlyoverService',
              'acceptAndSendPegoutQuote',
              'The option to be accepted is not valid',
              'Invalid accepted quote',
            ));
          }
          const selectedQuote = this.pegoutQuotes
            .find((quote: PegoutQuote) => quote.quoteHash === quoteHash);
          if (selectedQuote) {
            const amountToTransfer = this.calculateFinalAmountToTransfer(quoteHash);
            this.flyover?.depositPegout(selectedQuote, acceptedQuote.signature, amountToTransfer)
              .then((txHash: string) => resolve(txHash))
              .catch((error: Error) => {
                reject(new ServiceError(
                  'FlyoverService',
                  'acceptAndSendPegoutQuote',
                  "We didn't receive confirmation for your transaction. If you intended to complete it, please try again.",
                  error.message,
                ));
              });
          }
        })
        .catch((error: Error) => {
          reject(new ServiceError(
            'FlyoverService',
            'acceptAndSendPegoutQuote',
            'There was an error accepting the option from the Flyover server',
            error.message,
          ));
        });
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

  private isValidPegoutQuote(
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
      || quote.productFeeAmount.lt(0) // TODO: Check if can be 0
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

  public getPeginQuotes(
    rootstockRecipientAddress: string,
    bitcoinRefundAddress: string,
    valueToTransfer: SatoshiBig,
  ):Promise<Array<QuotePegIn2WP>> {
    return new Promise<Array<QuotePegIn2WP>>((resolve, reject) => {
      this.flyover?.getQuotes({
        rskRefundAddress: rootstockRecipientAddress,
        bitcoinRefundAddress,
        // TODO: this should be fixed in the SDK: valueToTransfer is in BTC
        valueToTransfer: new WeiBig(valueToTransfer.toBTCString(), 'rbtc').toWeiBigInt(),
        callContractArguments: '',
        callEoaOrContractAddress: rootstockRecipientAddress,
      })
        .then((quotes: Quote[]) => {
          this.peginQuotes = quotes;
          const peginQuotes = quotes
            .filter((quote: Quote) => this.isValidPeginQuote(quote, {
              rootstockRecipientAddress,
              bitcoinRefundAddress,
              valueToTransfer,
            }))
            .map(({ quote, quoteHash }: Quote) => ({
              quote: {
                ...quote,
                timeForDepositInSeconds: quote.timeForDeposit,
                callFee: SatoshiBig.fromWeiBig(new WeiBig(quote.callFee ?? 0, 'wei')),
                gasFee: new WeiBig(quote.gasFee ?? 0, 'wei'),
                penaltyFee: new WeiBig(quote.penaltyFee ?? 0, 'wei'),
                productFeeAmount: SatoshiBig.fromWeiBig(new WeiBig(quote.productFeeAmount ?? 0, 'wei')),
                value: SatoshiBig.fromWeiBig(new WeiBig(quote.value ?? 0, 'wei')),
              },
              quoteHash,
            }));
          resolve(peginQuotes);
        })
        .catch((error: Error) => {
          reject(new ServiceError(
            'FlyoverService',
            'getPeginQuotes',
            'There was an error getting the options from the Flyover server',
            error.message,
          ));
        });
    });
  }

  private isValidPeginQuote(
    { quote }: Quote,
    quoteRequest: {
      rootstockRecipientAddress: string;
        bitcoinRefundAddress: string;
        valueToTransfer: SatoshiBig;
      },
  ): boolean {
    if (
      new Date(quote.agreementTimestamp).getTime() <= 0
      || quote.timeForDeposit <= 0
    ) {
      return false;
    }

    if (
      quoteRequest.bitcoinRefundAddress !== quote.btcRefundAddr
      || quoteRequest.rootstockRecipientAddress !== quote.rskRefundAddr
      || new WeiBig(quoteRequest.valueToTransfer.toBTCString(), 'rbtc').toWeiBigInt() !== BigInt(quote.value)
    ) {
      return false;
    }
    if (quote.lbcAddr !== this.lbcAddress) {
      return false;
    }
    return true;
  }

  public acceptPeginQuote(quoteHash: string): Promise<AcceptedQuote> {
    return new Promise<AcceptedQuote>((resolve, reject) => {
      const selectedQuote = this.peginQuotes
        .find((quote: Quote) => quote.quoteHash === quoteHash);
      if (selectedQuote) {
        this.flyover?.acceptQuote(selectedQuote)
          .then(resolve)
          .catch((error: Error) => {
            reject(new ServiceError(
              'FlyoverService',
              'acceptPeginQuote',
              'There was an error accepting the option from the Flyover server',
              error.message,
            ));
          });
      } else {
        reject(new ServiceError(
          'FlyoverService',
          'acceptPeginQuote',
          'The selected option does not exist',
          'Quote not found',
        ));
      }
    });
  }

  public registerPeginQuote(
    quoteHash: string,
    signature: string,
    btcRawTransaction: string,
    partialMerkleTree: string,
    blockheight: number,
  ): Promise<string> {
    return new Promise<string>((resolve, reject) => {
      const selectedQuote = this.peginQuotes
        .find((quote: Quote) => quote.quoteHash === quoteHash);
      if (selectedQuote) {
        this.flyover?.registerPegin({
          quote: selectedQuote,
          signature,
          btcRawTransaction,
          partialMerkleTree,
          height: blockheight,
        })
          .then((txHash: string) => resolve(txHash))
          .catch((error: Error) => {
            reject(new ServiceError(
              'FlyoverService',
              'registerPeginQuote',
              'Somenthing went wrong with the registration of your transaction.',
              error.message,
            ));
          });
      }
    });
  }
}
