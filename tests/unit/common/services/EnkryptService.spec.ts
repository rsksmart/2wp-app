/* eslint-disable @typescript-eslint/no-explicit-any */
import sinon from 'sinon';
import * as constants from '@/common/store/constants';
import { EnvironmentAccessorService } from '@/common/services/enviroment-accessor.service';
import { EnkryptService, WalletService } from '@/common/services';
import { BtcAccount } from '@/common/types';

function setEnvironment() {
  const defaultEnvironmentVariables = {
    vueAppCoin: constants.BTC_NETWORK_TESTNET,
    vueAppRskNodeHost: '',
    vueAppApiBaseUrl: 'https://2wp-api.testnet.rsk.co',
  };
  EnvironmentAccessorService.initializeEnvironmentVariables(defaultEnvironmentVariables);
}
describe('Enkrypt Service: ', () => {
  let mockBitcoinProvider: any;
  let enkryptService: EnkryptService;

  beforeEach(() => {
    setEnvironment();
    mockBitcoinProvider = {
      switchNetwork: jest.fn(),
      getAccounts: jest.fn().mockResolvedValue(['testAddress']),
      isConnected: jest.fn().mockResolvedValue(true),
      signPsbt: jest.fn().mockResolvedValue('70736274ff0100960200000001617bfa33c63e4d6c1dff9f90b116371b298a8f08084802a85bb5db956e8c96a60000000000ffffffff0300000000000000001b6a1952534b5401cd3fb9fdd6035e3da5a997efe5b3d895cbc39ed120a107000000000017a9143b004aa2b568c97f80ccccc5130226d0e98bd588872246010000000000160014dfc8d4318aea9a5a945be8e2eba3cafb94fe2569000000000001011fc027090000000000160014dfc8d4318aea9a5a945be8e2eba3cafb94fe2569220203ad6e44f7982ddcd5626539da854a1337b85be787248d42f9d7a638991464494d47304402205d735b7c295fd0d200c2824b504dc71dd54a45f9e2c43a782b3f67e8b759f48402207937eabfd56d9d177e3dd187ebd3e219eb7c44758f9a05cddd46d35d01e712be0100000000'),
    };
    (window as any).enkrypt = {
      providers: {
        bitcoin: mockBitcoinProvider,
      },
    };
    enkryptService = new EnkryptService();
  });
  afterEach(() => {
    jest.restoreAllMocks();
    sinon.restore();
  });
  it('should create a EnkryptService instance', () => {
    expect(enkryptService).toBeInstanceOf(WalletService);
    expect(enkryptService).toBeInstanceOf(EnkryptService);
    expect(mockBitcoinProvider.switchNetwork).toHaveBeenCalledWith('testnet');
  });
  it('should return the wallet name', () => {
    expect(enkryptService.name()).toEqual(constants.WALLET_NAMES.ENKRYPT);
  });
  it('should return native segwit as available accounts', () => {
    expect(enkryptService.availableAccounts()[0]).toEqual(constants.BITCOIN_NATIVE_SEGWIT_ADDRESS);
  });
  it('should return a single wallet address', () => {
    enkryptService.getAccountAddresses().then((addresses) => {
      expect(addresses.length).toBe(1);
      expect(addresses[0].address).toBe('testAddress');
    });
  });
  it('should return an error when getXpub is called', () => {
    enkryptService.getXpub(BtcAccount.BITCOIN_NATIVE_SEGWIT_ADDRESS, 0).catch((e) => {
      expect(e).toBeInstanceOf(Error);
    });
  });
  it('should return a boolean if there are enough unused addresses', () => {
    expect(enkryptService.areEnoughUnusedAddresses()).toBe(false);
    expect(enkryptService.areEnoughUnusedAddresses()).toBe(true);
  });
  it('should return native segwit as available accounts', () => {
    expect(enkryptService.availableAccounts()[0]).toEqual(constants.BITCOIN_NATIVE_SEGWIT_ADDRESS);
  });
  it('should return true if enkrypt is connected', () => {
    enkryptService.isConnected().then((isConnected) => {
      expect(isConnected).toBe(true);
    });
  });
  it('should return a sign psbt', () => {
    const tx = {
      coin: 'test',
      inputs: [
        {
          address: 'tb1qmlydgvv2a2d949zmar3whg72lw20uftftg4vr8',
          idx: 0,
        },
      ],
      outputs: [
        {
          amount: '0',
          op_return_data: '52534b5401cd3Fb9fdd6035E3dA5A997EfE5b3D895CbC39ed1',
        },
        {
          address: '2MxdCCrmUaEG1Tk8dshdcTGKiA9LewNDVCb',
          amount: '500000',
        },
        {
          address: 'tb1qmlydgvv2a2d949zmar3whg72lw20uftftg4vr8',
          amount: '83490',
        },
      ],
      hex: '70736274ff0100960200000001617bfa33c63e4d6c1dff9f90b116371b298a8f08084802a85bb5db956e8c96a60000000000ffffffff0300000000000000001b6a1952534b5401cd3fb9fdd6035e3da5a997efe5b3d895cbc39ed120a107000000000017a9143b004aa2b568c97f80ccccc5130226d0e98bd588872246010000000000160014dfc8d4318aea9a5a945be8e2eba3cafb94fe2569000000000001011fc027090000000000160014dfc8d4318aea9a5a945be8e2eba3cafb94fe256900000000',
    };
    enkryptService.sign(tx).then((res) => {
      expect(res.signedTx).toEqual('02000000000101617bfa33c63e4d6c1dff9f90b116371b298a8f08084802a85bb5db956e8c96a60000000000ffffffff0300000000000000001b6a1952534b5401cd3fb9fdd6035e3da5a997efe5b3d895cbc39ed120a107000000000017a9143b004aa2b568c97f80ccccc5130226d0e98bd588872246010000000000160014dfc8d4318aea9a5a945be8e2eba3cafb94fe25690247304402205d735b7c295fd0d200c2824b504dc71dd54a45f9e2c43a782b3f67e8b759f48402207937eabfd56d9d177e3dd187ebd3e219eb7c44758f9a05cddd46d35d01e712be012103ad6e44f7982ddcd5626539da854a1337b85be787248d42f9d7a638991464494d00000000');
    });
  });
});
