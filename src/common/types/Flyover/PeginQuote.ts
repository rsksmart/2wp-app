import { Quote } from '@rsksmart/flyover-sdk';
import { PeginQuoteDTO2WP, QuotePegIn2WP } from './Flyover';
import SatoshiBig from '../SatoshiBig';
import WeiBig from '../WeiBig';

export default class PeginQuote implements QuotePegIn2WP {
    quote: PeginQuoteDTO2WP;

    quoteHash: string;

    constructor({ quote, quoteHash }: Quote) {
      this.quote = {
        ...quote,
        timeForDepositInSeconds: quote.timeForDeposit,
        callFee: SatoshiBig.fromWeiBig(new WeiBig(quote.callFee ?? 0, 'wei')),
        gasFee: new WeiBig(quote.gasFee ?? 0, 'wei'),
        penaltyFee: new WeiBig(quote.penaltyFee ?? 0, 'wei'),
        productFeeAmount: SatoshiBig.fromWeiBig(new WeiBig(quote.productFeeAmount ?? 0, 'wei')),
        value: SatoshiBig.fromWeiBig(new WeiBig(quote.value ?? 0, 'wei')),
      };
      this.quoteHash = quoteHash;
    }

    get totalValueToTransfer(): SatoshiBig {
      return this.quote.value
        .plus(this.providerFee);
    }

    get providerFee(): SatoshiBig {
      return this.quote.productFeeAmount
        .plus(this.quote.callFee)
        .plus(SatoshiBig.fromWeiBig(this.quote.gasFee));
    }
}
