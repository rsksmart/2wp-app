import { PegInTxState } from '@/common/types/pegInTx';
import SatoshiBig from '@/common/types/SatoshiBig';
import { BITCOIN_AVERAGE_FEE_LEVEL } from '@/common/store/constants';
import {
  FlyoverPegoutState, PegOutTxState,
  SessionState, WeiBig,
} from '@/common/types';
import { FlyoverService } from '@/common/services';
import { markRaw } from 'vue';

export const getChunkedValue = (value: string, maxLength: number) => (value.length < maxLength ? value : `${value.substr(0, maxLength / 2)}...${value.substr(value.length - maxLength / 2, value.length)}`);

export const getClearPeginTxState = (): PegInTxState => ({
  peginConfiguration: {
    minValue: 0,
    maxValue: 0,
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
});

export const getClearPegoutTxState = (): PegOutTxState => ({
  amountToTransfer: new WeiBig(0, 'wei'),
  pegoutConfiguration: {
    minValue: new WeiBig(0, 'wei'),
    maxValue: new WeiBig(0, 'wei'),
    bridgeContractAddress: '',
  },
  validAmount: false,
  calculatedFee: new WeiBig('0', 'wei'),
  gas: 0,
  bitcoinPrice: 0,
  btcEstimatedFee: new SatoshiBig(0, 'satoshi'),
  selectedFee: BITCOIN_AVERAGE_FEE_LEVEL,
  estimatedBTCToRecieve: new SatoshiBig(0, 'btc'),
});

export const getClearSessionState = ():SessionState => (
  {
    account: undefined,
    web3: undefined,
    enabled: false,
    rLogin: undefined,
    rLoginInstance: undefined,
    txType: undefined,
    balance: new WeiBig('0', 'wei'),
    btcDerivedAddress: '',
    bitcoinPrice: 0,
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
});
