import { NormalizedOutput } from '@/types';
import { isValidOpReturn } from '@/utils/OpReturnUtils';

export function isValidPowPegOutput(
  outputs: NormalizedOutput[], powPegAddress: string, amountToTransfer: string,
): boolean {
  for (let i = 0; outputs && i < outputs.length; i += 1) {
    const output: NormalizedOutput = outputs[i];
    if (output.address && output.address === powPegAddress && output.amount === amountToTransfer) {
      return true;
    }
  }
  return false;
}

export function areValidOutputs(
  outputs: NormalizedOutput[], powPegAddress: string,
  amountToTransfer: string, changeAddress: string,
  destinationRskAddress: string, refundBtcAddress: string,
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
  if (isValidPowPegOutput(outputs, powPegAddress, amountToTransfer)) {
    if (isValidOpReturn(outputs, destinationRskAddress, refundBtcAddress)) {
      if (size === 3) {
        for (let i = 0; outputs && i < outputs.length; i += 1) {
          const output: NormalizedOutput = outputs[i];
          if (output.address === changeAddress) {
            response.valid = true;
          }
        }
      } else {
        response.valid = true;
      }
    } else {
      response.valid = false;
      response.reason = 'Invalid data when parsing OpReturn';
    }
  } else {
    response.valid = false;
    response.reason = 'Invalid data when comparing Powpeg Address';
  }
  return response;
}
