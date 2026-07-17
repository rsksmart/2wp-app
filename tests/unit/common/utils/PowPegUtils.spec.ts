import * as bitcoin from 'bitcoinjs-lib';
import { NormalizedInput, NormalizedOutput } from '@/common/types';
import {
  areValidOutputs, isValidInput, isValidPowPegOutput,
} from '@/common/utils';
import * as constants from '@/common/store/constants';
import { EnvironmentAccessorService } from '@/common/services/enviroment-accessor.service';

const defaultEnvironmentVariables = {
  vueAppCoin: constants.BTC_NETWORK_TESTNET,
};
EnvironmentAccessorService.initializeEnvironmentVariables(defaultEnvironmentVariables);

describe('function: isValidPowPegOutput', () => {
  it('Output does not contains powpeg address', async () => {
    const normalizedOutput: NormalizedOutput = {
      amount: '1',
      address: 'address1',
    };
    const result = isValidPowPegOutput(normalizedOutput, 'address2', '1');
    expect(result).toBe(false);
  });
  it('Output does not contains any address ', async () => {
    const normalizedOutput: NormalizedOutput = {
      amount: '1',
    };
    const result = isValidPowPegOutput(normalizedOutput, 'address', '1');
    expect(result).toBe(false);
  });
  it('Output can verify address ', async () => {
    const normalizedOutput: NormalizedOutput = {
      amount: '1',
      address: 'address',
    };
    const result = isValidPowPegOutput(normalizedOutput, 'address', '1');
    expect(result).toBe(true);
  });
  it('Output has different amount to federation address', () => {
    const normalizedOutput2: NormalizedOutput = {
      amount: '2',
      address: 'address2',
    };
    const result = isValidPowPegOutput(normalizedOutput2, 'address2', '3');
    expect(result).toBe(false);
  });
});

describe('Function: areValidOutputs', () => {
  const userChangeAddress = 'changeAddress';
  const userRefundAddress = '2MxKEf2su6FGAUfCEAHreGFQvEYrfYNHvL7';
  const recipientAddress = '0x224d0b72bab9342f898c633ef187abff8a96c0fa';
  const powPegAddress = 'federationAddress';
  it('should check the outputs size 2, op_return and federation', () => {
    const normalizedOutput1: NormalizedOutput = {
      amount: '0',
      op_return_data: '52534b5401224d0b72bab9342f898c633ef187abff8a96c0fa02379ad9b7ba73bdc1e29e286e014d4e2e1f6884e3',
    };
    const normalizedOutput2: NormalizedOutput = {
      amount: '2',
      address: powPegAddress,
    };
    const result = areValidOutputs(
      [normalizedOutput1, normalizedOutput2],
      powPegAddress,
      '2',
      userChangeAddress,
      recipientAddress,
      userRefundAddress,
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
      address: powPegAddress,
    };
    const normalizedOutput3: NormalizedOutput = {
      amount: '10',
      address: userChangeAddress,
    };
    const result = areValidOutputs(
      [normalizedOutput1, normalizedOutput2, normalizedOutput3],
      powPegAddress,

      '2',

      userChangeAddress,

      recipientAddress,

      userRefundAddress,
    );
    expect(result.valid).toBe(true);
  });
  it('should check the outputs size 3, op_return, federation and wrong change', () => {
    const normalizedOutput1: NormalizedOutput = {
      amount: '0',
      op_return_data: '52534b5401224d0b72bab9342f898c633ef187abff8a96c0fa02379ad9b7ba73bdc1e29e286e014d4e2e1f6884e3',
    };
    const normalizedOutput2: NormalizedOutput = {
      amount: '2',
      address: powPegAddress,
    };
    const normalizedOutput3: NormalizedOutput = {
      amount: '10',
      address: 'attackerAddress',
    };
    const result = areValidOutputs(
      [normalizedOutput1, normalizedOutput2, normalizedOutput3],
      powPegAddress,

      '2',

      userChangeAddress,

      recipientAddress,

      userRefundAddress,
    );
    expect(result.valid).toBe(false);
  });
  it('should check the outputs size 3, op_return, federation and change with op_return data (powpeg output)', () => {
    const normalizedOutput1: NormalizedOutput = {
      amount: '0',
      op_return_data: '52534b5401224d0b72bab9342f898c633ef187abff8a96c0fa02379ad9b7ba73bdc1e29e286e014d4e2e1f6884e3',
    };
    const normalizedOutput2: NormalizedOutput = {
      amount: '2',
      address: powPegAddress,
      op_return_data: '52534b5401224d0b72bab9342f898c633ef187abff8a96c0fa02379ad9b7ba73bdc1e29e286e014d4e2e1f6884e3',
    };
    const normalizedOutput3: NormalizedOutput = {
      amount: '10',
      address: userChangeAddress,
    };
    const result = areValidOutputs(
      [normalizedOutput1, normalizedOutput2, normalizedOutput3],
      powPegAddress,

      '2',

      userChangeAddress,

      recipientAddress,

      userRefundAddress,
    );
    expect(result.valid).toBe(false);
  });
  it('should check the outputs size 3, op_return, federation and change with op_return data (change output)', () => {
    const normalizedOutput1: NormalizedOutput = {
      amount: '0',
      op_return_data: '52534b5401224d0b72bab9342f898c633ef187abff8a96c0fa02379ad9b7ba73bdc1e29e286e014d4e2e1f6884e3',
    };
    const normalizedOutput2: NormalizedOutput = {
      amount: '2',
      address: powPegAddress,
    };
    const normalizedOutput3: NormalizedOutput = {
      amount: '10',
      address: userChangeAddress,
      op_return_data: '52534b5401224d0b72bab9342f898c633ef187abff8a96c0fa02379ad9b7ba73bdc1e29e286e014d4e2e1f6884e3',
    };
    const result = areValidOutputs(
      [normalizedOutput1, normalizedOutput2, normalizedOutput3],
      powPegAddress,

      '2',

      userChangeAddress,

      recipientAddress,

      userRefundAddress,
    );
    expect(result.valid).toBe(false);
  });
  it('should check op_return output with amount different than 0', () => {
    const normalizedOutput1: NormalizedOutput = {
      amount: '13',
      op_return_data: '52534b5401224d0b72bab9342f898c633ef187abff8a96c0fa02379ad9b7ba73bdc1e29e286e014d4e2e1f6884e3',
    };
    const normalizedOutput2: NormalizedOutput = {
      amount: '2',
      address: powPegAddress,
    };
    const normalizedOutput3: NormalizedOutput = {
      amount: '10',
      address: userChangeAddress,
    };
    const result = areValidOutputs(
      [normalizedOutput1, normalizedOutput2, normalizedOutput3],
      powPegAddress,

      '2',

      userChangeAddress,

      recipientAddress,

      userRefundAddress,
    );
    expect(result.valid).toBe(false);
  });
  it('should check the outputs size > 3', () => {
    const normalizedOutput1: NormalizedOutput = {
      amount: '0',
      op_return_data: '52534b5401224d0b72bab9342f898c633ef187abff8a96c0fa01ccc198c15d8344c73da67a75509a85a8f4226636',
    };
    const normalizedOutput2: NormalizedOutput = {
      amount: '2',
      address: powPegAddress,
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
      powPegAddress,

      '2',

      userChangeAddress,

      recipientAddress,

      userRefundAddress,
    );
    expect(result.valid).toBe(false);
  });
  it('should check the outputs size < 2', () => {
    const normalizedOutput2: NormalizedOutput = {
      amount: '2',
      address: powPegAddress,
    };
    const result = areValidOutputs([normalizedOutput2], powPegAddress, '2', userChangeAddress, recipientAddress, userRefundAddress);
    expect(result.valid).toBe(false);
  });
  it('should check duplicated federation output', () => {
    const normalizedOutput1: NormalizedOutput = {
      amount: '0',
      op_return_data: '52534b5401224d0b72bab9342f898c633ef187abff8a96c0fa01ccc198c15d8344c73da67a75509a85a8f4226636',
    };
    const normalizedOutput2: NormalizedOutput = {
      amount: '2',
      address: powPegAddress,
    };
    const normalizedOutput3: NormalizedOutput = {
      amount: '3',
      address: 'address2',
    };
    const result = areValidOutputs(
      [normalizedOutput1, normalizedOutput2, normalizedOutput3],
      powPegAddress,

      '2',

      userChangeAddress,

      recipientAddress,

      userRefundAddress,
    );
    expect(result.valid).toBe(false);
  });
  it('should be falsy the validation when two Op_Return are valid', () => {
    const normalizedOutput1: NormalizedOutput = {
      amount: '0',
      op_return_data: '52534b5401224d0b72bab9342f898c633ef187abff8a96c0fa02379ad9b7ba73bdc1e29e286e014d4e2e1f6884e3',
    };
    const normalizedOutput2: NormalizedOutput = {
      amount: '2',
      address: powPegAddress,
    };
    const normalizedOutput3: NormalizedOutput = {
      amount: '0',
      op_return_data: '52534b5401224d0b72bab9342f898c633ef187abff8a96c0fa02379ad9b7ba73bdc1e29e286e014d4e2e1f6884e5',
    };
    const result = areValidOutputs(
      [normalizedOutput1, normalizedOutput2, normalizedOutput3],
      powPegAddress,

      '2',

      userChangeAddress,

      recipientAddress,

      userRefundAddress,
    );
    expect(result.valid).toBe(false);
  });
  it('Should be falsy the validation when one is valid and the other invalid', () => {
    const normalizedOutput1: NormalizedOutput = {
      amount: '0',
      op_return_data: '52534b5401224d0b72bab9342f898c633ef187abff8a96c0fa02379ad9b7ba73bdc1e29e286e014d4e2e1f6884e3',
    };
    const normalizedOutput2: NormalizedOutput = {
      amount: '2',
      address: powPegAddress,
    };
    const normalizedOutput3: NormalizedOutput = {
      amount: '0',
      op_return_data: '52534b5401224d0b72bab9342f898c633ef187abff8a96c0fa02379ad9b7ba73bdc1e29e286e',
    };
    const result = areValidOutputs(
      [normalizedOutput1, normalizedOutput2, normalizedOutput3],
      powPegAddress,

      '2',

      userChangeAddress,

      recipientAddress,

      userRefundAddress,
    );
    expect(result.valid).toBe(false);
  });
  it('Should be falsy the validation when three Op_Return are valid', () => {
    const normalizedOutput1: NormalizedOutput = {
      amount: '0',
      op_return_data: '52534b5401224d0b72bab9342f898c633ef187abff8a96c0fa02379ad9b7ba73bdc1e29e286e014d4e2e1f6884e3',
    };
    const normalizedOutput2: NormalizedOutput = {
      amount: '0',
      op_return_data: '52534b5401224d0b72bab9342f898c633ef187abff8a96c0fa02379ad9b7ba73bdc1e29e286e014d4e2e1f6884e5',
    };
    const normalizedOutput3: NormalizedOutput = {
      amount: '0',
      op_return_data: '52534b5401224d0b72bab9342f898c633ef187abff8a96c0fa02379ad9b7ba73bdc1e29e286e014d4e2e1f6884e5',
    };
    const result = areValidOutputs(
      [normalizedOutput1, normalizedOutput2, normalizedOutput3],
      powPegAddress,

      '2',

      userChangeAddress,

      recipientAddress,

      userRefundAddress,
    );
    expect(result.valid).toBe(false);
  });
});

describe('isValidInput', () => {
  const network = bitcoin.networks.testnet;
  const hash = Buffer.alloc(20, 1);
  const { address, output } = bitcoin.payments.p2pkh({ hash, network });

  function buildPrevRawTx(): string {
    const tx = new bitcoin.Transaction();
    tx.addInput(Buffer.alloc(32), 0);
    tx.addOutput(output as Buffer, 100000);
    return tx.toHex();
  }

  function buildInput(overrides: Partial<NormalizedInput> = {}): NormalizedInput {
    const prevRawTx = buildPrevRawTx();
    const prevTx = bitcoin.Transaction.fromHex(prevRawTx);
    return {
      address: address as string,
      prev_hash: prevTx.getId(),
      amount: '100000',
      prev_index: 0,
      prevRawTx,
      ...overrides,
    };
  }

  it('returns true when the output resolves to an address owned by the user', () => {
    const input = buildInput();
    expect(isValidInput(input, [address as string])).toBe(true);
  });

  it('returns false when the resolved address is not part of the user address list', () => {
    const input = buildInput();
    expect(isValidInput(input, ['some-other-address'])).toBe(false);
  });

  it('returns false when the input address does not match the resolved output address', () => {
    const input = buildInput({ address: 'wrong-address' });
    expect(isValidInput(input, [address as string])).toBe(false);
  });

  it('returns false when prev_hash does not match the raw transaction id', () => {
    const input = buildInput({ prev_hash: '0'.repeat(64) });
    expect(isValidInput(input, [address as string])).toBe(false);
  });

  it('returns false when the referenced output script cannot be decoded to an address', () => {
    const opReturnScript = bitcoin.script.compile([
      bitcoin.opcodes.OP_RETURN,
      Buffer.from('not-an-address'),
    ]);
    const tx = new bitcoin.Transaction();
    tx.addInput(Buffer.alloc(32), 0);
    tx.addOutput(opReturnScript, 0);
    const prevRawTx = tx.toHex();
    const input = buildInput({ prevRawTx, prev_hash: tx.getId() });
    expect(isValidInput(input, [address as string])).toBe(false);
  });

  it('returns false when prevRawTx is not provided', () => {
    const input = buildInput({ prevRawTx: undefined });
    expect(isValidInput(input, [address as string])).toBe(false);
  });
});
