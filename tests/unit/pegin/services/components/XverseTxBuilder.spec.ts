import { expect } from 'chai';
import sinon from 'sinon';
import { ApiService } from '@/common/services';
import store from '@/common/store';
import * as constants from '@/common/store/constants';
import XverseTxBuilder from '@/pegin/middleware/TxBuilder/XverseTxBuilder';
import { NormalizedTx, NormalizedInput } from '@/common/types';
import axios, { AxiosHeaders, AxiosResponse } from 'axios';
import { EnvironmentAccessorService } from '@/common/services/enviroment-accessor.service';

const txHex1 = '01000000022d2d5d12644b7f46bd2c094eb663f074f1042fa0a522b59d338cedde83aa5661000000006b483045022100b247c5947c69ab0e6249c587e2792cc5b723a356f796d092b1c2493ed5a74d3a02203e72fc592318ed72b2537859e6d02d91c61da1f27fcb066a566ce20d87e90178012103cb3b06dff127665fc0173c4910b8c254924627cd27decaaf9771f0566b859fdefdffffff57497ac2292f1dec0baba43abbbb02059164309c5f384b64ac4a931c0ae96177010000006a473044022026fa68c558f028258a4f489ecbbe0c5457825f5f7bedaabbcac82b5a64793dc402202aa1996f62728adfe78e1b7b31481397b8bdb20b004b161c3f121a972660746b01210264f3f31d1a81ab1062fce2187dad0c0efb1cee194f5c1ca520bf0a1295df6ee5fdffffff01f44f05000000000017a914a8e241e997f18c2dc0611cc6cb2d889e17f34f378700000000';

function getTxHex(expectedHex: string): Promise<AxiosResponse> {
  return new Promise<AxiosResponse>((resolve) => {
    resolve(
      {
        data: { hex: expectedHex },
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
    vueAppRskNodeHost: '',
    vueAppApiBaseUrl: 'https://api.2wp.testnet.rootstock.io',
  };
  EnvironmentAccessorService.initializeEnvironmentVariables(defaultEnvironmentVariables);
}

describe('XverseTxBuilder', () => {
  let xverseTxBuilder: XverseTxBuilder;

  beforeEach(() => {
    setEnvironment();
    xverseTxBuilder = new XverseTxBuilder();
  });

  afterEach(() => {
    sinon.restore();
  });

  describe('buildTx', () => {
    it('should build a transaction successfully', async () => {
      const normalizedTx: NormalizedTx = {
        inputs: [
          {
            address: '2N8eCZA1Su5ysSDKqDGSMNH8KgFi1L5jEYh',
            prev_hash: 'c31556bf6a6b6c0a57387a88ad69a8cc7c159362d25d4870bffa3c005293375e',
            prev_index: 0,
            amount: '348148',
          },
        ],
        outputs: [
          {
            address: '2N15XxmYFrp9e1cjCruQVNgYF3cuYQxvtqX',
            amount: '1000',
          },
        ],
        coin: 'test',
      };
      store.commit(
        `pegInTx/${constants.PEGIN_TX_SET_ADDRESS_LIST}`,
        [
          {
            derivationPath: "m/49'/1'/0'/1/2",
            address: '2N8eCZA1Su5ysSDKqDGSMNH8KgFi1L5jEYh',
            publicKey: '02dc57829f1a5001646eb64edcecd797d5cbd0fcb24fb5a37d3084309a9201537c',
            unused: false,
          },
          {
            derivationPath: "m/49'/1'/0'/0/3",
            address: '2MzYn6qw7fbV7BtsoT6yBVV8nrbp37f6Uju',
            publicKey: '0321afc4e7457e83aedecb1995ea2331d2aeff18a38f14ea710f35924d16d35a30',
            unused: true,
          },
        ],
      );
      sinon.stub(axios, 'get').resolves(getTxHex(txHex1));

      const result = await xverseTxBuilder.buildTx(normalizedTx);

      expect(result).to.have.property('coin');
      expect(result).to.have.property('inputs').that.is.an('array').with.lengthOf(1);
      expect(result).to.have.property('outputs').that.is.an('array').with.lengthOf(1);
      expect(result).to.have.property('base64UnsignedPsbt').that.is.a('string');
    });

    it('should handle errors when building a transaction', async () => {
      const normalizedTx: NormalizedTx = {
        inputs: [
          {
            address: '2N8eCZA1Su5ysSDKqDGSMNH8KgFi1L5jEYh',
            prev_hash: 'c31556bf6a6b6c0a57387a88ad69a8cc7c159362d25d4870bffa3c005293375e',
            prev_index: 0,
            amount: '348148',
          },
        ],
        outputs: [
          {
            address: '2N15XxmYFrp9e1cjCruQVNgYF3cuYQxvtqX',
            amount: '1000',
          },
        ],
        coin: '',
      };

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      sinon.stub(xverseTxBuilder, <any>'getExtendedInputs').rejects(new Error('Test error'));

      try {
        await xverseTxBuilder.buildTx(normalizedTx);
      } catch (error) {
        expect(error).to.be.an('error').with.property('message', 'Test error');
      }
    });
  });

  describe('getExtendedInputs', () => {
    it('should get extended inputs successfully', async () => {
      const normalizedInputs: NormalizedInput[] = [
        {
          address: '2N8eCZA1Su5ysSDKqDGSMNH8KgFi1L5jEYh',
          prev_hash: 'c31556bf6a6b6c0a57387a88ad69a8cc7c159362d25d4870bffa3c005293375e',
          prev_index: 0,
          amount: '348148',
        },
      ];
      store.commit(
        `pegInTx/${constants.PEGIN_TX_SET_ADDRESS_LIST}`,
        [
          {
            derivationPath: "m/49'/1'/0'/1/2",
            address: '2N8eCZA1Su5ysSDKqDGSMNH8KgFi1L5jEYh',
            publicKey: '02dc57829f1a5001646eb64edcecd797d5cbd0fcb24fb5a37d3084309a9201537c',
            unused: false,
          },
          {
            derivationPath: "m/49'/1'/0'/0/3",
            address: '2MzYn6qw7fbV7BtsoT6yBVV8nrbp37f6Uju',
            publicKey: '0321afc4e7457e83aedecb1995ea2331d2aeff18a38f14ea710f35924d16d35a30',
            unused: true,
          },
        ],
      );
      sinon.stub(axios, 'get').resolves(getTxHex(txHex1));
      // eslint-disable-next-line dot-notation
      const result = await xverseTxBuilder['getExtendedInputs'](normalizedInputs);

      expect(result).to.be.an('array').with.lengthOf(1);
      expect(result[0]).to.have.property('hash', 'c31556bf6a6b6c0a57387a88ad69a8cc7c159362d25d4870bffa3c005293375e');
      expect(result[0]).to.have.property('index', 0);
      expect(result[0]).to.have.property('witnessUtxo').that.is.an('object');
      expect(result[0]).to.have.property('redeemScript').that.is.an.instanceOf(Buffer);
    });

    it('should handle errors when getting extended inputs', async () => {
      const normalizedInputs: NormalizedInput[] = [
        {
          address: 'testAddress1',
          prev_hash: 'testHash1',
          prev_index: 0,
          amount: '',
        },
      ];

      sinon.stub(ApiService, 'getTxHex').rejects(new Error('Tx not found'));

      try {
        // eslint-disable-next-line dot-notation
        await xverseTxBuilder['getExtendedInputs'](normalizedInputs);
      } catch (error) {
        expect(error).to.be.an('error').with.property('message', 'Tx not found');
      }
    });
  });
});
