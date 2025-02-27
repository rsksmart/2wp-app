import sinon from 'sinon';
import LeatherService from '@/common/services/LeatherService';
import * as constants from '@/common/store/constants';
import { LeatherProvider } from '@leather.io/rpc';
import { UserSession } from '@stacks/connect';
import { BtcAccount } from '@/common/types';

describe('LeatherService', () => {
  let leatherService: LeatherService;
  let userSessionStub: sinon.SinonStubbedInstance<UserSession>;

  beforeEach(() => {
    userSessionStub = sinon.createStubInstance(UserSession);
    leatherService = new LeatherService();
    leatherService.userSession = userSessionStub as unknown as UserSession;
  });

  afterEach(() => {
    sinon.restore();
  });

  it('should return the correct wallet name', () => {
    expect(leatherService.name()).toEqual(constants.WALLET_NAMES.LEATHER);
  });

  it('should return available accounts', () => {
    const accounts = leatherService.availableAccounts();
    expect(accounts).toEqual([BtcAccount.BITCOIN_NATIVE_SEGWIT_ADDRESS]);
  });

  it('should check if user is connected', async () => {
    userSessionStub.isUserSignedIn.returns(true);
    const isConnected = await leatherService.isConnected();
    expect(isConnected).toBeTruthy();
  });

  it('should get account addresses', async () => {
    const addressesResponse = {
      result: {
        addresses: [
          {
            address: 'test-address',
            derivationPath: 'm/84\'/0\'/0\'/0/0',
            publicKey: 'test-public-key',
          },
        ],
      },
    };
    const stubProvider = {
      request: sinon.stub().resolves(addressesResponse),
    };
    // eslint-disable-next-line dot-notation
    leatherService['btcProvider'] = stubProvider as unknown as typeof LeatherProvider;

    const addresses = await leatherService.getAccountAddresses();
    expect(addresses).toEqual([
      {
        address: 'test-address',
        derivationPath: 'm/84\'/0\'/0\'/0/0',
        publicKey: 'test-public-key',
      },
    ]);
    expect(stubProvider.request.calledOnceWith('getAddresses')).toBeTruthy();
  });
});
