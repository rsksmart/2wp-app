import { EnvironmentAccessorService } from '@/common/services/enviroment-accessor.service';
import * as constants from '@/common/store/constants';
import sinon from 'sinon';
import Wallet from 'sats-connect';
import { WalletService, XverseService } from '@/common/services';

const initEnvironment = () => {
  const defaultEnvironmentVariables = {
    vueAppCoin: constants.BTC_NETWORK_TESTNET,
    vueAppManifestAppUrl: '',
    vueAppManifestEmail: '',
    vueAppWalletAddressPerCall: 5,
    vueAppWalletAddressHardStop: 100,
  };
  EnvironmentAccessorService.initializeEnvironmentVariables(defaultEnvironmentVariables);
};

describe('Xverse Service:', () => {
  // let request: sinon.SinonStub<[XverseRequestArgs], Promise<XverseResponse>>;
  // let mockedXverseProvider: sinon.SinonStubbedInstance<MockedXverseProvider>;

  beforeEach(initEnvironment);
  afterEach(() => sinon.restore());

  it('should create a XverseService instance', () => {
    const xverseService = new XverseService();
    expect(xverseService).toBeInstanceOf(XverseService);
    expect(xverseService).toBeInstanceOf(WalletService);
  });

  it('should return a single address since that is the current amount supported by xverse', () => {
    sinon.stub(Wallet, 'request').resolves({
      status: 'success',
      result: {
        addresses: [
          {
            address: 'testAddress',
            publicKey: 'testPublicKey',
          },
        ],
      },
    });
    const xverseService = new XverseService();
    xverseService.getAccountAddresses().then((addresses) => {
      expect(addresses.length).toBe(1);
      expect(addresses[0].address).toBe('testAddress');
      expect(addresses[0].publicKey).toBe('testPublicKey');
    });
  });

  it('should handle the error case when the wallet are not available', () => {
    sinon.stub(Wallet, 'request').resolves({
      status: 'error',
      error: {
        code: 1,
        message: 'Wallet not available',
      },
    });
    const xverseService = new XverseService();
    expect(xverseService.getAccountAddresses())
      .rejects
      .toThrow('Wallet not available');
  });

  it('should return an error when the psbt are wrong', () => {
    sinon.stub(Wallet, 'request').resolves({
      status: 'success',
      result: {
        psbt: 'cHNidP8BAHECAAAAAW4TCBaK74DxafvrRdWpF32Gg5eVRs1DJX9YHz2v9jduAQAAAAD9',
      },
    });
    const xverseService = new XverseService();
    const xverseTx = {
      coin: 'test',
      inputs: [
        {
          addres: '2Mxv1YkAXpTMcq2at1it9QRfq8bDX82N99J',
          idx: 2,
        },
      ],
      outputs: [
        {
          amount: '0',
          op_return_data: '52534b5401aFf12FA1c482BEab1D70C68fe0Fc5825447A9818',
        },
        {
          address: '2N3JQb9erL1SnAr3NTMrZiPQQ8dcjJp4idV',
          amount: '500000',
        },
        {
          address: '2Mxv1YkAXpTMcq2at1it9QRfq8bDX82N99J',
          amount: '982474',
        },
      ],
      base64UnsignedPsbt: 'cHNidP8BAJcCAAAAAboaf2woNcottY/Ax+9lbYi349++WmdwYZPyOp8nXg5tAgAAAAD/////AwAAAAAAAAAAG2oZUlNLVAGv8S+hxIK+qx1wxo/g/FglRHqYGCChBwAAAAAAF6kUbkta6F2G5NsObl2wn4wnYyjNvz+Hyv0OAAAAAAAXqRQ+Lnd+D2z9GnchcMB/v3/pWn8CfYcAAAAAAAEBIL60FgAAAAAAF6kUPi53fg9s/Rp3IXDAf79/6Vp/An2HAQQWABSmO24c7Zf0uweZC7P9rNOrMR7sqwAAAAA=',
    };
    expect(xverseService.sign(xverseTx))
      .rejects
      .toThrow('Invalid psbt provided');
  });

  it('should return an error when the psbt has some unsigned input', () => {
    sinon.stub(Wallet, 'request').resolves({
      status: 'success',
      result: {
        psbt: 'cHNidP8BAJcCAAAAAboaf2woNcottY/Ax+9lbYi349++WmdwYZPyOp8nXg5tAgAAAAD/////AwAAAAAAAAAAG2oZUlNLVAGv8S+hxIK+qx1wxo/g/FglRHqYGCChBwAAAAAAF6kUbkta6F2G5NsObl2wn4wnYyjNvz+Hyv0OAAAAAAAXqRQ+Lnd+D2z9GnchcMB/v3/pWn8CfYcAAAAAAAEBIL60FgAAAAAAF6kUPi53fg9s/Rp3IXDAf79/6Vp/An2HAQQWABSmO24c7Zf0uweZC7P9rNOrMR7sqwAAAAA=',
      },
    });
    const xverseService = new XverseService();
    const xverseTx = {
      coin: 'test',
      inputs: [
        {
          addres: '2Mxv1YkAXpTMcq2at1it9QRfq8bDX82N99J',
          idx: 2,
        },
      ],
      outputs: [
        {
          amount: '0',
          op_return_data: '52534b5401aFf12FA1c482BEab1D70C68fe0Fc5825447A9818',
        },
        {
          address: '2N3JQb9erL1SnAr3NTMrZiPQQ8dcjJp4idV',
          amount: '500000',
        },
        {
          address: '2Mxv1YkAXpTMcq2at1it9QRfq8bDX82N99J',
          amount: '982474',
        },
      ],
      base64UnsignedPsbt: 'cHNidP8BAJcCAAAAAboaf2woNcottY/Ax+9lbYi349++WmdwYZPyOp8nXg5tAgAAAAD/////AwAAAAAAAAAAG2oZUlNLVAGv8S+hxIK+qx1wxo/g/FglRHqYGCChBwAAAAAAF6kUbkta6F2G5NsObl2wn4wnYyjNvz+Hyv0OAAAAAAAXqRQ+Lnd+D2z9GnchcMB/v3/pWn8CfYcAAAAAAAEBIL60FgAAAAAAF6kUPi53fg9s/Rp3IXDAf79/6Vp/An2HAQQWABSmO24c7Zf0uweZC7P9rNOrMR7sqwAAAAA=',
    };
    expect(xverseService.sign(xverseTx))
      .rejects
      .toThrow('Invalid psbt provided');
  });
});
