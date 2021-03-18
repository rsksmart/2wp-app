import * as constants from '@/store/constants';

export function getAccountType(address: string): string {
  const [legacyTestReg, segwitTestReg, nativeTestReg] = [
    /^[mn][1-9A-HJ-NP-Za-km-z]{26,35}/,
    /^[2][1-9A-HJ-NP-Za-km-z]{26,35}/,
    /^[tb][0-9A-HJ-NP-Za-z]{26,41}/,
  ];
  if (legacyTestReg.test(address)) return constants.BITCOIN_LEGACY_ADDRESS;
  if (segwitTestReg.test(address)) return constants.BITCOIN_SEGWIT_ADDRESS;
  if (nativeTestReg.test(address)) return constants.BITCOIN_NATIVE_SEGWIT_ADDRESS;
  return constants.BITCOIN_MULTISIGNATURE_ADDRESS;
}
