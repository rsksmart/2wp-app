import { NormalizedOutput } from '../../../src/types';
import { areValidOutputs, isValidPowPegOutput } from '../../../src/utils';
import * as constants from '../../../src/store/constants';
import { EnvironmentAccessorService } from '../../../src/services/enviroment-accessor.service';

const defaultEnvironmentVariables = {
  vueAppCoin: constants.BTC_NETWORK_TESTNET,
};
EnvironmentAccessorService.initializeEnvironmentVariables(defaultEnvironmentVariables);

describe('function: isValidPowPegOutput', () => {
  it('outputs empty', async () => {
    const result = isValidPowPegOutput([], 'rskAddress', '5');
    expect(result).toBe(false);
  });
  it('Output does not contains powpeg address', async () => {
    const normalizedOutput: NormalizedOutput = {
      amount: '1',
      address: 'address1',
    };
    const result = isValidPowPegOutput([normalizedOutput], 'address2', '1');
    expect(result).toBe(false);
  });
  it('Output does not contains any address ', async () => {
    const normalizedOutput: NormalizedOutput = {
      amount: '1',
    };
    const result = isValidPowPegOutput([normalizedOutput], 'address', '1');
    expect(result).toBe(false);
  });
  it('Output can verify address ', async () => {
    const normalizedOutput: NormalizedOutput = {
      amount: '1',
      address: 'address',
    };
    const result = isValidPowPegOutput([normalizedOutput], 'address', '1');
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
    const result = isValidPowPegOutput([normalizedOutput1, normalizedOutput2], 'address2', '2');
    expect(result).toBe(true);
  });
  it('Output has different amount to federation address', () => {
    const normalizedOutput1: NormalizedOutput = {
      amount: '1',
      address: 'address1',
    };
    const normalizedOutput2: NormalizedOutput = {
      amount: '2',
      address: 'address2',
    };
    const result = isValidPowPegOutput([normalizedOutput1, normalizedOutput2], 'address2', '3');
    expect(result).toBe(false);
  });
  it('Powpeg ', () => {
    const normalizedOutput1: NormalizedOutput = {
      amount: '1',
      address: 'address1',
    };
    const normalizedOutput2: NormalizedOutput = {
      amount: '2',
      address: 'address2',
    };
    const result = isValidPowPegOutput([normalizedOutput1, normalizedOutput2], 'address2', '3');
    expect(result).toBe(false);
  });
});

describe('Function: areValidOutputs', () => {
  const userChangeAddress = 'changeAddress';
  const userRefundAddress = '2MxKEf2su6FGAUfCEAHreGFQvEYrfYNHvL7';
  const recipientAddress = '0x224d0b72bab9342f898c633ef187abff8a96c0fa';
  it('should check the outputs size 2, op_return and federation', () => {
    const normalizedOutput1: NormalizedOutput = {
      amount: '0',
      op_return_data: '52534b5401224d0b72bab9342f898c633ef187abff8a96c0fa02379ad9b7ba73bdc1e29e286e014d4e2e1f6884e3',
    };
    const normalizedOutput2: NormalizedOutput = {
      amount: '2',
      address: 'address2',
    };
    const result = areValidOutputs(
      [normalizedOutput1, normalizedOutput2], 'address2',
      '2', userChangeAddress, recipientAddress, userRefundAddress,
    );
    expect(result.valid).toBe(true);
  });
  it('should check the outputs size 3, op_return, federation and change', () => {
    const normalizedOutput1: NormalizedOutput = {
      amount: '0',
      op_return_data: '52534b5401224d0b72bab9342f898c633ef187abff8a96c0fa02379ad9b7ba73bdc1e29e286e014d4e2e1f6884e3',
    };
    const normalizedOutput2: NormalizedOutput = {
      amount: '2',
      address: 'address2',
    };
    const normalizedOutput3: NormalizedOutput = {
      amount: '10',
      address: userChangeAddress,
    };
    const result = areValidOutputs(
      [normalizedOutput1, normalizedOutput2, normalizedOutput3],
      'address2', '2', userChangeAddress, recipientAddress, userRefundAddress,
    );
    expect(result.valid).toBe(true);
  });
  it('should check the outputs size > 3', () => {
    const normalizedOutput1: NormalizedOutput = {
      amount: '0',
      op_return_data: '52534b5401224d0b72bab9342f898c633ef187abff8a96c0fa01ccc198c15d8344c73da67a75509a85a8f4226636',
    };
    const normalizedOutput2: NormalizedOutput = {
      amount: '2',
      address: 'address2',
    };
    const normalizedOutput3: NormalizedOutput = {
      amount: '5',
      address: userChangeAddress,
    };
    const normalizedOutput4: NormalizedOutput = {
      amount: '5',
      address: 'attackerAddress',
    };
    const result = areValidOutputs(
      [normalizedOutput1, normalizedOutput2, normalizedOutput3, normalizedOutput4],
      'address2', '2', userChangeAddress, recipientAddress, userRefundAddress,
    );
    expect(result.valid).toBe(false);
  });
  it('should check the outputs size < 2', () => {
    const normalizedOutput2: NormalizedOutput = {
      amount: '2',
      address: 'address2',
    };
    const result = areValidOutputs([normalizedOutput2], 'address2', '2', userChangeAddress, recipientAddress, userRefundAddress);
    expect(result.valid).toBe(false);
  });
  it('should check duplicated federation output', () => {
    const normalizedOutput1: NormalizedOutput = {
      amount: '0',
      op_return_data: '52534b5401224d0b72bab9342f898c633ef187abff8a96c0fa01ccc198c15d8344c73da67a75509a85a8f4226636',
    };
    const normalizedOutput2: NormalizedOutput = {
      amount: '2',
      address: 'address2',
    };
    const normalizedOutput3: NormalizedOutput = {
      amount: '3',
      address: 'address2',
    };
    const result = areValidOutputs(
      [normalizedOutput1, normalizedOutput2, normalizedOutput3],
      'address2', '2', userChangeAddress, recipientAddress, userRefundAddress,
    );
    expect(result.valid).toBe(false);
  });
  it('should check duplicated op_return output', () => {
    const normalizedOutput1: NormalizedOutput = {
      amount: '0',
      op_return_data: '52534b5401224d0b72bab9342f898c633ef187abff8a96c0fa02379ad9b7ba73bdc1e29e286e014d4e2e1f6884e3',
    };
    const normalizedOutput2: NormalizedOutput = {
      amount: '2',
      address: 'address2',
    };
    const normalizedOutput3: NormalizedOutput = {
      amount: '0',
      op_return_data: '52534b5401224d0b72bab9342f898c633ef187abff8a96c0fa02379ad9b7ba73bdc1e29e286e014d4e2e1f6884e5',
    };
    const result = areValidOutputs([normalizedOutput1, normalizedOutput2, normalizedOutput3],
      'address2', '2', userChangeAddress, recipientAddress, userRefundAddress);
    expect(result.valid).toBe(false);
  });
});
