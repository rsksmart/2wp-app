import FlyoverService from '@/common/services/FlyoverService';
import { EnvironmentAccessorService } from '@/common/services/enviroment-accessor.service';
import { SatoshiBig, WeiBig } from '@/common/types';
import { Flyover, FlyoverUtils } from '@rsksmart/flyover-sdk';
import * as constants from '@/common/store/constants';
import sinon from 'sinon';
import { ServiceError } from '@/common/utils';

jest.setTimeout(10000);
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
      liquidityCheckEnabled: false,
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

  const testPegoutQuotes = [
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

  const testPeginQuotes = [
    {
      quote: {
        lbcAddr: '0xc2A630c053D12D63d32b025082f6Ba268db18300',
        btcRefundAddr: 'n2y5V6LYszsrsxkMdMypL98YQxtBoLCXdc',
        rskRefundAddr: '0xe9a84d226bb3008f09a46096b00dd6782be4d5f2',
        lpBTCAddr: 'mhghaQCHedKZZQuFqSzg6Z3Rf1TqqDEPCc',
        callFee: 100000000000000n,
        penaltyFee: 1000000n,
        nonce: 3634522701524682751n,
        value: 5000000000000000n,
        agreementTimestamp: 1706817591,
        timeForDeposit: 120,
        gasFee: 105689215476000n,
        productFeeAmount: 50000000000000n,
        callOnRegister: true,
        confirmations: 60,
        contractAddr: '0xe9a84d226bb3008f09a46096b00dd6782be4d5f2',
        data: '',
        fedBTCAddr: 'mhghaQCHedKZZQuFqSzg6Z3Rf1TqqDEPCc',
        gasLimit: 200,
        lpCallTime: 360,
        lpRSKAddr: '0x7C4890A0f1D4bBf2C669Ac2d1efFa185c505359b',
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
    flyoverService = new FlyoverService('https://public-node.testnet.rsk.co');
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
  });

  describe('getPegoutQuotes', () => {
    beforeEach(() => {
      const stubedInstance = sinon.createStubInstance(Flyover);
      flyoverService.flyover = stubedInstance;
      stubedInstance.getLiquidityProviders.resolves(testLiquidProviders);
      stubedInstance.getPegoutQuotes.resolves(testPegoutQuotes);
    });

    it('should return an array of QuotePegOut2WP', async () => {
      const rskRefundAddress = '0xe9a84d226bb3008f09a46096b00dd6782be4d5f2';
      const btcRefundAddress = 'n2y5V6LYszsrsxkMdMypL98YQxtBoLCXdc';
      const btcRecipientAddress = 'n2y5V6LYszsrsxkMdMypL98YQxtBoLCXdc';
      const valueToTransfer = new WeiBig('0.005', 'rbtc');

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const spyisValidPegoutQuote = jest.spyOn(FlyoverService.prototype as any, 'isValidPegoutQuote');

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
      expect(spyisValidPegoutQuote).toHaveBeenCalled();
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

  describe('getPeginQuotes', () => {
    beforeEach(() => {
      const stubedInstance = sinon.createStubInstance(Flyover);
      flyoverService.flyover = stubedInstance;
      stubedInstance.getLiquidityProviders.resolves(testLiquidProviders);
      stubedInstance.getQuotes.resolves(testPeginQuotes);
    });

    it('should return an array of QuotePegIn2WP', async () => {
      const rskRefundAddress = '0xe9a84d226bb3008f09a46096b00dd6782be4d5f2';
      const valueToTransfer = new SatoshiBig('0.005', 'btc');

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const spyisValidQuote = jest.spyOn(FlyoverService.prototype as any, 'isValidPeginQuote');

      const quotes = await flyoverService.getPeginQuotes(
        rskRefundAddress,
        valueToTransfer,
      );

      expect(quotes).toBeInstanceOf(Array);
      expect(quotes.length).toBeGreaterThan(0);
      expect(quotes[0]).toHaveProperty('quoteHash');
      expect(quotes[0]).toHaveProperty('quote');
      expect(quotes[0].quote.value.toBTCTrimmedString()).toEqual('0.005');
      expect(spyisValidQuote).toHaveBeenCalled();
    });

    it('should return only the valid quotes', async () => {
      const rskRefundAddress = '0xaFf12FA1c482BEab1D70C68fe0Fc5825447A9818';
      const valueToTransfer = new SatoshiBig('0.005', 'btc');

      const quotes = await flyoverService.getPeginQuotes(
        rskRefundAddress,
        valueToTransfer,
      );

      expect(quotes).toBeInstanceOf(Array);
      expect(quotes.length).toBe(0);
    });
  });

  describe('acceptPegoutQuote', () => {
    beforeEach(() => {
      const stubedInstance = sinon.createStubInstance(Flyover);
      flyoverService.flyover = stubedInstance;
      stubedInstance.getLiquidityProviders.resolves(testLiquidProviders);
      stubedInstance.getPegoutQuotes.resolves(testPegoutQuotes);
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

  describe('acceptPeginQuote', () => {
    beforeEach(() => {
      const stubedInstance = sinon.createStubInstance(Flyover);
      flyoverService.flyover = stubedInstance;
      stubedInstance.getLiquidityProviders.resolves(testLiquidProviders);
      stubedInstance.getQuotes.resolves(testPeginQuotes);
      stubedInstance.acceptQuote.resolves({
        bitcoinDepositAddressHash: 'bitcoinDepositAddressHash',
        signature: 'signature',
      });
    });
    it('should accept the quote when found', async () => {
      const rskRefundAddress = '0xe9a84d226bb3008f09a46096b00dd6782be4d5f2';
      const valueToTransfer = new SatoshiBig('0.005', 'btc');

      const quotes = await flyoverService.getPeginQuotes(
        rskRefundAddress,
        valueToTransfer,
      );
      const { quoteHash } = quotes[0];
      const acceptedQuote = await flyoverService.acceptPeginQuote(quoteHash);
      expect(acceptedQuote).toHaveProperty('bitcoinDepositAddressHash', 'bitcoinDepositAddressHash');
      expect(acceptedQuote).toHaveProperty('signature');
    });

    it('should reject when the quote is not found', async () => {
      const quoteHash = 'invalidHash';
      await expect(flyoverService.acceptPeginQuote(quoteHash))
        .rejects.toThrow('The selected option does not exist');
    });
  });

  describe('acceptAndSendQuote', () => {
    /* eslint-disable @typescript-eslint/no-explicit-any, dot-notation */
    beforeEach(() => {
      const stubedInstance = sinon.createStubInstance(Flyover);
      flyoverService.flyover = stubedInstance;
      stubedInstance.getLiquidityProviders.resolves(testLiquidProviders);
      stubedInstance.getPegoutQuotes.resolves(testPegoutQuotes);
      stubedInstance.acceptPegoutQuote.resolves({
        lbcAddress: EnvironmentAccessorService.getEnvironmentVariables().lbcAddress,
        signature: 'signature',
      });
      stubedInstance.depositPegout.resolves('txHash');
    });

    it('should throw an error if the accepted quote is not found', () => {
      const quoteHash = 'invalidHash';

      const spyAcceptPegoutQuote = jest.spyOn(FlyoverService.prototype as any, 'acceptPegoutQuote');
      const spyDepositPegout = jest.spyOn(flyoverService.flyover as Flyover, 'depositPegout');

      expect(flyoverService.acceptAndSendPegoutQuote(quoteHash))
        .rejects.toThrow('There was an error accepting the option from the Flyover server');
      expect(spyAcceptPegoutQuote).toHaveBeenCalled();
      expect(spyDepositPegout).not.toHaveBeenCalled();
    });

    it('should accept and send a pegout quote', async () => {
      const rskRefundAddress = '0xe9a84d226bb3008f09a46096b00dd6782be4d5f2';
      const btcRefundAddress = 'n2y5V6LYszsrsxkMdMypL98YQxtBoLCXdc';
      const btcRecipientAddress = 'n2y5V6LYszsrsxkMdMypL98YQxtBoLCXdc';
      const valueToTransfer = new WeiBig('0.005', 'rbtc');
      const expectedTotalAmount = 5255689215476000n;

      const quotes = await flyoverService.getPegoutQuotes(
        rskRefundAddress,
        btcRefundAddress,
        btcRecipientAddress,
        valueToTransfer,
      );

      const spyAcceptPegoutQuote = jest.spyOn(FlyoverService.prototype as any, 'acceptPegoutQuote');
      const spyIsValidAcceptedQuote = jest.spyOn(FlyoverService.prototype as any, 'isValidAcceptedQuote');
      const spyDepositPegout = jest.spyOn(flyoverService.flyover as Flyover, 'depositPegout');

      const { quoteHash } = quotes[0];
      const acceptedQuote = await flyoverService.acceptAndSendPegoutQuote(quoteHash);
      expect(acceptedQuote.txHash).toBe('txHash');
      expect(spyAcceptPegoutQuote).toHaveBeenCalled();
      expect(spyIsValidAcceptedQuote).toHaveBeenCalled();
      expect(spyDepositPegout).toHaveBeenCalledWith(flyoverService['pegoutQuotes'][0], 'signature', expectedTotalAmount);
      expect(FlyoverUtils.getQuoteTotal(flyoverService['pegoutQuotes'][0])).toEqual(expectedTotalAmount);
    });
  });

  describe('getAvailableLiquidity', () => {
    it('should return the available liquidity', async () => {
      const stubedInstance = sinon.createStubInstance(Flyover);
      flyoverService.flyover = stubedInstance;
      stubedInstance.getAvailableLiquidity.resolves({
        peginLiquidityAmount: 1000000000000000000n,
        pegoutLiquidityAmount: 1000000000000000000n,
      });
      const liquidity = await flyoverService.getAvailableLiquidity();
      expect(liquidity.peginLiquidity).toBeInstanceOf(WeiBig);
      expect(liquidity.pegoutLiquidity).toBeInstanceOf(WeiBig);
    });
    it('should throw an error if the available liquidity is not found', async () => {
      const stubedInstance = sinon.createStubInstance(Flyover);
      flyoverService.flyover = stubedInstance;
      stubedInstance.getAvailableLiquidity.rejects();
      await expect(flyoverService.getAvailableLiquidity()).rejects.toThrowError(ServiceError);
    });
  });
});
