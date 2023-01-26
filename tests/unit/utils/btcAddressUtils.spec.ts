import { getBtcAddressFromSignedMessage } from '@/utils';
import * as constants from '../../../src/store/constants';
import { EnvironmentAccessorService } from '../../../src/services/enviroment-accessor.service';

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
        signedMessage: '0x0c230d87d3b9984a10c8fa5c1e92af714611e50179fc98b5cc0e049627e94f8d5b0063130be5de459b06a7aa411b6ee269ce99adb0dc1a452cbeb9bd9adabe8c1c',
        hash: '0x34e02cc3794b82c385e42d862f4fc6316713c7d7ce6c61f305756e5c2c2f4581',
        expectedAddress: 'mmxoT8iqydZQCG4W38hdFzwhhX2U9qhaBE',
      },
      {
        signedMessage: '0x93f634d96497e5cfcc8223b0697ddf7a9dd1172872f071b6da25d4fe5069aede54cc8f5a06dbb042cfbfb657030e2feeff6cf254a855862ffe726fd8accf367a1b',
        hash: '0x34e02cc3794b82c385e42d862f4fc6316713c7d7ce6c61f305756e5c2c2f4581',
        expectedAddress: 'mkuevb83g6J1BnvS7m9J2KqKgmyKHdyDZY',
      },
    ];
    tests.forEach((test) => {
      const address = getBtcAddressFromSignedMessage(test.signedMessage, test.hash);
      return expect(address).toEqual(test.expectedAddress);
    });
  });
});
