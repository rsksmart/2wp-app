import { NormalizedOutput } from '@/types';

export function isValidPowPegAddress(outputs: NormalizedOutput[], powPegAddress: string): boolean {
  for (let i = 0; outputs && i < outputs.length; i += 1) {
    const output: NormalizedOutput = outputs[i];
    if (output.address && output.address === powPegAddress && Number(output.amount) > 0) {
      return true;
    }
  }
  return false;
}
