import { EnvironmentAccessorService } from '@/common/services/enviroment-accessor.service';
import * as constants from '@/common/store/constants';
import { SatoshiBig } from '@/common/types';
import { PeginTxService } from '@/pegin/services';
import sinon from 'sinon';

function setEnvironment() {
  const defaultEnvironmentVariables = {
    vueAppCoin: constants.BTC_NETWORK_TESTNET,
    burnDustValue: 2000,
  };
  EnvironmentAccessorService.initializeEnvironmentVariables(defaultEnvironmentVariables);
}

describe('PeginTx Service', () => {
  beforeEach(setEnvironment);
  afterEach(() => {
    sinon.restore();
  });
  const selectedUtxoList = [
    {
      txid: 'txid-1',
      amount: 1000000,
      address: 'address',
      path: '',
      derivationArray: [0],
      vout: 0,
    },
    {
      txid: 'txid-2',
      amount: 2000000,
      address: 'address',
      path: '',
      derivationArray: [0],
      vout: 1,
    },
  ];
  const denormalizedTx = {
    selectedUtxoList,
    totalFee: new SatoshiBig(50000, 'satoshi'),
    amountToTransfer: new SatoshiBig(1500000, 'satoshi'),
    federationAddress: '',
    refundAddress: 'mzBc4XEFSdzCDcTxAgf6EZXgsZWpztRhef',
    rskRecipientAddress: '224d0b72bab9342f898c633ef187abff8a96c0fa',
    changeAddress: '',
  };
  it('should build a normalized tx', () => {
    const normalizedTx = {
      coin: 'test',
      inputs: [
        {
          address: 'address',
          prev_hash: 'txid-1',
          amount: '1000000',
          address_n: [0],
          prev_index: 0,
        },
        {
          address: 'address',
          prev_hash: 'txid-2',
          amount: '2000000',
          address_n: [0],
          prev_index: 1,
        },
      ],
      outputs: [
        {
          address: denormalizedTx.federationAddress,
          amount: denormalizedTx.amountToTransfer.toSatoshiString(),
        },
        {
          amount: '0',
          op_return_data:
            '52534b5401224d0b72bab9342f898c633ef187abff8a96c0fa01ccc198c15d8344c73da67a75509a85a8f4226636',
        },
        {
          address: denormalizedTx.changeAddress,
          amount: '1450000',
        },
      ],
    };
    expect(PeginTxService.buildNormalizedTx(denormalizedTx)).toEqual(normalizedTx);
  });
});
