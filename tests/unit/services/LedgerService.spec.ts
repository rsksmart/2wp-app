import sinon from 'sinon';
import TransportWebUSB from '@ledgerhq/hw-transport-webusb';
import Transport from '@ledgerhq/hw-transport';
import * as constants from '@/store/constants';
import { EnvironmentAccessorService } from '@/services/enviroment-accessor.service';
import { LedgerService, WalletService } from '@/services';
import { BtcAccount, LedgerjsTransaction } from '@/types';
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
  afterEach(() => {
    jest.restoreAllMocks();
    sinon.restore();
  });
  it('should create a LedgerService instance', () => {
    const ledgerService = new LedgerService();
    expect(ledgerService).toBeInstanceOf(WalletService);
    expect(ledgerService).toBeInstanceOf(LedgerService);
  });
  it('should get the number of requested addresses based on env variables set', () => {
    const ledgerService = new LedgerService();
    jest.spyOn(ledgerService, 'getXpub')
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      .mockImplementation((accountType: BtcAccount, accountNumber: number) => {
        let xpub = '';
        switch (accountType) {
          case constants.BITCOIN_LEGACY_ADDRESS:
            xpub = mockedData.ledger.xpubValues.p2pkh;
            break;
          case constants.BITCOIN_SEGWIT_ADDRESS:
            xpub = mockedData.ledger.xpubValues.p2sh;
            break;
          case constants.BITCOIN_NATIVE_SEGWIT_ADDRESS:
            xpub = mockedData.ledger.xpubValues.p2wpkh;
            break;
          default:
        }
        return Promise.resolve(xpub);
      });
    ledgerService.getAccountAddresses()
      .then((addresses) => {
        expect(addresses.length).toEqual(30);
      });
  });
  it('should split the serialized tx', () => {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    sinon.stub(TransportWebUSB, 'request').resolves(new Transport());
    LedgerService.splitTransaction(mockedData.ledger.hexTx1)
      .then((splitTx) => {
        expect(splitTx.inputs.length).toEqual(1);
        expect(splitTx.outputs?.length).toEqual(2);
        expect(splitTx.version.toString('hex')).toEqual('01000000');
      });
  });
  it('should split a list of serialized tx', () => {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    sinon.stub(TransportWebUSB, 'request').resolves(new Transport());
    const { hexTx1, hexTx2, hexTx3 } = mockedData.ledger;
    LedgerService.splitTransactionList([hexTx1, hexTx2, hexTx3])
      .then(([splitTx1, splitTx2, splitTx3]) => {
        expect(splitTx1.inputs.length).toEqual(1);
        expect(splitTx1.outputs?.length).toEqual(2);
        expect(splitTx1.version.toString('hex')).toEqual('01000000');
        expect(splitTx2.inputs.length).toEqual(1);
        expect(splitTx2.outputs?.length).toEqual(4);
        expect(splitTx2.version.toString('hex')).toEqual('01000000');
        expect(splitTx3.inputs.length).toEqual(1);
        expect(splitTx3.outputs?.length).toEqual(2);
        expect(splitTx3.version.toString('hex')).toEqual('01000000');
      });
  });
  it('should serialize the outputs of an split tx', () => {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    sinon.stub(TransportWebUSB, 'request').resolves(new Transport());
    LedgerService
      .serializeTransactionOutputs(mockedData.ledger.splitTx1 as LedgerjsTransaction)
      .then((serializedTx) => expect(mockedData.ledger.hexTx1).toContain(serializedTx));
  });
});
