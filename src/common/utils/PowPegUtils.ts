import { NormalizedInput, NormalizedOutput } from '@/common/types';
import { isValidOpReturnOutput } from '@/common/utils/OpReturnUtils';
import * as bitcoin from 'bitcoinjs-lib';
import { EnvironmentAccessorService } from '@/common/services/enviroment-accessor.service';
import * as constants from '@/common/store/constants';

export function isValidPowPegOutput(
  output: NormalizedOutput,
  powPegAddress: string,
  amountToTransfer: string,
): boolean {
  return !!(
    output.address
    && output.address === powPegAddress
    && output.amount === amountToTransfer
    && !output.op_return_data
  );
}

export function isValidChangeOutput(output: NormalizedOutput, changeAddress: string): boolean {
  return output.address === changeAddress && !output.op_return_data;
}

export function areValidOutputs(
  outputs: NormalizedOutput[],
  powPegAddress: string,
  amountToTransfer: string,
  changeAddress: string,
  destinationRskAddress: string,
  refundBtcAddress: string,
): { valid: boolean; reason: string } {
  const response = {
    valid: false,
    reason: '',
  };
  const size = outputs.length;
  if (size < 2 || size > 3) {
    response.valid = false;
    response.reason = 'Invalid outputs number';
    return response;
  }
  let powPegOutputsCount = 0;
  let opReturnOutputsCount = 0;
  let changeOutputsCount = 0;
  for (let i = 0; outputs && i < outputs.length; i += 1) {
    const output: NormalizedOutput = outputs[i];
    if (isValidPowPegOutput(output, powPegAddress, amountToTransfer)) {
      powPegOutputsCount += 1;
    }
    if (isValidOpReturnOutput(output, destinationRskAddress, refundBtcAddress)) {
      opReturnOutputsCount += 1;
    }
    if (isValidChangeOutput(output, changeAddress)) {
      changeOutputsCount += 1;
    }
  }
  if (powPegOutputsCount === 1 && opReturnOutputsCount === 1) {
    if ((size === 3 && changeOutputsCount === 1) || size === 2) {
      response.valid = true;
    } else {
      response.valid = false;
      response.reason = 'Invalid change address';
    }
  }
  if (powPegOutputsCount !== 1) {
    response.valid = false;
    response.reason = 'Invalid data when comparing Powpeg Address';
  }
  if (opReturnOutputsCount !== 1) {
    response.valid = false;
    response.reason = 'Invalid data when parsing OpReturn';
  }
  return response;
}

export function isValidInput(input:NormalizedInput, userAddressList: string[]): boolean {
  if (input.prevRawTx) {
    const tx = bitcoin.Transaction.fromHex(input.prevRawTx);
    const network = EnvironmentAccessorService
      .getEnvironmentVariables().vueAppCoin === constants.BTC_NETWORK_MAINNET
      ? bitcoin.networks.bitcoin : bitcoin.networks.testnet;
    try {
      const pubKey = Buffer.from(
        tx.outs[input.prev_index].script as unknown as WithImplicitCoercion<ArrayBufferLike>,
        3,
        20,
      );
      const expectedAddress = bitcoin.address.fromOutputScript(pubKey, network);
      return expectedAddress === input.address
        && tx.getId() === input.prev_hash
        && userAddressList.includes(expectedAddress);
    } catch (e) {
      return false;
    }
  }
  return false;
}
