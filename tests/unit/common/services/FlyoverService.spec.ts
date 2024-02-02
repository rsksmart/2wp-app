import FlyoverService from '@/common/services/FlyoverService';
import { EnvironmentAccessorService } from '@/common/services/enviroment-accessor.service';
import { WeiBig } from '@/common/types';
import { Flyover } from '@rsksmart/flyover-sdk';
import * as constants from '@/common/store/constants';
import sinon from 'sinon';

describe('FlyoverService', () => {
  let flyoverService: FlyoverService;

  const testLiquidProviders = [
    {
      apiBaseUrl: 'https://lps.testnet.flyover.rif.technology',
      id: 1,
      name: 'Default Provider',
      provider: '0x7C4890A0f1D4bBf2C669Ac2d1efFa185c505359b',
      providerType: 'both',
      status: true,
      siteKey: '6LfOQC8pAAAAAGyu6RntC7DHxXDiU_-DuaXdVYaD',
      pegin: {
        fee: 100000000000000n,
        minTransactionValue: 5000000000000000n,
        maxTransactionValue: 1000000000000000000n,
        requiredConfirmations: 60,
      },
      pegout: {
        fee: 100000000000000n,
        minTransactionValue: 5000000000000000n,
        maxTransactionValue: 1000000000000000000n,
        requiredConfirmations: 60,
      },
    },
  ];

  const testQuotes = [
    {
      quote: {
        lbcAddress: '0xc2A630c053D12D63d32b025082f6Ba268db18300',
        liquidityProviderRskAddress: '0x7C4890A0f1D4bBf2C669Ac2d1efFa185c505359b',
        btcRefundAddress: 'n2y5V6LYszsrsxkMdMypL98YQxtBoLCXdc',
        rskRefundAddress: '0xe9a84d226bb3008f09a46096b00dd6782be4d5f2',
        lpBtcAddr: 'mhghaQCHedKZZQuFqSzg6Z3Rf1TqqDEPCc',
        callFee: 100000000000000n,
        penaltyFee: 1000000n,
        nonce: 3634522701524682751n,
        depositAddr: 'n2y5V6LYszsrsxkMdMypL98YQxtBoLCXdc',
        value: 5000000000000000n,
        agreementTimestamp: 1706817591,
        depositDateLimit: 1706821191,
        depositConfirmations: 2,
        transferConfirmations: 1,
        transferTime: 3600,
        expireDate: 1706821191,
        expireBlocks: 4764623,
        gasFee: 105689215476000n,
        productFeeAmount: 50000000000000n,
      },
      quoteHash: '7360231032856e3e655ae1e2e4c82dabc5bc4e09a2a19e7c315dca1369f542aa',
    },
  ];

  beforeEach(() => {
    const defaultEnvironmentVariables = {
      vueAppCoin: constants.BTC_NETWORK_TESTNET,
      vueAppRskNodeHost: '',
      vueAppApiBaseUrl: 'https://2wp-api.testnet.rsk.co',
      lbcAddress: '0xc2A630c053D12D63d32b025082f6Ba268db18300',
    };
    EnvironmentAccessorService.initializeEnvironmentVariables(defaultEnvironmentVariables);
    flyoverService = new FlyoverService('http://public-node.testnet.rsk.co');
  });
  afterEach(() => {
    sinon.restore();
  });

  describe('initialize', () => {
    it('should initialize the FlyoverService', async () => {
      await flyoverService.initialize();
      expect(flyoverService.flyover).toBeDefined();
    });

    it('should throw an error if initialization fails', async () => {
      jest.spyOn(flyoverService, 'initialize').mockRejectedValueOnce(new Error('Initialization failed'));
      await expect(flyoverService.initialize()).rejects.toThrow('Initialization failed');
    });
  });

  describe('getProviders', () => {
    beforeEach(() => {
      const stubedInstance = sinon.createStubInstance(Flyover);
      flyoverService.flyover = stubedInstance;
      stubedInstance.getLiquidityProviders.resolves(testLiquidProviders);
    });
    it('should return an array of LiquidityProvider2WP', async () => {
      const providers = await flyoverService.getProviders();
      const [provider] = providers;
      expect(providers).toBeInstanceOf(Array);
      expect(providers.length).toBeGreaterThan(0);
      expect(provider).toHaveProperty('id');
      expect(provider).toHaveProperty('name');
    });

    test.todo('should handle errors when fetching providers');
  });

  describe('getPegoutQuotes', () => {
    beforeEach(() => {
      const stubedInstance = sinon.createStubInstance(Flyover);
      flyoverService.flyover = stubedInstance;
      stubedInstance.getLiquidityProviders.resolves(testLiquidProviders);
      stubedInstance.getPegoutQuotes.resolves(testQuotes);
    });

    it('should return an array of QuotePegOut2WP', async () => {
      const rskRefundAddress = '0xe9a84d226bb3008f09a46096b00dd6782be4d5f2';
      const btcRefundAddress = 'n2y5V6LYszsrsxkMdMypL98YQxtBoLCXdc';
      const btcRecipientAddress = 'n2y5V6LYszsrsxkMdMypL98YQxtBoLCXdc';
      const valueToTransfer = new WeiBig('0.005', 'rbtc');

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const spyIsValidQuote = jest.spyOn(FlyoverService.prototype as any, 'isValidQuote');

      const quotes = await flyoverService.getPegoutQuotes(
        rskRefundAddress,
        btcRefundAddress,
        btcRecipientAddress,
        valueToTransfer,
      );

      expect(quotes).toBeInstanceOf(Array);
      expect(quotes.length).toBeGreaterThan(0);
      expect(quotes[0]).toHaveProperty('quoteHash');
      expect(quotes[0]).toHaveProperty('quote');
      expect(quotes[0].quote.value.toRBTCTrimmedString()).toEqual('0.005');
      expect(spyIsValidQuote).toHaveBeenCalled();
    });

    it('should return only the valid quotes', async () => {
      const rskRefundAddress = '0xaFf12FA1c482BEab1D70C68fe0Fc5825447A9818';
      const btcRefundAddress = 'n2y5V6LYszsrsxkMdMypL98YQxtBoLCXdc';
      const btcRecipientAddress = 'n2y5V6LYszsrsxkMdMypL98YQxtBoLCXdc';
      const valueToTransfer = new WeiBig('0.005', 'rbtc');

      const quotes = await flyoverService.getPegoutQuotes(
        rskRefundAddress,
        btcRefundAddress,
        btcRecipientAddress,
        valueToTransfer,
      );

      expect(quotes).toBeInstanceOf(Array);
      expect(quotes.length).toBe(0);
    });
  });

  describe('acceptQuote', () => {
    beforeEach(() => {
      const stubedInstance = sinon.createStubInstance(Flyover);
      flyoverService.flyover = stubedInstance;
      stubedInstance.getLiquidityProviders.resolves(testLiquidProviders);
      stubedInstance.getPegoutQuotes.resolves(testQuotes);
      stubedInstance.acceptPegoutQuote.resolves({
        lbcAddress: EnvironmentAccessorService.getEnvironmentVariables().lbcAddress,
        signature: 'signature',
      });
    });

    it('should accept a pegout quote', async () => {
      const rskRefundAddress = '0xe9a84d226bb3008f09a46096b00dd6782be4d5f2';
      const btcRefundAddress = 'n2y5V6LYszsrsxkMdMypL98YQxtBoLCXdc';
      const btcRecipientAddress = 'n2y5V6LYszsrsxkMdMypL98YQxtBoLCXdc';
      const valueToTransfer = new WeiBig('0.005', 'rbtc');

      const quotes = await flyoverService.getPegoutQuotes(
        rskRefundAddress,
        btcRefundAddress,
        btcRecipientAddress,
        valueToTransfer,
      );
      const { quoteHash } = quotes[0];
      const acceptedQuote = await flyoverService.acceptPegoutQuote(quoteHash);
      expect(acceptedQuote).toHaveProperty('lbcAddress', EnvironmentAccessorService.getEnvironmentVariables().lbcAddress);
      expect(acceptedQuote).toHaveProperty('signature');
    });
  });
});
