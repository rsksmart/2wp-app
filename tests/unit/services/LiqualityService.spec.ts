import { expect } from 'chai';
import sinon from 'sinon';
import { EnvironmentAccessorService } from '@/services/enviroment-accessor.service';
import * as constants from '@/store/constants';
import { LiqualityService, WalletService } from '@/services';
import {
  LiqualityAddress,
  LiqualityMethods,
  LiqualityRequestArgs,
  LiqualityResponse,
} from '@/types';
import { mockedData } from '../../utils/mockedData';
import MockedBtcProvider from '../../utils/MockedBtcProvider';

const initEnvironment = () => {
  const defaultEnvironmentVariables = {
    vueAppCoin: constants.BTC_NETWORK_TESTNET,
    vueAppManifestAppUrl: '',
    vueAppManifestEmail: '',
    vueAppWalletMaxCallLiquality: 1,
    vueAppWalletAddressesPerCallLiquality: 1,
  };
  EnvironmentAccessorService.initializeEnvironmentVariables(defaultEnvironmentVariables);
};
describe('Liquality Service:', () => {
  let request: sinon.SinonStub<[LiqualityRequestArgs], Promise<LiqualityResponse>>;
  let enable: sinon.SinonStub<[], Promise<LiqualityAddress[]>>;
  let checkApp: sinon.SinonStub<[], Promise<void>>;
  let mockedBitcoinProvider: sinon.SinonStubbedInstance<MockedBtcProvider>;
  beforeEach(initEnvironment);
  it('should create a LiqualityService instance', () => {
    const liqualityService = new LiqualityService();
    expect(liqualityService).to.be.instanceOf(LiqualityService);
    expect(liqualityService).to.be.instanceOf(WalletService);
  });
  it('should get the same number of requested addresses', () => {
    mockedBitcoinProvider = sinon.createStubInstance(MockedBtcProvider);
    enable = mockedBitcoinProvider.enable;
    checkApp = mockedBitcoinProvider.checkApp;
    request = mockedBitcoinProvider.request;
    const batch = 2;
    const startFrom = 0;
    request.withArgs({
      method: LiqualityMethods.GET_ADDRESS,
      params: [startFrom, batch, true],
    }).resolves(mockedData.addressList
      .filter((addressItem) => addressItem.serializedPath
        .split('/')[4] === '1')
      .slice(startFrom, startFrom + batch)
      .map((addressItem, index) => ({
        address: addressItem.address,
        derivationPath: addressItem.serializedPath,
        publicKey: 'testPublicKey',
        index,
      })));
    request.withArgs({
      method: LiqualityMethods.GET_ADDRESS,
      params: [startFrom, batch, false],
    }).resolves(mockedData.addressList
      .filter((addressItem) => addressItem.serializedPath
        .split('/')[4] === '0')
      .slice(startFrom, startFrom + batch)
      .map((addressItem, index) => ({
        address: addressItem.address,
        derivationPath: addressItem.serializedPath,
        publicKey: 'testPublicKey',
        index,
      })));
    checkApp.resolves();
    enable.resolves();
    const liqualityService = new LiqualityService(mockedBitcoinProvider);
    sinon.stub(LiqualityService.prototype, 'enable' as any).returns(Promise.resolve({}));
    sinon.stub(LiqualityService.prototype, 'checkApp' as any).returns(Promise.resolve({}));

    return liqualityService.getAccountAddresses(batch, startFrom)
      .then((walletAddresses) => {
        expect(walletAddresses.length).to.be.eql(batch * 2);
        // eslint-disable-next-line no-unused-expressions
        expect(mockedBitcoinProvider.enable.notCalled).to.be.true;
        // eslint-disable-next-line no-unused-expressions
        expect(request.calledTwice).to.be.true;
      });
  });
  it('should return exception when Liquality plugin is not installed', () => {
    mockedBitcoinProvider = sinon.createStubInstance(MockedBtcProvider);
    enable = mockedBitcoinProvider.enable;
    request = mockedBitcoinProvider.request;
    const batch = 2;
    const startFrom = 0;
    request.withArgs({
      method: LiqualityMethods.GET_ADDRESS,
      params: [startFrom, batch, true],
    }).resolves(mockedData.addressList
      .filter((addressItem) => addressItem.serializedPath
        .split('/')[4] === '1')
      .slice(startFrom, startFrom + batch)
      .map((addressItem, index) => ({
        address: addressItem.address,
        derivationPath: addressItem.serializedPath,
        publicKey: 'testPublicKey',
        index,
      })));
    request.withArgs({
      method: LiqualityMethods.GET_ADDRESS,
      params: [startFrom, batch, false],
    }).resolves(mockedData.addressList
      .filter((addressItem) => addressItem.serializedPath
        .split('/')[4] === '0')
      .slice(startFrom, startFrom + batch)
      .map((addressItem, index) => ({
        address: addressItem.address,
        derivationPath: addressItem.serializedPath,
        publicKey: 'testPublicKey',
        index,
      })));
    enable.resolves();
    const liqualityService = new LiqualityService(mockedBitcoinProvider);
    return liqualityService.getAccountAddresses(batch, startFrom)
      .then().catch((e) => expect(e.message).to.be.eql('Liquality software wallet is not installed on your browser'));
  });
  it('should return a wallet signed tx', () => {
    mockedBitcoinProvider = sinon.createStubInstance(MockedBtcProvider);
    enable = mockedBitcoinProvider.enable;
    request = mockedBitcoinProvider.request;
    const inputs = mockedData.inputs.map((input) => ({
      index: input.prevIndex,
      derivationPath: input.derivationPath,
    }));
    request.withArgs({
      method: LiqualityMethods.SIGN_PSBT,
      params: [
        mockedData.unsignedPsbtTx,
        inputs,
      ],
    }).resolves(mockedData.signedPsbtTx);
    enable.resolves();
    const liqualityService = new LiqualityService(mockedBitcoinProvider);
    return liqualityService.sign({
      inputs,
      outputs: [],
      coin: constants.BTC_NETWORK_TESTNET,
      base64UnsignedPsbt: mockedData.unsignedPsbtTx,
    })
      .then((signedTx) => expect(signedTx.signedTx).to.be.eql(mockedData.signedTx));
  });
});
