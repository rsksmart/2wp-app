import {
  FlyoverPeginState, QuotePegIn2WP, RootState, SatoshiBig,
  WeiBig, LogEntryType, LogEntryOperation,
} from '@/common/types';
import { ActionTree } from 'vuex';
import * as constants from '@/common/store/constants';
import { ApiService } from '@/common/services';
import { promiseWithTimeout } from '@/common/utils';
import { EnvironmentAccessorService } from '@/common/services/enviroment-accessor.service';
import { TxFeeService } from '@/pegin/services';

export const actions: ActionTree<FlyoverPeginState, RootState> = {
  [constants.FLYOVER_PEGIN_INIT]: ({ state, dispatch }) => new Promise((resolve, reject) => {
    state.flyoverService.initialize()
      .then(() => dispatch(constants.FLYOVER_PEGIN_GET_PROVIDERS))
      .then(resolve)
      .catch(reject);
  }),
  [constants.FLYOVER_PEGIN_GET_PROVIDERS]: ({ state, commit }) => new Promise<void>(
    (resolve, reject) => {
      promiseWithTimeout(
        state.flyoverService.getProviders(),
        EnvironmentAccessorService.getEnvironmentVariables().flyoverGetProvidersTimeout,
      )
        .then((providers) => {
          commit(constants.FLYOVER_PEGIN_SET_PROVIDERS, providers);
          ApiService.logToServer({
            type: LogEntryType.Success,
            operation: LogEntryOperation.PeginFlyover,
            location: constants.FLYOVER_PEGIN_GET_PROVIDERS,
          }).catch(() => undefined);
          resolve();
        })
        .catch((error) => {
          ApiService.logToServer({
            type: LogEntryType.Error,
            operation: LogEntryOperation.PeginFlyover,
            location: constants.FLYOVER_PEGIN_GET_PROVIDERS,
            error,
          }).catch(() => undefined);
          reject();
        });
    },
  ),
  [constants.FLYOVER_PEGIN_ADD_AMOUNT]: ({ commit }, amount: SatoshiBig) => {
    commit(constants.FLYOVER_PEGIN_SET_AMOUNT, amount);
  },
  [constants.FLYOVER_PEGIN_ADD_ROOTSTOCK_ADDRESS]: ({ commit }, address: string) => {
    commit(constants.FLYOVER_PEGIN_SET_ROOTSTOCK_ADDRESS, address);
  },
  [constants.FLYOVER_PEGIN_USE_LIQUIDITY_PROVIDER]: ({ state }, providerId: number) => {
    state.flyoverService.useLiquidityProvider(providerId);
  },
  [constants.FLYOVER_PEGIN_GET_QUOTES]: (
    { state, commit, dispatch },
    { rootstockRecipientAddress },
  ) => new Promise<void>((resolve) => {
    const quotePromises: Promise<QuotePegIn2WP[]>[] = [];
    state.liquidityProviders.forEach((provider) => {
      dispatch(constants.FLYOVER_PEGIN_USE_LIQUIDITY_PROVIDER, provider.id);
      quotePromises.push(state.flyoverService.getPeginQuotes(
        rootstockRecipientAddress,
        state.amountToTransfer,
      ));
    });
    let quotesByProvider: Record<number, QuotePegIn2WP[]> = {};
    Promise.allSettled(quotePromises)
      .then((responses) => {
        responses.forEach((response, index) => {
          if (response.status === constants.FULFILLED) {
            quotesByProvider = {
              ...quotesByProvider,
              [state.liquidityProviders[index].id]: response.value,
            };
          }
        });
        return responses;
      })
      .then((responses) => {
        commit(constants.FLYOVER_PEGIN_SET_QUOTES, quotesByProvider);
        responses.forEach((response) => {
          ApiService.logToServer({
            type: response.status === constants.FULFILLED
              ? LogEntryType.Success
              : LogEntryType.Error,
            operation: LogEntryOperation.PeginFlyover,
            location: constants.FLYOVER_PEGIN_GET_QUOTES,
            ...(response.status === constants.FULFILLED ? {} : { error: response.reason }),
          }).catch(() => undefined);
        });
        resolve();
      });
  }),
  [constants.FLYOVER_PEGIN_ADD_SELECTED_QUOTE]:
    ({
      commit, getters, rootGetters, rootState,
    }, quoteHash: string) => {
      commit(constants.FLYOVER_PEGIN_SET_SELECTED_QUOTE, quoteHash);
      if (quoteHash) {
        const amount = getters[constants.FLYOVER_PEGIN_GET_SELECTED_QUOTE]?.valueToTransfer;
        const utxoList = rootGetters[`pegInTx/${constants.PEGIN_TX_GET_ACCOUNT_UTXO_LIST}`];
        const feePerByte = rootState.pegInTx?.feePerByteByLevel;
        if (utxoList.length && feePerByte) {
          const fees = {
            slow: TxFeeService.getTxFee(
              amount,
              utxoList,
              feePerByte.slow,
              true,
            ),
            average: TxFeeService.getTxFee(
              amount,
              utxoList,
              feePerByte.average,
              true,
            ),
            fast: TxFeeService.getTxFee(
              amount,
              utxoList,
              feePerByte.fast,
              true,
            ),
          };
          commit(constants.FLYOVER_PEGIN_SET_CALCULATED_TX_FEE, fees);
          commit(constants.FLYOVER_PEGIN_SET_LOADING_FEE, false);
        }
      }
    },
  [constants.FLYOVER_PEGIN_CLEAR_QUOTES]: ({ commit }) => {
    commit(constants.FLYOVER_PEGIN_SET_QUOTES, {});
  },
  [constants.FLYOVER_PEGIN_GET_AVAILABLE_LIQUIDITY]:
    ({ state, dispatch, commit }) => new Promise((resolve, reject) => {
      const providersPromises:
        Promise<number | {
          providerId: number,
          peginLiquidity: WeiBig,
          pegoutLiquidity: SatoshiBig
        }>[] = [];
      state.liquidityProviders.forEach((provider) => {
        dispatch(constants.FLYOVER_PEGIN_USE_LIQUIDITY_PROVIDER, provider.id);
        providersPromises.push(state.flyoverService.getAvailableLiquidity());
      });
      Promise.allSettled(providersPromises)
        .then((responses) => responses.forEach((response) => {
          if (response.status === constants.FULFILLED) {
            if (response.value instanceof Object) {
              const { providerId, peginLiquidity } = response.value;
              commit(
                constants.FLYOVER_PEGIN_PROVIDERS_SET_AVAILABLE_LIQUIDITY,
                { providerId, peginLiquidity },
              );
            }
          }
        }))
        .then(resolve)
        .catch(reject);
    }),
  [constants.FLYOVER_PEGIN_ACCEPT_QUOTE]: ({ commit, state }) => new Promise((resolve, reject) => {
    state.flyoverService.acceptPeginQuote(state.selectedQuoteHash)
      .then((acceptedQuote) => {
        commit(constants.FLYOVER_PEGIN_SET_ACCEPTED_QUOTE_SIGNATURE, acceptedQuote.signature);
        resolve(acceptedQuote);
      })
      .catch(reject);
  }),
};
