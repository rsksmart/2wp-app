/* eslint-disable camelcase */
import TrezorTxBuilder from '@/pegin/middleware/TxBuilder/TrezorTxBuilder';
import { NormalizedTx } from '@/common/types';
import * as constants from '@/common/store/constants';
import store from '@/common/store';
import sinon from 'sinon';
import { EnvironmentAccessorService } from '@/common/services/enviroment-accessor.service';
import { BigNumber } from 'ethers';

describe('TrezorTxBuilder', () => {
  let trezorTxBuilder: TrezorTxBuilder;
  const federationAddress = 'federationAddress';
  const op_return_data = '52534b5401224d0b72bab9342f898c633ef187abff8a96c0fa01ccc198c15d8344c73da67a75509a85a8f4226636';

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
    trezorTxBuilder = new TrezorTxBuilder();
    sinon.stub(store, 'state').returns({
      pegInTx: {
        addressList: [
          {
            address: 'address1',
            arrayPath: [0, 0],
          },
          {
            address: 'address2',
            arrayPath: [0, 1],
          },
        ],
      },
    });
  });

  it('builds a transaction', async () => {
    const inputs = [
      {
        address: 'address1',
        prev_hash: 'txid-1',
        amount: '1000000',
        prev_index: 0,
      },
      {
        address: 'address2',
        prev_hash: 'txid-2',
        amount: '2000000',
        prev_index: 1,
      },
    ];
    const outputs = [
      {
        amount: '0',
        op_return_data,
      },
      {
        address: federationAddress,
        amount: '1000000',
      },
      {
        address: 'address',
        amount: '2000000',
      },
    ];
    const normalizedTx: NormalizedTx = {
      inputs,
      outputs,
      coin: constants.BTC_NETWORK_TESTNET,
    };
    const tx = await trezorTxBuilder.buildTx(normalizedTx);
    expect(tx.version).toBe(constants.BITCOIN_TX_VERSION);
    expect(tx.coin).toBe(constants.BTC_NETWORK_TESTNET);
    expect(tx.inputs.length).toEqual(inputs.length);
    expect(tx.outputs.length).toEqual(outputs.length);
    tx.outputs.forEach((output) => {
      if (output.script_type === 'PAYTOOPRETURN') {
        expect(output.op_return_data).toBe(op_return_data);
        expect(output.amount).toBe('0');
      } else {
        expect(output.script_type).toBe('PAYTOADDRESS');
        expect(BigNumber.from(output.amount).toNumber()).toBeGreaterThan(0);
      }
    });
  });
});
