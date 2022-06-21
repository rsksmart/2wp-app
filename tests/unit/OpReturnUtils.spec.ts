import { isValidOpReturn } from '@/utils/OpReturnUtils';
import { NormalizedOutput } from '@/types';
import * as constants from '@/store/constants';
import { EnvironmentAccessorService } from '@/services/enviroment-accessor.service';

describe('function: isValidOptReturn', () => {
  beforeEach(() => {
    const defaultEnvironmentVariables = {
      vueAppCoin: constants.BTC_NETWORK_TESTNET,
    };
    EnvironmentAccessorService.initializeEnvironmentVariables(defaultEnvironmentVariables);
  });
  it('opReturn empty', async () => {
    const result = isValidOpReturn([], 'destinationAddress', 'refundAddress');
    expect(result).toBe(false);
  });

  it('destinationAddress empty', async () => {
    const opReturn = '52534b5401224d0b72bab9342f898c633ef187abff8a96c0fa014a74c48b9e3a5644adb734ab536cab6ae28e85ce';
    const normalizedOutput: NormalizedOutput = {
      amount: '0',
      op_return_data: opReturn,
    };
    const result = isValidOpReturn([normalizedOutput], '', 'mzBc4XEFSdzCDcTxAgf6EZXgsZWpztRhef');
    expect(result).toBe(false);
  });

  it('opReturn is not the first one value in the array', () => {
    const opReturn = '52534b5401224d0b72bab9342f898c633ef187abff8a96c0fa01ccc198c15d8344c73da67a75509a85a8f4226636';
    const normalizedOutput: NormalizedOutput = {
      amount: '0',
      op_return_data: opReturn,
    };
    const normalizedOutputNoOpReturn: NormalizedOutput = {
      amount: '1',
      op_return_data: undefined,
    };
    const result = isValidOpReturn([normalizedOutput, normalizedOutputNoOpReturn], '0x224d0b72bab9342f898c633ef187abff8a96c0fa', 'mzBc4XEFSdzCDcTxAgf6EZXgsZWpztRhef');
    expect(result).toBe(true);
  });

  it('wrong value for RSK destination address', async () => {
    const opReturn = '52534b5401224d0b72bab9342f898c633ef187abccccccc0fa01ccc198c15d8344c73da67a75509a85a8f4226636';
    const normalizedOutput: NormalizedOutput = {
      amount: '0',
      op_return_data: opReturn,
    };
    const result = isValidOpReturn([normalizedOutput], '0x224d0b72bab9342f898c633ef187abff8a96c0fa', 'mzBc4XEFSdzCDcTxAgf6EZXgsZWpztRhef');
    expect(result).toBe(false);
  });

  it('opReturn wrong length', async () => {
    const opReturn = '52534b5401224d0b72bab9342f898c633ef187abff8a96c0fa014a74c48b9e3a5644adb734ab536cab6ae28e8';
    const normalizedOutput: NormalizedOutput = {
      amount: '0',
      op_return_data: opReturn,
    };
    const result = isValidOpReturn([normalizedOutput], '', '');
    expect(result).toBe(false);
  });

  it('opReturn dont have RSK value', async () => {
    const opReturn = '52111b5401224d0b72bab9342f898c633ef187abff8a96c0fa014a74c48b9e3a5644adb734ab536cab6ae28e85ce';
    const normalizedOutput: NormalizedOutput = {
      amount: '0',
      op_return_data: opReturn,
    };
    const result = isValidOpReturn([normalizedOutput], '', '');
    expect(result).toBe(false);
  });

  it('opReturn can parse destination Address but not refund address', async () => {
    const opReturn = '52534b5401224d0b72bab9342f898c633ef187abff8a96c0fa014a74c48b9e3a5644adb734ab536cab6ae28e85ce';
    const normalizedOutput: NormalizedOutput = {
      amount: '0',
      op_return_data: opReturn,
    };
    const result = isValidOpReturn([normalizedOutput], '0x224d0b72bab9342f898c633ef187abff8a96c0fa', '');
    expect(result).toBe(false);
  });

  it('opReturn can parse P2PKH', async () => {
    const opReturn = '52534b5401224d0b72bab9342f898c633ef187abff8a96c0fa01ccc198c15d8344c73da67a75509a85a8f4226636';
    const normalizedOutput: NormalizedOutput = {
      amount: '0',
      op_return_data: opReturn,
    };
    const result = isValidOpReturn([normalizedOutput], '0x224d0b72bab9342f898c633ef187abff8a96c0fa', 'mzBc4XEFSdzCDcTxAgf6EZXgsZWpztRhef');
    expect(result).toBe(true);
  });

  it('opReturn can parse P2SH', async () => {
    const opReturn = '52534b5401224d0b72bab9342f898c633ef187abff8a96c0fa02379ad9b7ba73bdc1e29e286e014d4e2e1f6884e3';
    const normalizedOutput: NormalizedOutput = {
      amount: '0',
      op_return_data: opReturn,
    };
    const result = isValidOpReturn([normalizedOutput], '0x224d0b72bab9342f898c633ef187abff8a96c0fa', '2MxKEf2su6FGAUfCEAHreGFQvEYrfYNHvL7');
    expect(result).toBe(true);
  });

  it('opReturn wrong type of refund address', async () => {
    const opReturn = '52534b5401224d0b72bab9342f898c633ef187abff8a96c0fa04379ad9b7ba73bdc1e29e286e014d4e2e1f6884e3';
    const normalizedOutput: NormalizedOutput = {
      amount: '0',
      op_return_data: opReturn,
    };
    const result = isValidOpReturn([normalizedOutput], '0x224d0b72bab9342f898c633ef187abff8a96c0fa', '2MxKEf2su6FGAUfCEAHreGFQvEYrfYNHvL7');
    expect(result).toBe(false);
  });
});
