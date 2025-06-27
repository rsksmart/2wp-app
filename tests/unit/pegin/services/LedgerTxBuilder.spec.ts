import LedgerTxBuilder from '@/pegin/middleware/TxBuilder/LedgerTxBuilder';
import { NormalizedTx } from '@/common/types';
import * as constants from '@/common/store/constants';
import ApiService from '@/common/services/ApiService';
import sinon from 'sinon';
import { EnvironmentAccessorService } from '@/common/services/enviroment-accessor.service';
import LedgerTransportService from '@/common/services/LedgerTransportService';
import { BigNumber } from 'ethers';
import MockLedgerTransportService from '../../../utils/MockLedgerTransportService';

describe('LedgerTxBuilder', () => {
  let ledgerTxBuilder: LedgerTxBuilder;

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
    ledgerTxBuilder = new LedgerTxBuilder();
    sinon.stub(ApiService, 'getTxHex')
      .resolves('010000000001018b31e946740a049cb81cb67a644452b5aec7367272fe09e41f46d62155dad2cb0200000000ffffffff030000000000000000306a2e52534b5401aff12fa1c482beab1d70c68fe0fc5825447a981801cfd98c46bbd4ac91bc272011bc6dbdd0b14a4ec620a107000000000017a9146e4b5ae85d86e4db0e6e5db09f8c276328cdbf3f87fa226300000000001600142d478c9a3b803cb6ce9bd261bb7ca6f8acafeb710247304402201c27cf25c66f51b3af025ba1161d969f6c6b127c1b76bba8aa33fe15ecf8deaa02205af3bbddb3b507623199557452d0552840c48fa7c5e14f6adfc4eef540d3ff350121020cdc156c0bde19579aa3bf07eb76996cc6c41b2e526164afdea37128ae0c489700000000');
    jest.mock('@/common/services/LedgerTransportService');
    LedgerTransportService.getInstance = jest
      .fn(() => new MockLedgerTransportService() as unknown as LedgerTransportService);
  });

  afterEach(() => {
    sinon.restore();
  });

  it('builds a transaction', async () => {
    const inputs = [
      {
        address: 'tb1q94rcex3msq7tdn5m6fsmkl9xlzk2l6m3zxzlvn',
        prev_hash: 'dfc404a4f93ee0ad494b6e987a834889a3e8f7f9c80d2e1d2f59314e7b4ebc47',
        amount: '6497018',
        prev_index: 2,
      },
    ];
    const opReturnData = '52534b5401aff12fa1c482beab1d70c68fe0fc5825447a981801cfd98c46bbd4ac91bc272011bc6dbdd0b14a4ec6';
    const outputs = [
      {
        amount: '0',
        op_return_data: opReturnData,
      },
      {
        address: '2N3JQb9erL1SnAr3NTMrZiPQQ8dcjJp4idV',
        amount: '1000000',
      },
      {
        address: 'tb1q94rcex3msq7tdn5m6fsmkl9xlzk2l6m3zxzlvn',
        amount: '2000000',
      },
    ];
    const normalizedTx: NormalizedTx = {
      inputs,
      outputs,
      coin: constants.BTC_NETWORK_TESTNET,
    };
    const tx = await ledgerTxBuilder.buildTx(normalizedTx, constants.BITCOIN_LEGACY_ADDRESS);
    expect(tx.coin).toBe(constants.BTC_NETWORK_TESTNET);
    expect(tx.inputs.length).toEqual(inputs.length);
    expect(tx.outputs.length).toEqual(outputs.length);
    tx.outputs.forEach((output) => {
      if (output.op_return_data) {
        expect(output.op_return_data).toBe(opReturnData);
        expect(output.amount).toBe('0');
      } else {
        expect(['2N3JQb9erL1SnAr3NTMrZiPQQ8dcjJp4idV', 'tb1q94rcex3msq7tdn5m6fsmkl9xlzk2l6m3zxzlvn'])
          .toContain(output.address);
        expect(BigNumber.from(output.amount).toNumber()).toBeGreaterThan(0);
      }
    });
  });
});
