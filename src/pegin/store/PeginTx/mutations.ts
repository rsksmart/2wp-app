import { MutationTree } from 'vuex';
import * as constants from '@/common/store/constants';
import {
  BtcAccount, BtcWallet, MiningSpeedFee,
  PeginConfiguration, PegInTxState, WalletAddress,
  AccountBalance, FeeAmountData, NormalizedTx,
  SatoshiBig, UtxoListPerAccount,
  Utxo,
} from '@/common/types';
import { getClearPeginTxState } from '@/common/utils';
import { WalletService } from '@/common/services';

export const mutations: MutationTree<PegInTxState> = {
  [constants.PEGIN_TX_SET_ADDRESS_LIST]: (state, addressList: WalletAddress[]) => {
    state.addressList = state.addressList ? [...state.addressList, ...addressList] : addressList;
  },
  [constants.PEGIN_TX_SET_UTXO_LIST]: (state, utxoList: UtxoListPerAccount) => {
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
    const clearState = getClearPeginTxState();
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
    if (!state.walletDataReady) state.walletDataReady = true;
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
  [constants.PEGIN_TX_SET_NORMALIZED_TX]: (state, tx: NormalizedTx) => {
    state.normalizedTx = tx;
  },
  [constants.PEGIN_TX_SET_WALLET_SERVICE]: (state, walletService: WalletService) => {
    state.walletService = walletService;
  },
  [constants.PEGIN_TX_WALLET_SERVICE_SUBSCRIBE]:
  (state, subscriber: (balance: AccountBalance, addressList: WalletAddress[]) => void) => {
    if (state.walletService) state.walletService.subscribe(subscriber);
  },
  [constants.PEGIN_TX_SET_LOADING_BALANCE]: (state, loadingBalance: boolean) => {
    state.loadingBalance = loadingBalance;
  },
  [constants.PEGIN_TX_SET_STATUS_SAFE_FEE]: (state, fee: string) => {
    state.statusInfo.safeFee = new SatoshiBig(fee, 'satoshi');
  },
  [constants.PEGIN_TX_SET_STATUS_REFUND_ADDRESS]: (state, refundAddress: string) => {
    state.statusInfo.refundAddress = refundAddress;
  },
  [constants.PEGIN_TX_SET_STATUS_TX_ID]: (state, txId: string) => {
    state.statusInfo.txId = txId;
  },
  [constants.PEGIN_TX_SET_PEGIN_TYPE]: (state, peginType: constants.peginType) => {
    state.peginType = peginType;
  },
  [constants.PEGIN_TX_SET_VIEW]: (state, view: string) => {
    state.currentView = view;
  },
  [constants.PEGIN_TX_SET_SELECTED_UTXO]: (state, { txId, selected }:
    {txId: string, selected: boolean }) => {
    if (state.utxoList) {
      ['legacy', 'segwit', 'nativeSegwit'].forEach((accountType: string) => {
        const accountUtxos = state.utxoList?.[accountType as keyof UtxoListPerAccount];
        accountUtxos?.forEach((utxo: Utxo) => {
          if (utxo.txid === txId) {
          // eslint-disable-next-line no-param-reassign
            utxo.selected = selected;
          }
        });
      });
    }
  },
};
