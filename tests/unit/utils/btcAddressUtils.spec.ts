import { getBtcAddressFromSignedMessage } from '@/common/utils';
import * as constants from '../../../src/common/store/constants';
import { EnvironmentAccessorService } from '../../../src/common/services/enviroment-accessor.service';

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
