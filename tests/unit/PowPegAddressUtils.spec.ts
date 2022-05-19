import { NormalizedOutput } from '@/types';
import { isValidPowPegAddress } from '@/utils/PowPegAddressUtils';

describe('function: isValidPowPegAddress', () => {
  it('outputs empty', async () => {
    const result = isValidPowPegAddress([], 'rskAddress');
    expect(result).toBe(false);
  });

  it('Output does not contains powpeg address', async () => {
    const normalizedOutput: NormalizedOutput = {
      amount: '1',
      address: 'address1',
    };
    const result = isValidPowPegAddress([normalizedOutput], 'address2');
    expect(result).toBe(false);
  });

  it('Output does not contains any address ', async () => {
    const normalizedOutput: NormalizedOutput = {
      amount: '1',
    };
    const result = isValidPowPegAddress([normalizedOutput], 'address');
    expect(result).toBe(false);
  });

  it('Output can verify address ', async () => {
    const normalizedOutput: NormalizedOutput = {
      amount: '1',
      address: 'address',
    };
    const result = isValidPowPegAddress([normalizedOutput], 'address');
    expect(result).toBe(true);
  });

  it('Output can verify address but it is not the first output ', async () => {
    const normalizedOutput1: NormalizedOutput = {
      amount: '1',
      address: 'address1',
    };
    const normalizedOutput2: NormalizedOutput = {
      amount: '2',
      address: 'address2',
    };
    const result = isValidPowPegAddress([normalizedOutput1, normalizedOutput2], 'address2');
    expect(result).toBe(true);
  });
});
