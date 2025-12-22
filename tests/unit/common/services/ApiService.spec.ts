/* eslint-disable @typescript-eslint/no-unused-vars */
import axios, { AxiosHeaders, AxiosResponse } from 'axios';
import sinon from 'sinon';
import {
  NormalizedInput, NormalizedOutput, NormalizedTx, SatoshiBig,
} from '@/common/types';
import ApiService from '@/common/services/ApiService';
import { BridgeService } from '@/common/services/BridgeService';
import { EnvironmentAccessorService } from '@/common/services/enviroment-accessor.service';
import * as constants from '@/common/store/constants';
import { ApiInformation } from '../../../../src/common/types/ApiInformation';

const powPegAddress = 'powPegAddress';
const outputs1: NormalizedOutput[] = [
  {
    address: powPegAddress,
    address_n: [0],
    amount: '50000',
    serializedValue: '',
  },
  {
    address: 'changeAddress',
    address_n: [],
    amount: '1921584',
    serializedValue: '',
  },
  {
    address: '',
    address_n: [],
    amount: '0',
    serializedValue: '',
    op_return_data: '52534b5401224d0b72bab9342f898c633ef187abff8a96c0fa02379ad9b7ba73bdc1e29e286e014d4e2e1f6884e3',
  },
];
const outputs2: NormalizedOutput[] = [
  {
    address: powPegAddress,
    address_n: [0],
    amount: '50000',
    serializedValue: '',
  },
  {
    address: 'changeAddress',
    address_n: [],
    amount: '1921584',
    serializedValue: '',
    op_return_data: 'test1',
  },
  {
    address: '',
    address_n: [],
    amount: '0',
    serializedValue: '',
    op_return_data: '52534b5401224d0b72bab9342f898c633ef187abff8a96c0fa',
  },
];
const outputs3: NormalizedOutput[] = [
  {
    address: 'oldPowPegAddress',
    address_n: [0],
    amount: '50000',
    serializedValue: '',
  },
  {
    address: 'changeAddress',
    address_n: [],
    amount: '1921584',
    serializedValue: '',
  },
  {
    address: '',
    address_n: [],
    amount: '0',
    serializedValue: '',
    op_return_data: '52534b5401224d0b72bab9342f898c633ef187abff8a96c0fa02379ad9b7ba73bdc1e29e286e014d4e2e1f6884e3',
  },
];
const outputs4: NormalizedOutput[] = [
  {
    address: powPegAddress,
    address_n: [0],
    amount: '50000',
    serializedValue: '',
  },
  {
    address: 'attackerChangeAddress',
    address_n: [],
    amount: '1921584',
  },
  {
    address: '',
    address_n: [],
    amount: '0',
    serializedValue: '',
    op_return_data: '52534b5401224d0b72bab9342f898c633ef187abff8a96c0fa02379ad9b7ba73bdc1e29e286e014d4e2e1f6884e3',
  },
];
const outputs5: NormalizedOutput[] = [
  {
    address: powPegAddress,
    address_n: [0],
    amount: '50000',
    serializedValue: '',
  },
  {
    address: 'tb1qfrlm7kp5vzh09x7ye4aytvj5me5kzmv45jzs0w',
    address_n: [],
    amount: '1921584'
      + '',
  },
  {
    address: '',
    address_n: [],
    amount: '0',
    serializedValue: '',
    op_return_data: '52534b5401224d0b72bab9342f898c633ef187abff8a96c0fa02379ad9b7ba73bdc1e29e286e014d4e2e1f6884e3',
  },
];
const inputs1: NormalizedInput[] = [
  {
    address: 'tb1qfrlm7kp5vzh09x7ye4aytvj5me5kzmv45jzs0w',
    prev_hash: 'e473f87ef1aa39bd44dbb60ad8b8814ba6db12f3ece1c738a12197e6a9ac1e7b',
    prev_index: 2,
    amount: '1973584',
    prevRawTx: '0100000000010137aae25b932a0dcd67bb0a580ac6eae46a3d5e17b617d2a7aa8f8c790a62093d0200000000ffffffff030000000000000000306a2e52534b5401aff12fa1c482beab1d70c68fe0fc5825447a981801eb4b7569d94afb7c5550b45e319305adda2d2f5d20a107000000000017a9145e6cf80958803e9b3c81cd90422152520d2a505c87501d1e000000000016001448ffbf583460aef29bc4cd7a45b254de69616d9502483045022100dfacff2cfd655da9d764d02887aaba6c87ca38b5e10eb67e1aac8d2be68b579a0220443818646bb1c960044e0b541d1d0566c577711b89dd0d55d4b8ed4e531785b5012103f5420ef68b63fec0894d42e0b3441fdb5d4a785db75d674014385f3832ee1a0000000000',
  },
];
const inputs2: NormalizedInput[] = [
  {
    address: 'attackerAddress',
    prev_hash: 'e473f87ef1aa39bd44dbb60ad8b8814ba6db12f3ece1c738a12197e6a9ac1e7b',
    prev_index: 2,
    amount: '1973584',
    prevRawTx: '0100000000010137aae25b932a0dcd67bb0a580ac6eae46a3d5e17b617d2a7aa8f8c790a62093d0200000000ffffffff030000000000000000306a2e52534b5401aff12fa1c482beab1d70c68fe0fc5825447a981801eb4b7569d94afb7c5550b45e319305adda2d2f5d20a107000000000017a9145e6cf80958803e9b3c81cd90422152520d2a505c87501d1e000000000016001448ffbf583460aef29bc4cd7a45b254de69616d9502483045022100dfacff2cfd655da9d764d02887aaba6c87ca38b5e10eb67e1aac8d2be68b579a0220443818646bb1c960044e0b541d1d0566c577711b89dd0d55d4b8ed4e531785b5012103f5420ef68b63fec0894d42e0b3441fdb5d4a785db75d674014385f3832ee1a0000000000',
  },
];
const inputs3: NormalizedInput[] = [
  {
    address: 'tb1qfrlm7kp5vzh09x7ye4aytvj5me5kzmv45jzs0w',
    prev_hash: '1559f5dcd950f4e48601b778fe01d26d1a21ea6eddbcd990e1067021d587ab15',
    prev_index: 2,
    amount: '1973584',
    prevRawTx: '0100000000010137aae25b932a0dcd67bb0a580ac6eae46a3d5e17b617d2a7aa8f8c790a62093d0200000000ffffffff030000000000000000306a2e52534b5401aff12fa1c482beab1d70c68fe0fc5825447a981801eb4b7569d94afb7c5550b45e319305adda2d2f5d20a107000000000017a9145e6cf80958803e9b3c81cd90422152520d2a505c87501d1e000000000016001448ffbf583460aef29bc4cd7a45b254de69616d9502483045022100dfacff2cfd655da9d764d02887aaba6c87ca38b5e10eb67e1aac8d2be68b579a0220443818646bb1c960044e0b541d1d0566c577711b89dd0d55d4b8ed4e531785b5012103f5420ef68b63fec0894d42e0b3441fdb5d4a785db75d674014385f3832ee1a0000000000',
  },
];
const inputs4: NormalizedInput[] = [
  {
    address: 'tb1que67sfexzx03t2nydm000tzpctkyfejp4d9sjz',
    prev_hash: '4420e6fde51bef2b5b5d3063b56a854e71209f6549004d25f49754e9f9e7bd8c',
    prev_index: 0,
    amount: '6595502955',
    prevRawTx: '02000000000101d888619018ee3de8ecc6b65c00cc85234d27f628fb462e745e354f330f97d3d50100000000feffffff026b631f8901000000160014e675e82726119f15aa646edef7ac41c2ec44e641c8ee180000000000160014c8c050e320dccd0d3035561289516f0f44bd60c502473044022028cfd99abf6263f9e32a11bba134fa2d7d4679a37f82583bfd2e098d9c495935022035b086240a05648e88550f1e9a209defa378ea9c92b93f2bec6252aec280e2e70121038cfd6227d5dedd3879df2a9ee37a46865e84afe46ce904877f9535415a7655b13ff12400',
  },
];

function getNormalizedTx(inputsSet: NormalizedInput[], outputsSet: NormalizedOutput[])
  : Promise<AxiosResponse> {
  return new Promise<AxiosResponse>((resolve) => {
    const normalizedTx: NormalizedTx = {
      coin: constants.BTC_NETWORK_TESTNET,
      inputs: inputsSet,
      outputs: outputsSet,
    };
    resolve(
      {
        data: normalizedTx,
        status: 200,
        statusText: 'OK',
        headers: {},
        config: { headers: new AxiosHeaders() },
      },
    );
  });
}

function setEnvironment() {
  const defaultEnvironmentVariables = {
    vueAppCoin: constants.BTC_NETWORK_TESTNET,
    vueAppRskNodeHost: 'https://public-node.testnet.rsk.co',
    vueAppApiBaseUrl: 'https://2wp-api.testnet.rsk.co',
  };
  EnvironmentAccessorService.initializeEnvironmentVariables(defaultEnvironmentVariables);
  sinon.stub(BridgeService.prototype, 'getFederationAddress').resolves(powPegAddress);
}
describe('Api Service', () => {
  describe('Function: createPeginTx', () => {
    const userChangeAddress = 'changeAddress';
    const userRefundAddress = '2MxKEf2su6FGAUfCEAHreGFQvEYrfYNHvL7';
    const recipientAddress = '0x224d0b72bab9342f898c633ef187abff8a96c0fa';
    const userAddressList = [userChangeAddress, userRefundAddress];
    const inputs1Addresses = ['tb1qfrlm7kp5vzh09x7ye4aytvj5me5kzmv45jzs0w'];
    beforeEach(setEnvironment);
    afterEach(() => {
      sinon.restore();
    });

    it('opReturn validation returns false, function reject', () => {
      sinon.stub(axios, 'post').resolves(getNormalizedTx(inputs1, outputs2));
      const addressList = [...inputs1Addresses, ...userAddressList];
      const calculatedFee = new SatoshiBig('2000', 'satoshi');
      return expect(ApiService.createPeginTx(50000, userRefundAddress, recipientAddress, 'sessionId', 'feeLevel', userChangeAddress, addressList, calculatedFee))
        .rejects
        .toEqual(new Error('Invalid data when parsing OpReturn'));
    });

    it('opReturn validation returns true, powpeg validation returns false, function reject', () => {
      sinon.stub(axios, 'post').resolves(getNormalizedTx(inputs1, outputs3));
      const addressList = [...inputs1Addresses, ...userAddressList];
      const calculatedFee = new SatoshiBig('2000', 'satoshi');
      expect(ApiService.createPeginTx(50000, userRefundAddress, recipientAddress, 'sessionId', 'feeLevel', userChangeAddress, addressList, calculatedFee))
        .rejects
        .toEqual(new Error('Invalid data when comparing Powpeg Address'));
    });

    it('opReturn validation returns true, powpeg validation returns true, return promise', async () => {
      sinon.stub(axios, 'post').resolves(getNormalizedTx(inputs1, outputs1));
      const addressList = [...inputs1Addresses, ...userAddressList];
      const calculatedFee = new SatoshiBig('2000', 'satoshi');
      const result = await ApiService.createPeginTx(50000, userRefundAddress, recipientAddress, 'sessionId', 'feeLevel', userChangeAddress, addressList, calculatedFee);
      expect(result)
        .toEqual({ inputs: inputs1, outputs: outputs1, coin: constants.BTC_NETWORK_TESTNET });
    });
    it('Should reject the promise if user specifies changeAddress, and API return wrong change output address', () => {
      sinon.stub(axios, 'post').resolves(getNormalizedTx(inputs1, outputs4));
      const addressList = [...inputs1Addresses, ...userAddressList];
      const calculatedFee = new SatoshiBig('2000', 'satoshi');
      expect(ApiService.createPeginTx(50000, userRefundAddress, recipientAddress, 'sessionId', 'feeLevel', userChangeAddress, addressList, calculatedFee))
        .rejects
        .toEqual(new Error('Invalid change address'));
    });
    it('Should reject the promise if user does not specify changeAddress, and API return wrong change output address', () => {
      sinon.stub(axios, 'post').resolves(getNormalizedTx(inputs1, outputs4));
      const addressList = [...inputs1Addresses, ...userAddressList];
      const calculatedFee = new SatoshiBig('2000', 'satoshi');
      expect(ApiService.createPeginTx(50000, userRefundAddress, recipientAddress, 'sessionId', 'feeLevel', '', addressList, calculatedFee))
        .rejects
        .toEqual(new Error('Invalid change address'));
    });
    it('Should resolve the promise if user does not specify changeAddress, and API return first input address', () => {
      sinon.stub(axios, 'post').resolves(getNormalizedTx(inputs1, outputs5));
      const addressList = [...inputs1Addresses, ...userAddressList];
      const calculatedFee = new SatoshiBig('2000', 'satoshi');
      expect(ApiService.createPeginTx(50000, userRefundAddress, recipientAddress, 'sessionId', 'feeLevel', '', addressList, calculatedFee))
        .resolves
        .toEqual({ inputs: inputs1, outputs: outputs5, coin: constants.BTC_NETWORK_TESTNET });
    });
    it('Should reject the promise if there are at least 1 unverified input (address inconsistent with rawTx)', () => {
      sinon.stub(axios, 'post').resolves(getNormalizedTx(inputs2, outputs2));
      const addressList = [...inputs1Addresses, ...userAddressList];
      const calculatedFee = new SatoshiBig('2000', 'satoshi');
      expect(ApiService.createPeginTx(50000, userRefundAddress, recipientAddress, 'sessionId', 'feeLevel', '', addressList, calculatedFee))
        .rejects
        .toEqual(new Error('Invalid input list on the created Transaction'));
    });
    it('Should reject the promise if there are at least 1 unverified input (txId inconsistent with rawTx)', () => {
      sinon.stub(axios, 'post').resolves(getNormalizedTx(inputs3, outputs2));
      const addressList = [...inputs1Addresses, ...userAddressList];
      const calculatedFee = new SatoshiBig('2000', 'satoshi');
      expect(ApiService.createPeginTx(50000, userRefundAddress, recipientAddress, 'sessionId', 'feeLevel', '', addressList, calculatedFee))
        .rejects
        .toEqual(new Error('Invalid input list on the created Transaction'));
    });
    it('Should reject the promise if there are at least 1 unverified input (address is not in the user address list)', () => {
      sinon.stub(axios, 'post').resolves(getNormalizedTx(inputs4, outputs2));
      const addressList = [...inputs1Addresses, ...userAddressList];
      const storedFee = new SatoshiBig('2000', 'satoshi');
      expect(ApiService.createPeginTx(50000, userRefundAddress, recipientAddress, 'sessionId', 'feeLevel', '', addressList, storedFee))
        .rejects
        .toEqual(new Error('Invalid input list on the created Transaction'));
    });
    it('Should reject the promise if calculated tx fee is higher than the stored higher fee', () => {
      sinon.stub(axios, 'post').resolves(getNormalizedTx(inputs1, outputs1));
      const addressList = [...inputs1Addresses, ...userAddressList];
      const storedFee = new SatoshiBig('1999', 'satoshi');
      expect(ApiService.createPeginTx(50000, userRefundAddress, recipientAddress, 'sessionId', 'feeLevel', userChangeAddress, addressList, storedFee))
        .rejects
        .toEqual(new Error('There was an unexpected increase of the calculated fee'));
    });
    it('Should resolve the promise if calculated tx fee is lower or equal than the stored higher fee', async () => {
      sinon.stub(axios, 'post').resolves(getNormalizedTx(inputs1, outputs1));
      const addressList = [...inputs1Addresses, ...userAddressList];
      const storedFee = new SatoshiBig('2000', 'satoshi');
      const result = await ApiService.createPeginTx(50000, userRefundAddress, recipientAddress, 'sessionId', 'feeLevel', userChangeAddress, addressList, storedFee);
      expect(result)
        .toEqual({ inputs: inputs1, outputs: outputs1, coin: constants.BTC_NETWORK_TESTNET });
    });
  });
  describe('Function: ApiInformation', () => {
    afterEach(() => {
      sinon.restore();
    });
    it('obtain api info, return promise', async () => {
      sinon.stub(axios, 'get').resolves({ data: { version: '1.1.0' } });
      const info = await ApiService.getApiInformation();
      return expect(info).not.toBeNull();
    });

    it('obtain api version, return promise', () => {
      sinon.stub(axios, 'get').resolves({ data: { version: '1.1.0' } });
      return ApiService.getApiInformation()
        .then((apiInfo: ApiInformation) => expect(apiInfo.version).toEqual('1.1.0'));
    });
  });

  describe('Function: getTxStatus', () => {
    const txId = 'txId';
    afterEach(() => {
      sinon.restore();
    });
    it('should reject promise with error "No data was returned"', async () => {
      sinon.stub(axios, 'get').resolves({ data: null });
      expect(ApiService.getTxStatus(txId)).rejects.toEqual(new Error('No data was returned'));
    });
    it('should reject promise with error "Empty response from server"', async () => {
      sinon.stub(axios, 'get').resolves({ data: { type: null } });
      expect(ApiService.getTxStatus(txId)).rejects.toEqual(new Error('Empty response from server'));
    });
    it('should reject promise with error, if data type is invalid', async () => {
      sinon.stub(axios, 'get').resolves({ data: { type: 'INVALID_DATA' } });
      expect(ApiService.getTxStatus(txId)).resolves.toEqual({ type: 'INVALID_DATA' });
    });
    it('should reject promise with error, if data type is unexpected error', async () => {
      sinon.stub(axios, 'get').resolves({ data: { type: 'UNEXPECTED_ERROR' } });
      expect(ApiService.getTxStatus(txId)).rejects.toEqual(new Error('There was an unexpected error. Try again later.'));
    });
    it('should resolve promise, if data type is unexpected error', async () => {
      sinon.stub(axios, 'get').resolves({ data: { txDetails: { status: 'RECEIVED' }, type: 'PEGOUT' } });
      const txStatus = await ApiService.getTxStatus(txId);
      expect(txStatus).toEqual({ txDetails: { status: 'RECEIVED' }, type: 'PEGOUT' });
    });
  });

  describe('Function: getTxHex', () => {
    afterEach(() => {
      sinon.restore();
    });
    it('should resolve with the transaction hex if successful', async () => {
      const txId = 'transactionId';
      const expectedHex = 'transactionHex';
      const response = { data: { hex: expectedHex } };
      const axiosGetStub = sinon.stub(axios, 'get').resolves(response);
      const result = await ApiService.getTxHex(txId);
      expect(axiosGetStub.calledOnceWithExactly(`${ApiService.baseURL}/tx?tx=${txId}`)).toBe(true);
      expect(result).toBe(expectedHex);
    });
    it('should reject with an error message if an error occurs', async () => {
      const txId = 'transactionId';
      const expectedError = 'Error message';
      const response = { data: { error: expectedError } };
      sinon.stub(axios, 'get').resolves(response);
      try {
        await ApiService.getTxHex(txId);
        // should never be reached
        expect(true).toBe(false);
      } catch (error) {
        expect(error).toBe(expectedError);
      }
    });
  });

  describe('Function: broadcast', () => {
    afterEach(() => {
      sinon.restore();
    });
    it('should resolve with the transaction ID if successful', async () => {
      const signedRawTx = 'signedRawTransaction';
      const expectedTxId = 'transactionId';
      const response = { data: { txId: expectedTxId } };
      const axiosPostStub = sinon.stub(axios, 'post').resolves(response);
      const result = await ApiService.broadcast(signedRawTx);
      expect(axiosPostStub.calledOnceWithExactly(`${ApiService.baseURL}/broadcast`, { data: signedRawTx })).toBe(true);
      expect(result).toBe(expectedTxId);
    });
    it('should reject with an error message if an error occurs', async () => {
      const signedRawTx = 'signedRawTransaction';
      const expectedError = 'Error message';
      const response = { data: { error: expectedError } };
      sinon.stub(axios, 'post').resolves(response);
      try {
        await ApiService.broadcast(signedRawTx);
        // should never be reached
        expect(true).toBe(false);
      } catch (error) {
        expect(error).toBe(expectedError);
      }
    });
  });

  describe('Function: getTxFee', () => {
    afterEach(() => {
      sinon.restore();
    });
    it('should resolve with the fee amount data if successful', async () => {
      const sessionId = 'session123';
      const amount = 10;
      const accountType = 'type1';
      const expectedResponse = { data: {} };
      const axiosPostStub = sinon.stub(axios, 'post').resolves(expectedResponse);
      const result = await ApiService.getTxFee(sessionId, amount, accountType);
      expect(axiosPostStub.calledOnceWithExactly(`${ApiService.baseURL}/tx-fee`, {
        sessionId,
        amount,
        accountType,
      })).toBe(true);
      expect(result).toEqual(expectedResponse.data);
    });
  });

  describe('Function: getBalances', () => {
    afterEach(() => {
      sinon.restore();
    });
    it('should resolve with the account balance if successful', async () => {
      const sessionId = 'session123';
      const addressList = [
        { address: 'address1' },
        { address: 'address2' },
      ];
      const expectedResponse = { data: {} };
      const axiosPostStub = sinon.stub(axios, 'post').resolves(expectedResponse);
      const result = await ApiService.getBalances(sessionId, addressList);
      expect(axiosPostStub.calledOnceWithExactly(`${ApiService.baseURL}/balance`, {
        sessionId,
        addressList,
      })).toBe(true);
      expect(result).toEqual(expectedResponse.data);
    });
  });

  describe('Function: registerTx', () => {
    afterEach(() => {
      sinon.restore();
    });
    it('should resolve when register tx on api db', async () => {
      const expectedResponse = { data: {} };
      const axiosPostStub = sinon.stub(axios, 'post').resolves(expectedResponse);
      const txHash = '0x807f14318a2f4bc62ae3a14370c243087464740fb2f5b16763f2fb1635708bb4';
      const type = 'pegout';
      const value = '8000000000000000';
      const wallet = 'Metamask';
      const result = await ApiService.registerTx(
        {
          txHash,
          type,
          value,
          wallet,
        },
      );
      await expect(axiosPostStub.calledOnceWithExactly(
        `${ApiService.baseURL}/register`,
        {
          txHash,
          type,
          value,
          wallet,
        },
        { headers: { 'Content-Type': 'application/json' } },
      )).toBe(true);
      expect(result).toEqual(expectedResponse.data);
    });
  });

  describe('Function: getFeatures', () => {
    afterEach(() => {
      sinon.restore();
    });
    it('should resolve feature flags configuration', async () => {
      const expectedResponse = {
        data: [
          {
            name: 'flyover_pegout',
            value: 'enabled',
            version: 2.3,
          },
          {
            name: 'flyover_pegin',
            value: 'enabled',
            version: 2.3,
          },
          {
            name: 'terms_and_conditions',
            value: '# TERMS OF SERVICES',
            version: 2.3,
          },
          {
            name: 'wallet_ledger',
            value: 'enabled',
            version: 2.3,
            supportedBrowsers: {
              chrome: true,
              firefox: false,
              edge: false,
              opera: false,
              brave: false,
              chromium: false,
              safari: false,
              _id: '67b8e1ee2fc2209df52211ce',
            },
          },
          {
            name: 'wallet_trezor',
            value: 'enabled',
            version: 2.3,
            supportedBrowsers: {
              chrome: true,
              firefox: true,
              edge: false,
              opera: false,
              brave: false,
              chromium: false,
              safari: false,
              _id: '67b8e1ee2fc2209df52211cf',
            },
          },
          {
            name: 'wallet_leather',
            value: 'enabled',
            version: 2.3,
            supportedBrowsers: {
              chrome: true,
              firefox: false,
              edge: false,
              opera: false,
              brave: false,
              chromium: false,
              safari: false,
              _id: '67b8e1ee2fc2209df52211d0',
            },
          },
          {
            name: 'wallet_xverse',
            value: 'enabled',
            version: 2.3,
            supportedBrowsers: {
              chrome: true,
              firefox: false,
              edge: false,
              opera: false,
              brave: false,
              chromium: false,
              safari: false,
              _id: '67b8e1ee2fc2209df52211d1',
            },
          },
          {
            name: 'wallet_enkrypt',
            value: 'enabled',
            version: 2.3,
            supportedBrowsers: {
              chrome: true,
              firefox: false,
              edge: false,
              opera: false,
              brave: false,
              chromium: false,
              safari: false,
              _id: '67b8e1ee2fc2209df52211d2',
            },
          },
        ],
      };
      const axiosGetStub = sinon.stub(axios, 'get').resolves(expectedResponse);
      const result = await ApiService.getFeatures();
      expect(axiosGetStub.calledOnceWithExactly(`${ApiService.baseURL}/features`))
        .toBe(true);
      expect(result).toEqual(expectedResponse.data);
    });
  });
});
