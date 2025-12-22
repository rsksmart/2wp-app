import {
  FlyoverPeginState, QuotePegIn2WP, RootState, SatoshiBig,
  WeiBig, LogEntryType, LogEntryOperation,
  Utxo,
  PegInTxState,
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
  [constants.FLYOVER_PEGIN_ADD_SELECTED_QUOTE]: ({ commit }, quoteHash: string) => {
    commit(constants.FLYOVER_PEGIN_SET_SELECTED_QUOTE, quoteHash);
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
          pegoutLiquidity: WeiBig
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
        commit(
          constants.FLYOVER_PEGIN_SET_QR_DESTINATION_ADDRESS,
          {
            quoteHash: state.selectedQuoteHash,
            btcAddress: acceptedQuote.bitcoinDepositAddressHash,
          },
        );
        resolve(acceptedQuote);
      })
      .catch(reject);
  }),
  [constants.FLYOVER_PEGIN_ESTIMATE_MAX_VALUE]: (
    {
      state, rootGetters, commit, rootState,
    },
    balance: SatoshiBig,
  ) => new Promise<SatoshiBig>((resolve, reject) => {
    const { peginConfiguration } = rootState.pegInTx as PegInTxState;
    const provider = state.liquidityProviders
      .find((p) => p.id === EnvironmentAccessorService.getEnvironmentVariables().flyoverProviderId);
    if (!provider) {
      reject(new Error('No provider found'));
      return;
    }
    state.flyoverService.useLiquidityProvider(provider.id);
    const utxoList = rootGetters[`pegInTx/${constants.PEGIN_TX_GET_ACCOUNT_UTXO_LIST}`] as Utxo[];
    TxFeeService.getTxFee(
      balance,
      utxoList,
      constants.BITCOIN_FAST_FEE_LEVEL,
    )
      .then((fee) => {
        const maxValueToSend = balance.safeMinus(fee.fee.amount);
        const minAllowedValue = WeiBig.max(
          provider.pegin.minTransactionValue,
          new WeiBig(peginConfiguration.minValue, 'rbtc'),
        );
        const maxAllowedValue = WeiBig.min(
          provider.pegin.maxTransactionValue,
          WeiBig.fromSatoshiBig(maxValueToSend),
        );

        const weiMaxValueToSend = WeiBig.fromSatoshiBig(maxValueToSend);
        if (weiMaxValueToSend.lt(minAllowedValue) || weiMaxValueToSend.gt(maxAllowedValue)) {
          reject(new Error(`Balance is not within the provider allowed range: ${minAllowedValue.toRBTCTrimmedString()} - ${provider.pegin.maxTransactionValue.toRBTCTrimmedString()}`));
        }
        return Promise.all([state.flyoverService.estimateRecommendedPegin(
          maxValueToSend,
          state.rootstockRecipientAddress,
        ),
        { maxValueToSend, maxFee: fee.fee.amount, maxSelectedUtxoList: fee.selectedUtxoList },
        ]);
      })
      .then(([recommendedPegin, { maxValueToSend, maxFee, maxSelectedUtxoList }]) => {
        commit(constants.FLYOVER_PEGIN_SET_MAX_VALUES, {
          isMaxSelected: true,
          recommendedPegin,
          maxFee,
          maxValueToSend,
          maxSelectedUtxoList,
        });
        resolve(recommendedPegin);
      })
      .catch(() => {
        const zero = new SatoshiBig(0, 'satoshi');
        resolve(zero);
      });
  }),
  [constants.FLYOVER_PEGIN_RESET_MAX_SELECTED]: ({ commit }) => {
    commit(constants.FLYOVER_PEGIN_RESET_MAX_SELECTED);
  },
  [constants.FLYOVER_PEGIN_CLEAR_STATE]: ({ commit }) => {
    commit(constants.FLYOVER_PEGIN_SET_CLEAR_STATE);
  },
};
