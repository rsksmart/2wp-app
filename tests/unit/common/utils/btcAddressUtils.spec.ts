import {
  getBtcAddressFromSignedMessage, isFlyoverPegoutAddress, validateAddress,
} from '@/common/utils';
import * as constants from '@/common/store/constants';
import { EnvironmentAccessorService } from '@/common/services/enviroment-accessor.service';

const initEnvironment = () => {
  const defaultEnvironmentVariables = {
    vueAppCoin: constants.BTC_NETWORK_TESTNET,
  };
  EnvironmentAccessorService.initializeEnvironmentVariables(defaultEnvironmentVariables);
};
describe('Btc address Derivation', () => {
  beforeEach(initEnvironment);
  it('derives a valid P2PKH address', () => {
    const tests = [
      {
        signedMessage: '0x594ac0e8e804214c20594d8dde20058ac887d0a1279980b1db320196da604af6584c24583cd6f7e70f0e44b9b0d7936bf9048b39294c29ed9c24efae8ea4bfc41b',
        hash: '0x34e02cc3794b82c385e42d862f4fc6316713c7d7ce6c61f305756e5c2c2f4581',
        expectedAddress: 'mkwhnCRC9H7Zy5iCQg9oB8BeRDGZufKmFn',
      },
      {
        signedMessage: '0x93f634d96497e5cfcc8223b0697ddf7a9dd1172872f071b6da25d4fe5069aede54cc8f5a06dbb042cfbfb657030e2feeff6cf254a855862ffe726fd8accf367a1b',
        hash: '0x34e02cc3794b82c385e42d862f4fc6316713c7d7ce6c61f305756e5c2c2f4581',
        expectedAddress: 'mhiHamqbfTYXuVwyTyVQm9UDiyf3rUaNHp',
      },
    ];
    tests.forEach((test) => {
      const address = getBtcAddressFromSignedMessage(test.signedMessage, test.hash);
      return expect(address).toEqual(test.expectedAddress);
    });
  });
});

describe('isFlyoverPegoutAddress', () => {
  beforeEach(initEnvironment);
  const legacy = 'mjb1e1MpWbPBQYSjJQRicrVipME8om3rfU';

  it('accepts legacy, P2SH and native segwit testnet addresses', () => {
    expect(isFlyoverPegoutAddress(legacy)).toBe(true);
    expect(isFlyoverPegoutAddress('2MxhE499S1BkVoNN3kUbLFjFwAB2eLxZB8y')).toBe(true);
    expect(isFlyoverPegoutAddress('tb1q9jj02kme6p0ye00xmaky75dwxtyepd2cyan5sw')).toBe(true);
  });

  it('rejects a half-typed address that already matches the address pattern', () => {
    const halfTyped = legacy.slice(0, 30);
    expect(validateAddress(halfTyped).valid).toBe(true);
    expect(isFlyoverPegoutAddress(halfTyped)).toBe(false);
  });

  it('rejects an address with a wrong last character', () => {
    expect(isFlyoverPegoutAddress(`${legacy.slice(0, -1)}V`)).toBe(false);
  });

  it('rejects taproot, which Fast Mode does not accept', () => {
    expect(isFlyoverPegoutAddress('tb1pqqqqp399et2xygdj5xreqhjjvcmzhxw4aywxecjdzew6hylgvsesf3hn0c'))
      .toBe(false);
  });

  it('rejects a mainnet address on testnet', () => {
    expect(isFlyoverPegoutAddress('1BvBMSEYstWetqTFn5Au4m4GFg7xJaNVN2')).toBe(false);
  });

  it('rejects an empty address', () => {
    expect(isFlyoverPegoutAddress('')).toBe(false);
  });
});
