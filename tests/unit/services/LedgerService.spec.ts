import sinon from 'sinon';
import * as constants from '../../../src/store/constants';
import { EnvironmentAccessorService } from '../../../src/services/enviroment-accessor.service';
import { LedgerService, WalletService } from '../../../src/services';
import { BtcAccount } from '../../../src/types';
import { mockedData } from '../../utils/mockedData';

const initEnvironment = () => {
  const defaultEnvironmentVariables = {
    vueAppCoin: constants.BTC_NETWORK_TESTNET,
    vueAppWalletAddressPerCall: 5,
    vueAppWalletAddressHardStop: 100,
  };
  EnvironmentAccessorService.initializeEnvironmentVariables(defaultEnvironmentVariables);
};
describe('Ledger Service: ', () => {
  beforeEach(initEnvironment);
  it('should create a LedgerService instance', () => {
    const ledgerService = new LedgerService();
    expect(ledgerService).toBeInstanceOf(WalletService);
    expect(ledgerService).toBeInstanceOf(LedgerService);
  });
  it('should get the number of requested addresses based on env variables set', () => {
    let getXpub: sinon
      .SinonStub<[{accountType: BtcAccount; accountNumber: number}], Promise<string>>;
    const ledgerService = new LedgerService();
    getXpub.withArgs({
      accountType: constants.BITCOIN_SEGWIT_ADDRESS,
      accountNumber: 0,
    }).resolves()
    ledgerService.getAccountAddresses()
      .then((addresses) => {
        expect(addresses.length).toEqual(10);
      });
  });
  test.todo('should return a wallet signed tx');
  test.todo('should return a wallet signed tx');
  test.todo('should return a wallet signed tx');
  test.todo('should return a wallet signed tx');
  test.todo('should return a wallet signed tx');
});
