import { ActionTree } from 'vuex';
import axios, { AxiosResponse } from 'axios';
import * as rskUtils from '@rsksmart/rsk-utils';
import * as constants from '@/common/store/constants';
import {
  ApiService, LedgerService, LiqualityService, TrezorService, EnkryptService,
} from '@/common/services';
import SatoshiBig from '@/common/types/SatoshiBig';
import { EnvironmentAccessorService } from '@/common/services/enviroment-accessor.service';
import {
  AccountBalance, FeeAmountData, NormalizedTx, RootState,
  PeginConfiguration, PegInTxState, WalletAddress,
  BtcAccount, BtcWallet, MiningSpeedFee, UtxoListPerAccount, Utxo,
} from '@/common/types';
import TxFeeService from '../services/TxFeeService';

export const actions: ActionTree<PegInTxState, RootState> = {
  [constants.IS_TREZOR_CONNECTED]: ({ commit }, trezorConnected: boolean) => {
    commit(constants.PEGIN_TX_SET_TREZOR_CONNECTED, trezorConnected);
  },
  [constants.PEGIN_TX_ADD_PEGIN_CONFIGURATION]: ({ commit }) => {
    ApiService.getPeginConfiguration()
      .then((config: PeginConfiguration) => {
        commit(constants.PEGIN_TX_SET_PEGIN_CONFIGURATION, config);
        commit(constants.PEGIN_TX_SET_SESSION_ID, config.sessionId);
      });
  },
  [constants.PEGIN_TX_ADD_SESSION_ID]: ({ commit }, sessionId: string) => {
    commit(constants.PEGIN_TX_SET_SESSION_ID, sessionId);
  },
  [constants.PEGIN_TX_ADD_BITCOIN_WALLET]: ({ commit, state }, bitcoinWallet: BtcWallet) => {
    commit(constants.PEGIN_TX_SET_BITCOIN_WALLET, bitcoinWallet);
    switch (bitcoinWallet) {
      case constants.WALLET_TREZOR:
        commit(constants.PEGIN_TX_SET_WALLET_SERVICE, new TrezorService());
        break;
      case constants.WALLET_LEDGER:
        commit(constants.PEGIN_TX_SET_WALLET_SERVICE, new LedgerService());
        break;
      case constants.WALLET_LIQUALITY:
        commit(constants.PEGIN_TX_SET_WALLET_SERVICE, new LiqualityService());
        break;
      case constants.WALLET_ENKRYPT:
        commit(constants.PEGIN_TX_SET_WALLET_SERVICE, new EnkryptService());
        break;
      default:
        commit(constants.PEGIN_TX_SET_WALLET_SERVICE, undefined);
        break;
    }
    commit(
      constants.PEGIN_TX_WALLET_SERVICE_SUBSCRIBE,
      (balance: AccountBalance, addressList: WalletAddress[], utxoList: UtxoListPerAccount) => {
        const loadingBalance = state.walletService ? state.walletService.isLoadingBalances : false;
        commit(constants.PEGIN_TX_SET_BALANCE, balance);
        commit(constants.PEGIN_TX_SET_ADDRESS_LIST, addressList);
        commit(constants.PEGIN_TX_SET_UTXO_LIST, utxoList);
        commit(constants.PEGIN_TX_SET_LOADING_BALANCE, loadingBalance);
      },
    );
  },
  [constants.PEGIN_TX_ADD_BITCOIN_PRICE]: ({ commit }) => axios.get(constants.COINGECKO_API_URL)
    .then((response: AxiosResponse) => {
      const [result] = response.data;
      commit(constants.PEGIN_TX_SET_BITCOIN_PRICE, result.current_price);
    })
    .catch(() => {
      commit(constants.PEGIN_TX_SET_BITCOIN_PRICE, 0);
    }),
  [constants.PEGIN_TX_CLEAR_STATE]: ({ commit }): void => {
    commit(constants.PEGIN_TX_CLEAR);
  },
  [constants.PEGIN_TX_INIT]: ({ dispatch }):
    Promise<void> => dispatch(constants.PEGIN_TX_ADD_BITCOIN_PRICE)
    .then(() => dispatch(constants.PEGIN_TX_ADD_PEGIN_CONFIGURATION)),

  [constants.PEGIN_TX_SELECT_ACCOUNT_TYPE]: ({ commit }, accountType: BtcAccount): void => {
    commit(constants.PEGIN_TX_SET_ACCOUNT_TYPE, accountType);
  },
  [constants.PEGIN_TX_ADD_AMOUNT_TO_TRANSFER]: ({ commit }, amount: SatoshiBig): void => {
    commit(constants.PEGIN_TX_SET_AMOUNT_TO_TRANSFER, amount);
  },
  [constants.PEGIN_TX_CALCULATE_TX_FEE]: ({ commit, state, getters }):
    Promise<void> => new Promise<void>((resolve, reject) => {
      if (!state.selectedAccount) {
        return;
      }
      const selectedBalance = getters[constants.PEGIN_TX_GET_SELECTED_BALANCE] as SatoshiBig;
      if (!selectedBalance.gt(0)) {
        return;
      }
      const amount = Number(state.amountToTransfer.toSatoshiString());
      if (amount === 0) {
        return;
      }
      commit(constants.PEGIN_TX_SET_LOADING_FEE, true);
      const utxoList = getters[constants.PEGIN_TX_GET_ACCOUNT_UTXO_LIST] as Utxo[];
      if (utxoList.length) {
        const feePromises = [
          TxFeeService.getTxFee(
            state.amountToTransfer,
            utxoList,
            constants.BITCOIN_SLOW_FEE_LEVEL,
          ),
          TxFeeService.getTxFee(
            state.amountToTransfer,
            utxoList,
            constants.BITCOIN_AVERAGE_FEE_LEVEL,
          ),
          TxFeeService.getTxFee(
            state.amountToTransfer,
            utxoList,
            constants.BITCOIN_FAST_FEE_LEVEL,
          ),
        ];
        Promise.all(feePromises)
          .then(([slow, average, fast]) => {
            const fees: FeeAmountData = {
              slow: {
                amount: new SatoshiBig(slow.fee.amount, 'satoshi'),
                enoughBalance: slow.fee.enoughBalance,
                selectedUtxoList: slow.selectedUtxoList,
              },
              average: {
                amount: new SatoshiBig(average.fee.amount, 'satoshi'),
                enoughBalance: average.fee.enoughBalance,
                selectedUtxoList: average.selectedUtxoList,
              },
              fast: {
                amount: new SatoshiBig(fast.fee.amount, 'satoshi'),
                enoughBalance: fast.fee.enoughBalance,
                selectedUtxoList: fast.selectedUtxoList,
              },
            };
            commit(constants.PEGIN_TX_SET_CALCULATED_TX_FEE, fees);
            commit(constants.PEGIN_TX_SET_LOADING_FEE, false);
            resolve();
          })
          .catch(reject);
      }
    }),
  [constants.PEGIN_TX_ADD_RSK_ADDRESS]: ({ commit }, address: string): void => {
    const chainId = EnvironmentAccessorService
      .getEnvironmentVariables().vueAppCoin === constants.BTC_NETWORK_MAINNET ? 30 : 31;
    const rskChecksumAddress = rskUtils.toChecksumAddress(address, chainId);
    commit(constants.PEGIN_TX_SET_RSK_ADDRESS, rskChecksumAddress);
  },
  [constants.PEGIN_TX_SELECT_FEE_LEVEL]: ({ commit }, feeLevel: MiningSpeedFee): void => {
    commit(constants.PEGIN_TX_SET_SELECTED_FEE_LEVEL, feeLevel);
  },
  [constants.PEGIN_TX_ADD_IS_VALID_AMOUNT]: ({ commit }, isValid: boolean): void => {
    commit(constants.PEGIN_TX_SET_IS_VALID_AMOUNT, isValid);
  },
  [constants.PEGIN_TX_ADD_NORMALIZED_TX]: ({ commit }, tx: NormalizedTx): void => {
    commit(constants.PEGIN_TX_SET_NORMALIZED_TX, tx);
  },
  [constants.PEGIN_TX_START_ASKING_FOR_BALANCE]: ({ state }): Promise<void> => {
    if (state.walletService) {
      return state.walletService
        .startAskingForBalance(
          state.peginConfiguration.sessionId,
          state.peginConfiguration.maxValue,
        );
    }
    return Promise.reject(new Error('Wallet service is not set'));
  },
  [constants.PEGIN_TX_STOP_ASKING_FOR_BALANCE]: ({ state }): Promise<void> => {
    if (state.walletService) {
      return state.walletService.stopAskingForBalance();
    }
    return Promise.reject(new Error('Wallet service is not set'));
  },
  [constants.PEGIN_TX_ADD_STATUS_SAFE_FEE]: ({ commit }, fee: string): void => {
    commit(constants.PEGIN_TX_SET_STATUS_SAFE_FEE, fee);
  },
  [constants.PEGIN_TX_ADD_STATUS_REFUND_ADDRESS]: ({ commit }, refundAddress: string): void => {
    commit(constants.PEGIN_TX_SET_STATUS_REFUND_ADDRESS, refundAddress);
  },
  [constants.PEGIN_TX_ADD_STATUS_TX_ID]: ({ commit }, txId: string): void => {
    commit(constants.PEGIN_TX_SET_STATUS_TX_ID, txId);
  },
};
