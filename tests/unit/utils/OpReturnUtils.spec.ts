import { isValidOpReturnOutput } from '@/utils/OpReturnUtils';
import { NormalizedOutput } from '@/types';
import * as constants from '@/store/constants';
import { EnvironmentAccessorService } from '@/services/enviroment-accessor.service';

const initEnvironment = () => {
  const defaultEnvironmentVariables = {
    vueAppCoin: constants.BTC_NETWORK_TESTNET,
  };
  EnvironmentAccessorService.initializeEnvironmentVariables(defaultEnvironmentVariables);
};
describe('function: isValidOptReturn', () => {
  beforeEach(initEnvironment);

  it('destinationAddress empty', async () => {
    const opReturn = '52534b5401224d0b72bab9342f898c633ef187abff8a96c0fa014a74c48b9e3a5644adb734ab536cab6ae28e85ce';
    const normalizedOutput: NormalizedOutput = {
      amount: '0',
      op_return_data: opReturn,
    };
    const result = isValidOpReturnOutput(normalizedOutput, '', 'mzBc4XEFSdzCDcTxAgf6EZXgsZWpztRhef');
    expect(result).toBe(false);
  });

  it('wrong value for RSK destination address', async () => {
    const opReturn = '52534b5401224d0b72bab9342f898c633ef187abccccccc0fa01ccc198c15d8344c73da67a75509a85a8f4226636';
    const normalizedOutput: NormalizedOutput = {
      amount: '0',
      op_return_data: opReturn,
    };
    const result = isValidOpReturnOutput(normalizedOutput, '0x224d0b72bab9342f898c633ef187abff8a96c0fa', 'mzBc4XEFSdzCDcTxAgf6EZXgsZWpztRhef');
    expect(result).toBe(false);
  });

  it('opReturn wrong length', async () => {
    const opReturn = '52534b5401224d0b72bab9342f898c633ef187abff8a96c0fa014a74c48b9e3a5644adb734ab536cab6ae28e8';
    const normalizedOutput: NormalizedOutput = {
      amount: '0',
      op_return_data: opReturn,
    };
    const result = isValidOpReturnOutput(normalizedOutput, '', '');
    expect(result).toBe(false);
  });

  it('opReturn dont have RSK value', async () => {
    const opReturn = '52111b5401224d0b72bab9342f898c633ef187abff8a96c0fa014a74c48b9e3a5644adb734ab536cab6ae28e85ce';
    const normalizedOutput: NormalizedOutput = {
      amount: '0',
      op_return_data: opReturn,
    };
    const result = isValidOpReturnOutput(normalizedOutput, '', '');
    expect(result).toBe(false);
  });

  it('opReturn can parse destination Address but not refund address', async () => {
    const opReturn = '52534b5401224d0b72bab9342f898c633ef187abff8a96c0fa014a74c48b9e3a5644adb734ab536cab6ae28e85ce';
    const normalizedOutput: NormalizedOutput = {
      amount: '0',
      op_return_data: opReturn,
    };
    const result = isValidOpReturnOutput(normalizedOutput, '0x224d0b72bab9342f898c633ef187abff8a96c0fa', '');
    expect(result).toBe(false);
  });

  it('opReturn can parse P2PKH', async () => {
    const opReturn = '52534b5401224d0b72bab9342f898c633ef187abff8a96c0fa01ccc198c15d8344c73da67a75509a85a8f4226636';
    const normalizedOutput: NormalizedOutput = {
      amount: '0',
      op_return_data: opReturn,
    };
    const result = isValidOpReturnOutput(normalizedOutput, '0x224d0b72bab9342f898c633ef187abff8a96c0fa', 'mzBc4XEFSdzCDcTxAgf6EZXgsZWpztRhef');
    expect(result).toBe(true);
  });

  it('opReturn can parse P2SH', async () => {
    const opReturn = '52534b5401224d0b72bab9342f898c633ef187abff8a96c0fa02379ad9b7ba73bdc1e29e286e014d4e2e1f6884e3';
    const normalizedOutput: NormalizedOutput = {
      amount: '0',
      op_return_data: opReturn,
    };
    const result = isValidOpReturnOutput(normalizedOutput, '0x224d0b72bab9342f898c633ef187abff8a96c0fa', '2MxKEf2su6FGAUfCEAHreGFQvEYrfYNHvL7');
    expect(result).toBe(true);
  });

  it('opReturn wrong type of refund address', async () => {
    const opReturn = '52534b5401224d0b72bab9342f898c633ef187abff8a96c0fa04379ad9b7ba73bdc1e29e286e014d4e2e1f6884e3';
    const normalizedOutput: NormalizedOutput = {
      amount: '0',
      op_return_data: opReturn,
    };
    const result = isValidOpReturnOutput(normalizedOutput, '0x224d0b72bab9342f898c633ef187abff8a96c0fa', '2MxKEf2su6FGAUfCEAHreGFQvEYrfYNHvL7');
    expect(result).toBe(false);
  });
  it('opReturn without refund address', async () => {
    const opReturn = '52534b5401224d0b72bab9342f898c633ef187abff8a96c0fa';
    const normalizedOutput: NormalizedOutput = {
      amount: '0',
      op_return_data: opReturn,
    };
    const result = isValidOpReturnOutput(normalizedOutput, '0x224d0b72bab9342f898c633ef187abff8a96c0fa', '');
    expect(result).toBeTruthy();
  });
  it('output with address field set', async () => {
    const opReturn = '52534b5401224d0b72bab9342f898c633ef187abff8a96c0fa';
    const normalizedOutput: NormalizedOutput = {
      amount: '0',
      op_return_data: opReturn,
      address: 'mzBc4XEFSdzCDcTxAgf6EZXgsZWpztRhef',
    };
    const result = isValidOpReturnOutput(normalizedOutput, '0x224d0b72bab9342f898c633ef187abff8a96c0fa', '');
    expect(result).toBe(false);
  });
});
