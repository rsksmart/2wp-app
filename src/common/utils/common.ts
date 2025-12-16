import { PegInTxState } from '@/common/types/pegInTx';
import SatoshiBig from '@/common/types/SatoshiBig';
import { BITCOIN_AVERAGE_FEE_LEVEL } from '@/common/store/constants';
import {
  FlyoverPeginState,
  FlyoverPegoutState, ObjectDifference, PegOutTxState,
  ReducedQuote,
  SessionState, WeiBig,
} from '@/common/types';
import { FlyoverService } from '@/common/services';
import { markRaw } from 'vue';
import * as constants from '@/common/store/constants';
import { EnvironmentAccessorService } from '@/common/services/enviroment-accessor.service';

export const getChunkedValue = (value: string, maxLength: number) => (value.length < maxLength ? value : `${value.substr(0, maxLength / 2)}...${value.substr(value.length - maxLength / 2, value.length)}`);

export const getClearPeginTxState = (): PegInTxState => ({
  peginConfiguration: {
    minValue: 0,
    federationAddress: '',
    sessionId: '',
  },
  sessionId: '',
  utxoList: {
    legacy: [],
    segwit: [],
    nativeSegwit: [],
  },
  addressList: [],
  trezorConnected: false,
  bitcoinWallet: undefined,
  bitcoinPrice: 0,
  balances: {
    legacy: new SatoshiBig(0, 'satoshi'),
    segwit: new SatoshiBig(0, 'satoshi'),
    nativeSegwit: new SatoshiBig(0, 'satoshi'),
  },
  loadingBalance: false,
  selectedAccount: undefined,
  calculatedFees: {
    slow: {
      amount: new SatoshiBig(0, 'satoshi'),
      enoughBalance: false,
      selectedUtxoList: [],
    },
    average: {
      amount: new SatoshiBig(0, 'satoshi'),
      enoughBalance: false,
      selectedUtxoList: [],
    },
    fast: {
      amount: new SatoshiBig(0, 'satoshi'),
      enoughBalance: false,
      selectedUtxoList: [],
    },
  },
  loadingFee: false,
  selectedFee: BITCOIN_AVERAGE_FEE_LEVEL,
  amountToTransfer: new SatoshiBig(0, 'btc'),
  isValidAmountToTransfer: false,
  rskAddressSelected: '',
  normalizedTx: {
    coin: '',
    inputs: [],
    outputs: [],
  },
  walletDataReady: false,
  currentView: '',
  statusInfo: {
    txId: '',
    refundAddress: '',
    safeFee: new SatoshiBig(0, 'btc'),
  },
  peginType: constants.peginType.POWPEG,
  walletService: undefined,
  maxFee: new SatoshiBig(0, 'satoshi'),
});

export const getClearPegoutTxState = (): PegOutTxState => ({
  amountToTransfer: new WeiBig(0, 'wei'),
  pegoutConfiguration: {
    minValue: new WeiBig(0, 'wei'),
    bridgeContractAddress: '',
  },
  validAmount: false,
  calculatedFee: new WeiBig('0', 'wei'),
  gas: 0,
  bitcoinPrice: 0,
  btcEstimatedFee: new SatoshiBig(0, 'satoshi'),
  selectedFee: BITCOIN_AVERAGE_FEE_LEVEL,
});

export const getClearSessionState = (): SessionState => (
  {
    account: undefined,
    ethersProvider: undefined,
    enabled: false,
    rLogin: undefined,
    rLoginInstance: undefined,
    txType: undefined,
    balance: new WeiBig('0', 'wei'),
    btcDerivedAddress: '',
    bitcoinPrice: 0,
    features: [],
    apiVersion: '',
    grecaptchaCountdown: EnvironmentAccessorService.getEnvironmentVariables().grecaptchaTime
        ?? constants.RECAPTCHA_NEW_TOKEN_TIME,
    grecaptchaIntervalId: undefined,
  }
);

export const getClearReducedQuote = (): ReducedQuote => ({
  gasFee: new WeiBig(0, 'wei'),
  callFee: new WeiBig(0, 'wei'),
  productFeeAmount: new WeiBig(0, 'wei'),
  value: new WeiBig(0, 'wei'),
  quoteHash: '',
});

export const getClearObjectDifference = (): ObjectDifference => ({
  percentage: 0,
  previousQuote: getClearReducedQuote(),
  currentQuote: getClearReducedQuote(),
});

export const getClearFlyoverPegoutState = (): FlyoverPegoutState => ({
  amountToTransfer: new WeiBig(0, 'wei'),
  validAmount: false,
  btcRecipientAddress: '',
  btcToReceive: new SatoshiBig(0, 'satoshi'),
  liquidityProviders: [],
  quotes: {},
  flyoverService: markRaw(new FlyoverService()),
  selectedQuoteHash: '',
  difference: getClearObjectDifference(),
  acceptedQuoteSignature: '',
});

export const getClearFlyoverPeginState = (): FlyoverPeginState => ({
  amountToTransfer: new SatoshiBig(0, 'satoshi'),
  validAmount: false,
  rootstockRecipientAddress: '',
  valueToReceive: new WeiBig(0, 'wei'),
  liquidityProviders: [],
  quotes: {},
  flyoverService: markRaw(new FlyoverService()),
  selectedQuoteHash: '',
  acceptedQuoteSignature: '',
  isMaxSelected: false,
  maxValueToSend: new SatoshiBig(0, 'satoshi'),
  maxFee: new SatoshiBig(0, 'satoshi'),
  maxSelectedUtxoList: [],
});

/**
 * Generates a syntactically valid RSK address without a corresponding private key
 *
 * @returns A valid-looking RSK address string
 */
export const generateMockRSKAddress = (): string => {
  const characters = '0123456789abcdef';
  let result = '';

  for (let i = 0; i < 40; i += 1) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    result += characters[randomIndex];
  }
  return `0x${result}`;
};

/**
 * Returns the minimum of two BigInt values
 *
 * @param a - First BigInt value
 * @param b - Second BigInt value
 * @returns The minimum of the two BigInt values
 */
export const minBigInt = (a: bigint, b: bigint): bigint => (a < b ? a : b);
