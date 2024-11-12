import { PegInTxState } from '@/common/types/pegInTx';
import SatoshiBig from '@/common/types/SatoshiBig';
import { BITCOIN_AVERAGE_FEE_LEVEL } from '@/common/store/constants';
import {
  FlyoverPeginState,
  FlyoverPegoutState, ObjectDifference, PegOutTxState,
  SessionState, WeiBig,
} from '@/common/types';
import { FlyoverService } from '@/common/services';
import { markRaw } from 'vue';
import * as constants from '@/common/store/constants';

export const getChunkedValue = (value: string, maxLength: number) => (value.length < maxLength ? value : `${value.substr(0, maxLength / 2)}...${value.substr(value.length - maxLength / 2, value.length)}`);

export const getClearPeginTxState = (): PegInTxState => ({
  peginConfiguration: {
    minValue: 0,
    federationAddress: '',
    sessionId: '',
  },
  sessionId: '',
  utxoList: undefined,
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

export const getClearSessionState = ():SessionState => (
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
  }
);

export const getClearFlyoverPegoutState = (): FlyoverPegoutState => ({
  amountToTransfer: new WeiBig(0, 'wei'),
  validAmount: false,
  btcRecipientAddress: '',
  btcToReceive: new SatoshiBig(0, 'satoshi'),
  liquidityProviders: [],
  quotes: {},
  flyoverService: markRaw(new FlyoverService()),
  selectedQuoteHash: '',
  differences: [],
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
});

export const compareObjects = (
  obj1: { [key: string]: unknown },
  obj2: { [key: string]: unknown },
): Array<ObjectDifference> => {
  if (Object.getPrototypeOf(obj1) !== Object.getPrototypeOf(obj2)) {
    throw new Error('Objects has different prototype');
  }
  const differences: Array<ObjectDifference> = [];
  Object.keys(obj1).forEach((key) => {
    if (obj1[key] instanceof WeiBig && obj2[key] instanceof WeiBig) {
      if (!(obj1[key] as WeiBig).eq(obj2[key] as WeiBig)) {
        differences.push({
          key,
          oldValue: (obj1[key] as WeiBig).toRBTCString(),
          newValue: (obj2[key] as WeiBig).toRBTCString(),
        });
      }
    } else if (obj1[key] !== obj2[key]) {
      differences.push({
        key,
        oldValue: obj1[key],
        newValue: obj2[key],
      });
    }
  });
  return differences;
};
