/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  NormalizedInput, NormalizedOutput, NormalizedTx, SatoshiBig,
} from '@/types';
import ApiService from '@/services/ApiService';
import axios, { AxiosResponse } from 'axios';
import sinon from 'sinon';
import { BridgeService } from '@/services/BridgeService';
import { EnvironmentAccessorService } from '@/services/enviroment-accessor.service';
import * as constants from '@/store/constants';
import { ApiInformation } from '../../../src/types/ApiInformation';

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
const outputsSegwit: NormalizedOutput[] = [
  {
    address: powPegAddress,
    address_n: [0],
    amount: '50000',
    serializedValue: '',
  },
  {
    address: 'changeAddress',
    address_n: [],
    amount: '1850060',
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
const outputsNativeSegwit: NormalizedOutput[] = [
  {
    address: powPegAddress,
    address_n: [0],
    amount: '50000',
    serializedValue: '',
  },
  {
    address: 'changeAddress',
    address_n: [],
    amount: '6595495955',
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
const outputsP2PKH: NormalizedOutput[] = [
  {
    address: powPegAddress,
    address_n: [0],
    amount: '50000',
    serializedValue: '',
  },
  {
    address: 'changeAddress',
    address_n: [],
    amount: '61487527',
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
    address_n: [0],
    prev_hash: 'e473f87ef1aa39bd44dbb60ad8b8814ba6db12f3ece1c738a12197e6a9ac1e7b',
    prev_index: 2,
    amount: '1973584',
    prevRawTx: '0100000000010137aae25b932a0dcd67bb0a580ac6eae46a3d5e17b617d2a7aa8f8c790a62093d0200000000ffffffff030000000000000000306a2e52534b5401aff12fa1c482beab1d70c68fe0fc5825447a981801eb4b7569d94afb7c5550b45e319305adda2d2f5d20a107000000000017a9145e6cf80958803e9b3c81cd90422152520d2a505c87501d1e000000000016001448ffbf583460aef29bc4cd7a45b254de69616d9502483045022100dfacff2cfd655da9d764d02887aaba6c87ca38b5e10eb67e1aac8d2be68b579a0220443818646bb1c960044e0b541d1d0566c577711b89dd0d55d4b8ed4e531785b5012103f5420ef68b63fec0894d42e0b3441fdb5d4a785db75d674014385f3832ee1a0000000000',
  },
];
const inputs2: NormalizedInput[] = [
  {
    address: 'attackerAddress',
    address_n: [0],
    prev_hash: 'e473f87ef1aa39bd44dbb60ad8b8814ba6db12f3ece1c738a12197e6a9ac1e7b',
    prev_index: 2,
    amount: '1973584',
    prevRawTx: '0100000000010137aae25b932a0dcd67bb0a580ac6eae46a3d5e17b617d2a7aa8f8c790a62093d0200000000ffffffff030000000000000000306a2e52534b5401aff12fa1c482beab1d70c68fe0fc5825447a981801eb4b7569d94afb7c5550b45e319305adda2d2f5d20a107000000000017a9145e6cf80958803e9b3c81cd90422152520d2a505c87501d1e000000000016001448ffbf583460aef29bc4cd7a45b254de69616d9502483045022100dfacff2cfd655da9d764d02887aaba6c87ca38b5e10eb67e1aac8d2be68b579a0220443818646bb1c960044e0b541d1d0566c577711b89dd0d55d4b8ed4e531785b5012103f5420ef68b63fec0894d42e0b3441fdb5d4a785db75d674014385f3832ee1a0000000000',
  },
];
const inputs3: NormalizedInput[] = [
  {
    address: 'tb1qfrlm7kp5vzh09x7ye4aytvj5me5kzmv45jzs0w',
    address_n: [0],
    prev_hash: '1559f5dcd950f4e48601b778fe01d26d1a21ea6eddbcd990e1067021d587ab15',
    prev_index: 2,
    amount: '1973584',
    prevRawTx: '0100000000010137aae25b932a0dcd67bb0a580ac6eae46a3d5e17b617d2a7aa8f8c790a62093d0200000000ffffffff030000000000000000306a2e52534b5401aff12fa1c482beab1d70c68fe0fc5825447a981801eb4b7569d94afb7c5550b45e319305adda2d2f5d20a107000000000017a9145e6cf80958803e9b3c81cd90422152520d2a505c87501d1e000000000016001448ffbf583460aef29bc4cd7a45b254de69616d9502483045022100dfacff2cfd655da9d764d02887aaba6c87ca38b5e10eb67e1aac8d2be68b579a0220443818646bb1c960044e0b541d1d0566c577711b89dd0d55d4b8ed4e531785b5012103f5420ef68b63fec0894d42e0b3441fdb5d4a785db75d674014385f3832ee1a0000000000',
  },
];
const inputs4: NormalizedInput[] = [
  {
    address: 'tb1que67sfexzx03t2nydm000tzpctkyfejp4d9sjz',
    address_n: [0],
    prev_hash: '4420e6fde51bef2b5b5d3063b56a854e71209f6549004d25f49754e9f9e7bd8c',
    prev_index: 0,
    amount: '6595502955',
    prevRawTx: '02000000000101d888619018ee3de8ecc6b65c00cc85234d27f628fb462e745e354f330f97d3d50100000000feffffff026b631f8901000000160014e675e82726119f15aa646edef7ac41c2ec44e641c8ee180000000000160014c8c050e320dccd0d3035561289516f0f44bd60c502473044022028cfd99abf6263f9e32a11bba134fa2d7d4679a37f82583bfd2e098d9c495935022035b086240a05648e88550f1e9a209defa378ea9c92b93f2bec6252aec280e2e70121038cfd6227d5dedd3879df2a9ee37a46865e84afe46ce904877f9535415a7655b13ff12400',
  },
];
const inputsP2SH: NormalizedInput[] = [
  {
    address: '2NFf5d6LhYptMCni4Qtp2gHPx7DCNSvzCUX',
    address_n: [0],
    prev_hash: '487671c1dfbbe24aae0e1974733d377f918482311304267889fc714a4dac6ddb',
    prev_index: 1,
    amount: '1902060',
    prevRawTx: '020000000001018c9073490999e93cff500ed26ef39ee754f1de0a2fcc43419f8213a663cf67a4010000001716001465bc922ebb303a817c9bcb156baab34360d5eef4feffffff0229721f080100000017a914d3af02c2b27c37bdadcd0435c750ae9b3281d47687ec051d000000000017a914f5d5c46bf6f40470b5476ab27108d937c6e65c0e8702473044022054cd9ab0979dafd28769dbfd1327bccfbd4090e94582799ec73833ae81e646e2022019ee9f59c46a7d696a054ec49fddacca812b2bd63eb9da63cf5f9d45c059153301210283a19afc5d34b8bef04cd32cfdc3e5ab8b2ee16f1f0fe8c4e598fa8d47095f4330fc2400',
  },
];
const inputsP2PKH: NormalizedInput[] = [
  {
    address: 'mxVFsFW5N4mu1HPkxPttorvocvzeZ7KZyk',
    address_n: [0],
    prev_hash: '2bbf4a0dec88ee481996e91020609b72eb4aea96290f3c33ca6f69eb5a1064c8',
    prev_index: 3,
    amount: '61494527',
    prevRawTx: '0100000001386e095313899d0deca5e90ee610d5c85c2ffc36d42db9f8e7e261961c04a906030000006b483045022100a74d3b7b94c6898f54b1e9bcfa01e22b8f11f3d4cffb22fefc9819a7b27110e902200bd4d816e6fc91b0fbe3f9a2d2f5b4c82fb5ffb2c8fceadc471360bb1c500fd80121037435c194e9b01b3d7f7a2802d6684a3af68d05bbf4ec8f17021980d777691f1dfdffffff040000000000000000536a4c5054325bb87563b146568cc7b7a1625064c73e655015a3ec5ba98288e7c19b6526623ac830b03f37719247ed65015171ef551719468a9035a7e9274f2782bf1059e9aa020024fcc8000c0024f6c100053310270000000000001976a914000000000000000000000000000000000000000088ac10270000000000001976a914000000000000000000000000000000000000000088acff54aa03000000001976a914ba27f99e007c7f605a8305e318c1abde3cd220ac88ac00000000',
  },
];
const inputsBech32: NormalizedInput[] = [
  {
    address: 'tb1que67sfexzx03t2nydm000tzpctkyfejp4d9sjz',
    address_n: [0],
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
        config: {},
      },
    );
  });
}

function setEnvironment() {
  const defaultEnvironmentVariables = {
    vueAppCoin: constants.BTC_NETWORK_TESTNET,
    vueAppRskNodeHost: '',
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
    it('Should resolve for utxo P2PKH', async () => {
      sinon.stub(axios, 'post').resolves(getNormalizedTx(inputsP2PKH, outputsP2PKH));
      const addressList = [...inputs1Addresses, ...userAddressList, 'mxVFsFW5N4mu1HPkxPttorvocvzeZ7KZyk'];
      const storedFee = new SatoshiBig('2000', 'satoshi');
      const result = await ApiService.createPeginTx(50000, userRefundAddress, recipientAddress, 'sessionId', 'feeLevel', userChangeAddress, addressList, storedFee);
      expect(result)
        .toEqual({
          inputs: inputsP2PKH, outputs: outputsP2PKH, coin: constants.BTC_NETWORK_TESTNET,
        });
    });
    it('Should resolve for utxo P2SH', async () => {
      sinon.stub(axios, 'post').resolves(getNormalizedTx(inputsP2SH, outputsSegwit));
      const addressList = [...inputs1Addresses, ...userAddressList, '2NFf5d6LhYptMCni4Qtp2gHPx7DCNSvzCUX'];
      const storedFee = new SatoshiBig('2000', 'satoshi');
      const result = await ApiService.createPeginTx(50000, userRefundAddress, recipientAddress, 'sessionId', 'feeLevel', userChangeAddress, addressList, storedFee);
      expect(result)
        .toEqual({
          inputs: inputsP2SH, outputs: outputsSegwit, coin: constants.BTC_NETWORK_TESTNET,
        });
    });
    it('Should resolve for utxo Bech32', async () => {
      sinon.stub(axios, 'post').resolves(getNormalizedTx(inputsBech32, outputsNativeSegwit));
      const addressList = [...inputs1Addresses, ...userAddressList, 'tb1que67sfexzx03t2nydm000tzpctkyfejp4d9sjz'];
      const storedFee = new SatoshiBig('2000', 'satoshi');
      const result = await ApiService.createPeginTx(50000, userRefundAddress, recipientAddress, 'sessionId', 'feeLevel', userChangeAddress, addressList, storedFee);
      expect(result)
        .toEqual({
          inputs: inputsBech32, outputs: outputsNativeSegwit, coin: constants.BTC_NETWORK_TESTNET,
        });
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
