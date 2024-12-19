import { NormalizedTx } from '@/common/types';
import EnkryptTxBuilder from '@/pegin/middleware/TxBuilder/EnkryptTxBuilder';
import * as constants from '@/common/store/constants';
import ApiService from '@/common/services/ApiService';
import { EnvironmentAccessorService } from '@/common/services/enviroment-accessor.service';
import sinon from 'sinon';

describe('EnkryptTxBuilder', () => {
  let enkryptTxBuilder: EnkryptTxBuilder;

  function setEnvironment() {
    const defaultEnvironmentVariables = {
      vueAppCoin: constants.BTC_NETWORK_TESTNET,
      vueAppRskNodeHost: '',
      vueAppApiBaseUrl: 'https://2wp-api.testnet.rsk.co',
    };
    EnvironmentAccessorService.initializeEnvironmentVariables(defaultEnvironmentVariables);
  }

  beforeEach(() => {
    setEnvironment();
    enkryptTxBuilder = new EnkryptTxBuilder();
    sinon.stub(ApiService, 'getTxHex')
      .resolves('020000000001010366d8862273dc1afe60c26d3449ae248a7e15a50f97242d57fd9dcaeca5d96400000000000000000002c027090000000000160014dfc8d4318aea9a5a945be8e2eba3cafb94fe256975910500000000001600149b6d476d887db413ed0a59fbb1ea80ed41641e70024730440220535da8f53c535ed68b5a30b2adc87e424467351f2e867ae0ee4472668ef3a20a02202d1713a3bbed41e26b9fd19f08cdf665fdeba00b4295f858daa5ab69f1457ae401210296b60d2b92e4ba3f1948e00412d5fdc4ec0586830660c806ffe2214daa25fce900000000');
  });

  afterEach(() => {
    sinon.restore();
  });

  it('builds a transaction', async () => {
    const inputs = [
      {
        address: 'tb1qmlydgvv2a2d949zmar3whg72lw20uftftg4vr8',
        amount: '600000',
        prev_hash: 'd4e1c03847c3c732893453704f94659501a2e7e37389d2d72cc562d00ca0eff1',
        prev_index: 0,
      },
    ];
    const outputs = [
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
        amount: '74346',
      },
    ];
    const normalizedTx: NormalizedTx = {
      inputs,
      outputs,
      coin: constants.BTC_NETWORK_TESTNET,
    };
    expect(normalizedTx.coin).toBe(constants.BTC_NETWORK_TESTNET);

    const tx = await enkryptTxBuilder.buildTx(normalizedTx);

    expect(tx.coin).toBe(constants.BTC_NETWORK_TESTNET);
    expect(tx.inputs.length).toEqual(inputs.length);
    expect(tx.outputs.length).toEqual(outputs.length);
  });
});
