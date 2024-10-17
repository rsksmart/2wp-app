import { PeginQuote, SatoshiBig, WeiBig } from '@/common/types';
import { Quote } from '@rsksmart/flyover-sdk';

describe('PeginQuote', () => {
  let quote: Quote;
  let peginQuote: PeginQuote;

  const quoteValues = {
    fedBTCAddr: '2MxdCCrmUaEG1Tk8dshdcTGKiA9LewNDVCb',
    lbcAddr: '0xc2A630c053D12D63d32b025082f6Ba268db18300',
    lpRSKAddr: '0x7c4890a0f1d4bbf2c669ac2d1effa185c505359b',
    btcRefundAddr: 'mhy7p4F5hn3i1rQCQY3GHXZfMDiUPnJ98S',
    rskRefundAddr: '0xB69d88d37e8788F1e8F86FD26c710Eaa93dE3311',
    lpBTCAddr: 'mvL2bVzGUeC9oqVyQWJ4PxQspFzKgjzAqe',
    callFee: 99996600000000n,
    penaltyFee: 10000000000000n,
    contractAddr: '0xB69d88d37e8788F1e8F86FD26c710Eaa93dE3311',
    data: '',
    gasLimit: 21000,
    nonce: 8494918057086753218n,
    value: 5000000000000000n,
    agreementTimestamp: 1728621792,
    timeForDeposit: 7200,
    lpCallTime: 14400,
    confirmations: 2,
    callOnRegister: false,
    gasFee: 1368444000000n,
    productFeeAmount: 0n,
  };

  beforeEach(() => {
    quote = {
      quote: quoteValues,
      quoteHash: '7a8e40ea9266659b4924946ec5ac681887c16f00996326ad8d65222414e679e8',
    };

    peginQuote = new PeginQuote(quote);
  });

  it('should initialize correctly', () => {
    expect(peginQuote.quoteHash).toEqual('7a8e40ea9266659b4924946ec5ac681887c16f00996326ad8d65222414e679e8');
    expect(peginQuote.quote.callFee.toBTCTrimmedString())
      .toEqual(SatoshiBig.fromWeiBig(new WeiBig(quoteValues.callFee, 'wei')).toBTCTrimmedString());
    expect(peginQuote.quote.gasFee.toRBTCString())
      .toEqual(new WeiBig(quoteValues.gasFee, 'wei').toRBTCString());
    expect(peginQuote.quote.penaltyFee.toRBTCString())
      .toEqual(new WeiBig(quoteValues.penaltyFee, 'wei').toRBTCString());
    expect(peginQuote.quote.productFeeAmount.toBTCTrimmedString())
      .toEqual(SatoshiBig.fromWeiBig(new WeiBig(quoteValues.productFeeAmount, 'wei')).toBTCTrimmedString());
    expect(peginQuote.quote.value.toBTCTrimmedString())
      .toEqual(SatoshiBig.fromWeiBig(new WeiBig(quoteValues.value, 'wei')).toBTCTrimmedString());
  });

  it('should calculate providerFee correctly', () => {
    const expectedProviderFee = SatoshiBig.fromWeiBig(new WeiBig(quoteValues.callFee, 'wei'))
      .plus(SatoshiBig.fromWeiBig(new WeiBig(quoteValues.productFeeAmount, 'wei')))
      .plus(SatoshiBig.fromWeiBig(new WeiBig(quoteValues.gasFee, 'wei')));
    expect(peginQuote.providerFee.toBTCString()).toEqual(expectedProviderFee.toBTCString());
  });

  it('should calculate totalValueToTransfer correctly', () => {
    const expectedTotalValueToTransfer = SatoshiBig.fromWeiBig(new WeiBig(quoteValues.value, 'wei'))
      .plus(peginQuote.providerFee);
    expect(peginQuote.valueToTransfer.toString()).toEqual(expectedTotalValueToTransfer.toString());
  });

  it('should calculate totalQuoteFee correctly', () => {
    const btcNetworkFee = new SatoshiBig(100000000, 'satoshi');
    const expectedTotalQuoteFee = peginQuote.providerFee.plus(btcNetworkFee);
    expect(peginQuote.getTotalQuoteFee(btcNetworkFee).toString()).toEqual(expectedTotalQuoteFee.toString());
  });

  it('should calculate totalTxAmount correctly', () => {
    const btcNetworkFee = new SatoshiBig(100000000, 'satoshi');
    const expectedTotalTxAmount = peginQuote.valueToTransfer.plus(btcNetworkFee);
    expect(peginQuote.getTotalTxAmount(btcNetworkFee).toString()).toEqual(expectedTotalTxAmount.toString());
  });

});
