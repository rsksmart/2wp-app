/* eslint-disable @typescript-eslint/no-unused-vars */
import { NormalizedInput, NormalizedOutput } from '@/types';
import ApiService from '@/services/ApiService';
import axios, { AxiosResponse } from 'axios';
import sinon from 'sinon';
import { BridgeService } from '@/services/BridgeService';
import { EnvironmentAccessorService } from '@/services/enviroment-accessor.service';
import * as constants from '@/store/constants';
import { ApiInformation } from '../../../src/types/ApiInformation';

function getNormalizedTx(): Promise<AxiosResponse> {
  return new Promise<AxiosResponse>((resolve) => {
    const outputs: NormalizedOutput[] = [
      {
        address: 'powPegAddress',
        address_n: [0],
        amount: '1',
        serializedValue: '',
      },
      {
        address: 'changeAddress',
        address_n: [],
        amount: '0.1',
        serializedValue: '',
        op_return_data: 'test1',
      },
      {
        address: '',
        address_n: [],
        amount: '0',
        serializedValue: '',
        op_return_data: '52534b5401224d0b72bab9342f898c633ef187abff8a96c0fa02379ad9b7ba73bdc1e29e286e014d4e2e1f6884e3',
      },
    ];
    const inputs: NormalizedInput[] = [];
    resolve(
      {
        data:
              {
                coin: '0',
                inputs,
                outputs,
              },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {},
      },
    );
  });
}

function setEnvironment(_isValidOpReturn: boolean, _isValidPowPegAddress: boolean) {
  const defaultEnvironmentVariables = {
    vueAppCoin: constants.BTC_NETWORK_TESTNET,
    vueAppRskNodeHost: '',
    vueAppApiBaseUrl: 'https://2wp-api.testnet.rsk.co',
  };
  EnvironmentAccessorService.initializeEnvironmentVariables(defaultEnvironmentVariables);
  sinon.stub(BridgeService.prototype, 'getFederationAddress').resolves('powPegAddress');
  sinon.stub(axios, 'post').resolves(getNormalizedTx());
}
describe('Api Service', () => {
  describe('Function: createPeginTx', () => {
    const userChangeAddress = 'changeAddress';
    const userRefundAddress = '2MxKEf2su6FGAUfCEAHreGFQvEYrfYNHvL7';
    const recipientAddress = '0x224d0b72bab9342f898c633ef187abff8a96c0fa';
    const userAddressList = [userChangeAddress, userRefundAddress];
    afterEach(() => {
      sinon.restore();
    });

    it('opReturn validation returns false, function reject', () => {
      setEnvironment(false, true);
      return expect(ApiService.createPeginTx(1, 'refundBtcAddress', 'recipientRsKAddress', 'sessionId', 'feeLevel', 'changeBtcAddress', userAddressList))
        .rejects
        .toEqual(new Error('Invalid data when parsing OpReturn'));
    });

    it('opReturn validation returns true, powpeg validation returns false, function reject', () => {
      setEnvironment(true, false);
      return expect(ApiService.createPeginTx(2, userRefundAddress, recipientAddress, 'sessionId', 'feeLevel', userChangeAddress, userAddressList))
        .rejects
        .toEqual(new Error('Invalid data when comparing Powpeg Address'));
    });

    it('opReturn validation returns true, powpeg validation returns true, return promise', async () => {
      setEnvironment(true, true);
      try {
        const result = await ApiService.createPeginTx(1, 'refundBtcAddress', 'recipientRsKAddress', 'sessionId', 'feeLevel', 'changeBtcAddress', userAddressList);
        expect(result.coin).toBe('0');
        expect(result.outputs[2]?.op_return_data).toBe('test1');
      } catch (e) {
        expect(e).toEqual(new Error('Invalid data when parsing OpReturn'));
      }
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
});
