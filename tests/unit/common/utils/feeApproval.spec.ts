import { computeFeeDifferencePercentage, requiresFeeApproval } from '@/common/utils';
import { ReducedQuote, WeiBig } from '@/common/types';

const TOLERANCE = 2;
const VALUE = '50000000000000000';

function reducedQuote(callFee: string, gasFee: string, quoteHash = 'hash'): ReducedQuote {
  return {
    callFee: new WeiBig(callFee, 'wei'),
    gasFee: new WeiBig(gasFee, 'wei'),
    value: new WeiBig(VALUE, 'wei'),
    quoteHash,
  };
}

// Fees of 0.00003 RBTC on a 0.05 RBTC peg-out
const approved = reducedQuote('20000000000000', '10000000000000');
const sameFees = reducedQuote('20000000000000', '10000000000000');
const onePercentLower = reducedQuote('19700000000000', '10000000000000');
const toleranceLower = reducedQuote('19400000000000', '10000000000000');
const oneWeiPastToleranceLower = reducedQuote('19399999999999', '10000000000000');
const oneWeiHigher = reducedQuote('20000000000001', '10000000000000');
// Fees of 0.001 RBTC: the total moves by 1.9%, the fees grow 33 times (+3233.33%)
const reportedFees = reducedQuote('700000000000000', '300000000000000');
const doubledFees = reducedQuote('40000000000000', '20000000000000');

describe('requiresFeeApproval', () => {
  it('lets a final quote with the same fees replace the approved quote', () => {
    expect(requiresFeeApproval(approved, sameFees, TOLERANCE)).toBe(false);
  });

  it('lets a final quote with fees 1% lower replace the approved quote', () => {
    expect(requiresFeeApproval(approved, onePercentLower, TOLERANCE)).toBe(false);
  });

  it('lets a final quote with fees exactly the tolerance lower replace the approved quote', () => {
    expect(requiresFeeApproval(approved, toleranceLower, TOLERANCE)).toBe(false);
  });

  it('asks for approval when the fees drop one wei past the tolerance', () => {
    expect(requiresFeeApproval(approved, oneWeiPastToleranceLower, TOLERANCE)).toBe(true);
  });

  it('asks for approval when the fees rise by one wei', () => {
    expect(requiresFeeApproval(approved, oneWeiHigher, TOLERANCE)).toBe(true);
  });

  it('asks for approval when the fees rise but the total moves less than the tolerance', () => {
    expect(requiresFeeApproval(approved, reportedFees, TOLERANCE)).toBe(true);
  });
});

describe('computeFeeDifferencePercentage', () => {
  it('is 0 for the same fees', () => {
    expect(computeFeeDifferencePercentage(approved, sameFees)).toBe(0);
  });

  it('is 1 for fees 1% lower', () => {
    expect(computeFeeDifferencePercentage(approved, onePercentLower)).toBe(1);
  });

  it('is exactly the tolerance at the tolerance bound', () => {
    expect(computeFeeDifferencePercentage(approved, toleranceLower)).toBe(TOLERANCE);
  });

  it('is above the tolerance one wei past the bound', () => {
    expect(computeFeeDifferencePercentage(approved, oneWeiPastToleranceLower))
      .toBeGreaterThan(TOLERANCE);
  });

  it('is below the tolerance for a one wei rise', () => {
    expect(computeFeeDifferencePercentage(approved, oneWeiHigher)).toBeLessThan(TOLERANCE);
  });

  it('measures the fees, not the total that includes the amount', () => {
    expect(computeFeeDifferencePercentage(approved, reportedFees)).toBeCloseTo(3233.33, 2);
  });

  it('measures the change against the approved fees, so doubled fees are 100', () => {
    expect(computeFeeDifferencePercentage(approved, doubledFees)).toBe(100);
  });

  it('is 0 when both quotes have no fees', () => {
    expect(computeFeeDifferencePercentage(reducedQuote('0', '0'), reducedQuote('0', '0')))
      .toBe(0);
  });
});
