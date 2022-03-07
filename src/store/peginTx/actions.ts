import { ActionTree } from 'vuex';
import axios from 'axios';
import * as rskUtils from '@rsksmart/rsk-utils';
import * as constants from '@/store/constants';
import {
  BtcAccount, BtcWallet, MiningSpeedFee,
  PeginConfiguration, PegInTxState, Utxo, WalletAddress,
} from './types';
import { RootState } from '../types';
import ApiService from '@/services/ApiService';
import SatoshiBig from '@/types/SatoshiBig';
import { EnvironmentAccessorService } from '@/services/enviroment-accessor.service';
import { AccountBalance, FeeAmountData, NormalizedTx } from '@/types';

export const actions: ActionTree<PegInTxState, RootState> = {
  [constants.PEGIN_TX_ADD_ADDRESSES]: ({ commit }, addressList: WalletAddress[]) => {
    commit(constants.PEGIN_TX_SET_ADDRESS_LIST, addressList);
  },
  [constants.PEGIN_TX_ADD_UTXOS]: ({ commit }, utxoList: Utxo[]) => {
    commit(constants.PEGIN_TX_SET_UTXO_LIST, { utxoList });
  },
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
  [constants.PEGIN_TX_ADD_BITCOIN_WALLET]: ({ commit }, bitcoinWallet: BtcWallet) => {
    commit(constants.PEGIN_TX_SET_BITCOIN_WALLET, bitcoinWallet);
  },
  [constants.PEGIN_TX_ADD_BITCOIN_PRICE]: ({ commit }) => {
    axios.get('https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=bitcoin&order=market_cap_desc&per_page=100&page=1&sparkline=false')
      .then((response) => {
        const [result] = response.data;
        commit(constants.PEGIN_TX_SET_BITCOIN_PRICE, result.current_price);
      })
      .catch(console.error);
  },
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
  [constants.PEGIN_TX_CALCULATE_TX_FEE]: ({ commit, state }):
    Promise<void> => new Promise<void>((resolve, reject) => {
      if (!state.selectedAccount) reject(new Error('There are no selected account'));
      commit(constants.PEGIN_TX_SET_LOADING_FEE, true);
      ApiService.getTxFee(
        state.sessionId,
        Number(state.amountToTransfer.toSatoshiString()),
        state.selectedAccount ?? '',
      )
        .then((txFee) => {
          const fees: FeeAmountData = {
            slow: new SatoshiBig(txFee.slow, 'satoshi'),
            average: new SatoshiBig(txFee.average, 'satoshi'),
            fast: new SatoshiBig(txFee.fast, 'satoshi'),
          };
          commit(constants.PEGIN_TX_SET_CALCULATED_TX_FEE, fees);
          commit(constants.PEGIN_TX_SET_LOADING_FEE, false);
          resolve();
        })
        .catch(reject);
    }),
  [constants.PEGIN_TX_ADD_BALANCE]: ({ commit }, balance: AccountBalance): void => {
    commit(constants.PEGIN_TX_SET_BALANCE, balance);
  },
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
};
