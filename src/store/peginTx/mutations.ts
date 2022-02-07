import { MutationTree } from 'vuex';
import * as constants from '@/store/constants';
import {
  BtcAccount, BtcWallet, MiningSpeedFee,
  PeginConfiguration, PegInTxState, Utxo, WalletAddress,
} from './types';
import SatoshiBig from '@/types/SatoshiBig';
import { AccountBalance, FeeAmountData } from '@/types';

export const mutations: MutationTree<PegInTxState> = {
  [constants.PEGIN_TX_SET_ADDRESS_LIST]: (state, addressList: WalletAddress[]) => {
    state.addressList = state.addressList ? [...state.addressList, ...addressList] : addressList;
  },
  [constants.PEGIN_TX_SET_UTXO_LIST]: (state, utxoList: Utxo[]) => {
    state.utxoList = utxoList;
  },
  [constants.PEGIN_TX_SET_TREZOR_CONNECTED]: (state, trezorConnected: boolean) => {
    state.trezorConnected = trezorConnected;
  },
  [constants.PEGIN_TX_SET_SESSION_ID]: (state, sessionId: string) => {
    state.sessionId = sessionId;
  },
  [constants.PEGIN_TX_SET_PEGIN_CONFIGURATION]: (state, peginConfiguration: PeginConfiguration) => {
    state.peginConfiguration = peginConfiguration;
  },
  [constants.PEGIN_TX_SET_BITCOIN_WALLET]: (state, bitcoinWallet: BtcWallet) => {
    state.bitcoinWallet = bitcoinWallet;
  },
  [constants.PEGIN_TX_SET_BITCOIN_PRICE]: (state, btcPrice: number) => {
    state.bitcoinPrice = btcPrice;
  },
  [constants.PEGIN_TX_CLEAR]: (state) => {
    const clearState = constants.getClearPeginTxState();
    Object.assign(state, clearState);
  },
  [constants.PEGIN_TX_SET_ACCOUNT_TYPE]: (state, accountType: BtcAccount) => {
    state.selectedAccount = accountType;
  },
  [constants.PEGIN_TX_SET_AMOUNT_TO_TRANSFER]: (state, amount: SatoshiBig) => {
    state.amountToTransfer = amount;
  },
  [constants.PEGIN_TX_SET_CALCULATED_TX_FEE]: (state, fee: FeeAmountData) => {
    state.calculatedFees = fee;
  },
  [constants.PEGIN_TX_SET_LOADING_FEE]: (state, loadingFee: boolean) => {
    state.loadingFee = loadingFee;
  },
  [constants.PEGIN_TX_SET_BALANCE]: (state, balance: AccountBalance) => {
    state.balances = balance;
  },
  [constants.PEGIN_TX_SET_RSK_ADDRESS]: (state, rskAddress: string) => {
    state.rskAddressSelected = rskAddress;
  },
  [constants.PEGIN_TX_SET_SELECTED_FEE_LEVEL]: (state, feeLevel: MiningSpeedFee) => {
    state.selectedFee = feeLevel;
  },
  [constants.PEGIN_TX_SET_IS_VALID_AMOUNT]: (state, isValid: boolean) => {
    state.isValidAmountToTransfer = isValid;
  },
};
