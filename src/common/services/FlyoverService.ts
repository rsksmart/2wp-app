import { BlockchainConnection, Network } from '@rsksmart/bridges-core-sdk';
import {
  AcceptedPegoutQuote, Flyover,
  LiquidityProvider, PegoutQuote, Quote,
  AcceptedQuote,
  FlyoverUtils,
} from '@rsksmart/flyover-sdk';
import * as constants from '@/common/store/constants';
import {
  LiquidityProvider2WP, PeginQuote, QuotePegOut2WP, WeiBig, SatoshiBig,
} from '@/common/types';
import { Wallet, providers } from 'ethers';
import { EnvironmentAccessorService } from './enviroment-accessor.service';
import {
  getBtcAddressType,
  isValidSiteKey,
  ServiceError,
  toWeiBigIntString,
} from '../utils';

export default class FlyoverService {
  flyover?: Flyover;

  flyoverNetwork: Network;

  private lbcAddress = EnvironmentAccessorService.getEnvironmentVariables().lbcAddress;

  private liquidityProviders: LiquidityProvider[] = [];

  private pegoutQuotes: PegoutQuote[] = [];

  private providerUrl: string;

  private peginQuotes: Quote[] = [];

  public siteKey = '';

  private token = '';

  private liquidityProviderIdUsed = -1;

  constructor(providerUrl?: string) {
    this.providerUrl = providerUrl
    ?? EnvironmentAccessorService.getEnvironmentVariables().vueAppRskNodeHost;
    this.flyoverNetwork = EnvironmentAccessorService.getEnvironmentVariables().flyoverNetwork;
  }

  initialize(web3Provider?: providers.ExternalProvider): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      const connectionPromise = web3Provider
        ? BlockchainConnection.createUsingStandard(web3Provider)
        : BlockchainConnection.createUsingPassphrase(
          Wallet.createRandom().mnemonic.phrase,
          this.providerUrl,
        );
      connectionPromise
        .then((connection) => {
          this.flyover = new Flyover({
            rskConnection: connection,
            network: this.flyoverNetwork,
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
                fee: new WeiBig(provider.pegin.fee, 'wei'),
                maxTransactionValue: new WeiBig(provider.pegin.maxTransactionValue, 'wei'),
                minTransactionValue: new WeiBig(provider.pegin.minTransactionValue, 'wei'),
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
      this.liquidityProviderIdUsed = providerId;
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
        rskRefundAddress,
        to: btcRecipientAddress,
        valueToTransfer: valueToTransfer.toWeiBigIntUnsafe(),
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
            lpsAddressQrCode: '',
          }));
          const valids = pegoutQuotes.filter((quote: QuotePegOut2WP) => this.isValidPegoutQuote({
            rskRefundAddress,
            btcRefundAddress,
            btcRecipientAddress,
            valueToTransfer,
          }, quote))
            .map(async (quote: QuotePegOut2WP) => {
              const fullQuote = quote;
              fullQuote.lpsAddressQrCode = await this.flyover?.generateQrCode(
                quote.quote.liquidityProviderRskAddress,
                quote.quote.value.toRBTCString(),
                constants.QRCodeNetworks.ROOTSTOCK,
              ) ?? '';
              return fullQuote;
            });
          return Promise.all(valids);
        })
        .then(resolve)
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

  public acceptAndSendPegoutQuote(quoteHash: string): Promise<{txHash: string, signature: string}> {
    return new Promise<{txHash: string, signature: string}>((resolve, reject) => {
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
              .then((txHash: string) => resolve({ txHash, signature: acceptedQuote.signature }))
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
    valueToTransfer: SatoshiBig,
  ):Promise<Array<PeginQuote>> {
    return new Promise<Array<PeginQuote>>((resolve, reject) => {
      this.flyover?.getQuotes({
        rskRefundAddress: rootstockRecipientAddress,
        valueToTransfer: valueToTransfer.toWeiBigIntUnsafe(),
        callContractArguments: '',
        callEoaOrContractAddress: rootstockRecipientAddress,
      })
        .then((quotes: Quote[]) => {
          this.peginQuotes = quotes;
          const peginQuotes = quotes
            .filter((quote: Quote) => this.isValidPeginQuote(quote, {
              rootstockRecipientAddress,
              valueToTransfer,
            }))
            .map(async (quoteFromServer: Quote) => {
              const quote = new PeginQuote(quoteFromServer);
              return quote;
            });
          return Promise.all(peginQuotes);
        })
        .then(resolve)
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
      quoteRequest.rootstockRecipientAddress !== quote.rskRefundAddr
      || new WeiBig(quoteRequest.valueToTransfer.toBTCString(), 'rbtc').toWeiBigIntUnsafe() !== BigInt(quote.value)
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
    btcTxHash: string,
  ): Promise<string> {
    return new Promise<string>((resolve, reject) => {
      const selectedQuote = this.peginQuotes
        .find((quote: Quote) => quote.quoteHash === quoteHash);
      if (selectedQuote) {
        this.flyover?.registerPegin({
          quote: selectedQuote,
          providerSignature: signature,
          userBtcTransactionHash: btcTxHash,
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

  public getAvailableLiquidity(): Promise<{
    providerId: number,
    peginLiquidity: WeiBig,
    pegoutLiquidity: WeiBig,
  }> {
    return new Promise((resolve, reject) => {
      this.flyover?.getAvailableLiquidity()
        .then(({ peginLiquidityAmount, pegoutLiquidityAmount }) => {
          const peginLiquidity = new WeiBig(peginLiquidityAmount, 'wei');
          const pegoutLiquidity = new WeiBig(pegoutLiquidityAmount, 'wei');
          resolve({ providerId: this.liquidityProviderIdUsed, peginLiquidity, pegoutLiquidity });
        })
        .catch((error) => {
          reject(new ServiceError(
            'FlyoverService',
            'getAvailableLiquidity',
            'There was an error getting the available liquidity from the Flyover server',
            error.message,
          ));
        });
    });
  }

  public getPeginStatus(quoteHash: string) {
    return new Promise<{status: string, txId: string}>((resolve, reject) => {
      this.flyover?.getPeginStatus(quoteHash)
        .then((detailedStatus) => {
          const status = FlyoverUtils.getSimpleQuoteStatus(detailedStatus.status.state);
          resolve({ status, txId: detailedStatus.status.callForUserTxHash });
        })
        .catch((error) => {
          reject(new ServiceError(
            'FlyoverService',
            'getPeginStatus',
            'There was an error getting the status of the peg-in transaction from the Flyover server',
            error.message,
          ));
        });
    });
  }

  public getPegoutStatus(quoteHash: string) {
    return new Promise<{status: string, txId: string}>((resolve, reject) => {
      this.flyover?.getPegoutStatus(quoteHash)
        .then((detailedStatus) => {
          const status = FlyoverUtils.getSimpleQuoteStatus(detailedStatus.status.state);
          resolve({ status, txId: detailedStatus.status.lpBtcTxHash });
        })
        .catch((error) => {
          reject(new ServiceError(
            'FlyoverService',
            'getPegoutStatus',
            'There was an error getting the status of the peg-out transaction from the Flyover server',
            error.message,
          ));
        });
    });
  }

  public validatePegin(quote: PeginQuote, signature: string, depositAddress: string, tx: string) {
    return new Promise<string>((resolve, reject) => {
      this.flyover?.validatePeginTransaction({
        quoteInfo: {
          quote: quote.originalQuote,
          quoteHash: quote.quoteHash,
        },
        acceptInfo: {
          signature,
          bitcoinDepositAddressHash: depositAddress,
        },
        btcTx: tx,
      })
        .then(resolve)
        .catch((error) => {
          reject(new ServiceError(
            'FlyoverService',
            'validatePegin',
            'There was an error validating the peg-in transaction, can not be completed.',
            error.message,
          ));
        });
    });
  }

  public async estimatePeginMaxFee(
    maxPerFlyoverTransaction: WeiBig,
    callEoaOrContractAddress: string,
  ): Promise<WeiBig> {
    const valueToTransfer = BigInt(toWeiBigIntString(maxPerFlyoverTransaction.toRBTCString()));
    let maxFee = new WeiBig(0, 'wei');
    try {
      const quotes = await this.flyover?.getQuotes({
        rskRefundAddress: callEoaOrContractAddress,
        valueToTransfer,
        callContractArguments: '',
        callEoaOrContractAddress,
      }) as Quote[];
      quotes.forEach((quote: Quote) => {
        const gasFeeWeiBig = new WeiBig(quote.quote.gasFee ?? 0, 'wei');
        const callFeeWeiBig = new WeiBig(quote.quote.callFee ?? 0, 'wei');
        const productFeeWeiBig = new WeiBig(quote.quote.productFeeAmount ?? 0, 'wei');
        maxFee = gasFeeWeiBig.plus(callFeeWeiBig).plus(productFeeWeiBig);
        return maxFee;
      });
    } catch (e) {
      maxFee = new WeiBig(0, 'wei');
    }
    return maxFee;
  }

  public async estimatePegoutMaxFee(
    maxPerFlyoverTransaction: WeiBig,
    callEoaOrContractAddress: string,
    btcRecipientAddress: string,
  ): Promise<WeiBig> {
    const valueToTransfer = BigInt(toWeiBigIntString(maxPerFlyoverTransaction.toRBTCString()));
    let maxFee = new WeiBig(0, 'wei');
    try {
      const quotes = await this.flyover?.getPegoutQuotes({
        rskRefundAddress: callEoaOrContractAddress,
        to: btcRecipientAddress,
        valueToTransfer,
      }) as PegoutQuote[];
      quotes.forEach((quote: PegoutQuote) => {
        const gasFeeWeiBig = new WeiBig(quote.quote.gasFee ?? 0, 'wei');
        const callFeeWeiBig = new WeiBig(quote.quote.callFee ?? 0, 'wei');
        const productFeeWeiBig = new WeiBig(quote.quote.productFeeAmount ?? 0, 'wei');
        maxFee = gasFeeWeiBig.plus(callFeeWeiBig).plus(productFeeWeiBig);
        return maxFee;
      });
    } catch (e) { maxFee = new WeiBig(0, 'wei'); }
    return maxFee;
  }

  public estimateRecommendedPegin(amount: SatoshiBig, rootstockRecipientAddress: string)
  : Promise<SatoshiBig> {
    return new Promise<SatoshiBig>((resolve, reject) => {
      this.flyover?.estimateRecommendedPegin(amount.toWeiBigIntUnsafe(), {
        destinationAddress: rootstockRecipientAddress,
        data: '',
      })
        .then((recommendedOperation) => {
          resolve(SatoshiBig.fromWeiBig(new WeiBig(recommendedOperation.recommendedQuoteValue, 'wei')));
        })
        .catch((error: Error) => {
          reject(new ServiceError(
            'FlyoverService',
            'estimateRecommendedPegin',
            'There was an error estimating the recommended peg-in transaction',
            error.message,
          ));
        });
    });
  }

  public estimateRecommendedPegout(amount: WeiBig, btcRecipientAddress: string)
  : Promise<WeiBig> {
    return new Promise<WeiBig>((resolve, reject) => {
      const destinationAddressType = getBtcAddressType(btcRecipientAddress);
      this.flyover?.estimateRecommendedPegout(amount.toWeiBigIntUnsafe(), {
        destinationAddressType,
      })
        .then((recommendedOperation) => {
          resolve(new WeiBig(recommendedOperation.recommendedQuoteValue, 'wei'));
        })
        .catch((error: Error) => {
          reject(new ServiceError(
            'FlyoverService',
            'estimateRecommendedPegout',
            'There was an error estimating the recommended peg-out transaction',
            error.message,
          ));
        });
    });
  }
}
