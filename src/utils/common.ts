import { PegInTxState } from '@/types/pegInTx';
import SatoshiBig from '@/types/SatoshiBig';
import { BITCOIN_AVERAGE_FEE_LEVEL } from '@/store/constants';
import { PegOutTxState } from '@/types';
import Big from 'big.js';

export const getChunkedValue = (value: string, maxLength: number) => (value.length < maxLength ? value : `${value.substr(0, maxLength / 2)}...${value.substr(value.length - maxLength / 2, value.length)}`);

export const getClearPeginTxState = (): PegInTxState => ({
  peginConfiguration: {
    minValue: 0,
    maxValue: 0,
    federationAddress: '',
    btcConfirmations: 100,
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
    slow: new SatoshiBig(0, 'satoshi'),
    average: new SatoshiBig(0, 'satoshi'),
    fast: new SatoshiBig(0, 'satoshi'),
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
  minAmountToTransfer: new Big(0),
  maxAmountToTransfer: new Big(0),
  amountToTransfer: new Big(0),
  calculatedFees: {
    slow: new Big(0),
    average: new Big(0),
    fast: new Big(0),
  },
  selectedFee: BITCOIN_AVERAGE_FEE_LEVEL,
  balance: new Big(0),
});
