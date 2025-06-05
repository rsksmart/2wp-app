import {
  FlyoverPegoutState, QuotePegOut2WP, RootState, WeiBig,
  ReducedQuote, LogEntryType, LogEntryOperation,
} from '@/common/types';
import { ActionTree } from 'vuex';
import * as constants from '@/common/store/constants';
import { BridgeService } from '@/common/services/BridgeService';
import { getClearObjectDifference, promiseWithTimeout } from '@/common/utils';
import { ApiService } from '@/common/services';
import { EnvironmentAccessorService } from '@/common/services/enviroment-accessor.service';
import { providers } from 'ethers';
import { AcceptedPegoutQuote } from '@rsksmart/flyover-sdk';

export const actions: ActionTree<FlyoverPegoutState, RootState> = {
  [constants.FLYOVER_PEGOUT_INIT]: async (
    { state, dispatch },
    provider: providers.Web3Provider,
  ) => new Promise((resolve, reject) => {
    state.flyoverService.initialize(provider.provider)
      .then(() => dispatch(constants.FLYOVER_PEGOUT_GET_PROVIDERS))
      .then(resolve)
      .catch(reject);
  }),
  [constants.FLYOVER_PEGOUT_GET_PROVIDERS]:
    ({ state, commit }) => new Promise<void>((resolve, reject) => {
      promiseWithTimeout(
        state.flyoverService.getProviders(),
        EnvironmentAccessorService.getEnvironmentVariables().flyoverGetProvidersTimeout,
      )
        .then((liquidityProviders) => {
          commit(constants.FLYOVER_PEGOUT_SET_PROVIDERS, liquidityProviders);
          ApiService.logToServer({
            type: LogEntryType.Success,
            operation: LogEntryOperation.PegoutFlyover,
            location: constants.FLYOVER_PEGOUT_GET_PROVIDERS,
          }).catch(() => undefined);
          resolve();
        })
        .catch((error) => {
          ApiService.logToServer({
            type: LogEntryType.Error,
            operation: LogEntryOperation.PegoutFlyover,
            location: constants.FLYOVER_PEGOUT_GET_PROVIDERS,
            error,
          }).catch(() => undefined);
          reject();
        });
    }),
  [constants.FLYOVER_PEGOUT_ADD_AMOUNT]: ({ commit }, amount: WeiBig) => {
    commit(constants.FLYOVER_PEGOUT_SET_AMOUNT, amount);
  },
  [constants.FLYOVER_PEGOUT_ADD_BTC_ADDRESS]: ({ commit }, address: string) => {
    commit(constants.FLYOVER_PEGOUT_SET_BTC_ADDRESS, address);
  },
  [constants.FLYOVER_PEGOUT_GET_QUOTES]: async (
    { state, commit, dispatch },
    rskRefundAddress: string,
  ) => {
    const bridgeService = new BridgeService();
    const tempBtcAddress = await bridgeService.getFederationAddress();
    return new Promise<void>((resolve) => {
      const quotePromises: Promise<QuotePegOut2WP[]>[] = [];
      state.liquidityProviders.forEach((provider) => {
        dispatch(constants.FLYOVER_PEGOUT_USE_LIQUIDITY_PROVIDER, provider.id);
        quotePromises.push(state.flyoverService.getPegoutQuotes(
          rskRefundAddress,
          state.btcRecipientAddress ? state.btcRecipientAddress : tempBtcAddress,
          state.btcRecipientAddress ? state.btcRecipientAddress : tempBtcAddress,
          state.amountToTransfer,
        ));
      });
      let quotesByProvider: Record<number, QuotePegOut2WP[]> = {};
      const MAX_RESPONSE_TIME_IN_MS = 30000;
      const quotePromisesWithTimeout = quotePromises.map(
        (promise) => promiseWithTimeout(promise, MAX_RESPONSE_TIME_IN_MS),
      );
      Promise.allSettled(quotePromisesWithTimeout)
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
        }).then((responses) => {
          commit(constants.FLYOVER_PEGOUT_SET_QUOTES, quotesByProvider);
          responses.forEach((response) => {
            ApiService.logToServer({
              type: response.status === constants.FULFILLED
                ? LogEntryType.Success
                : LogEntryType.Error,
              operation: LogEntryOperation.PegoutFlyover,
              location: constants.FLYOVER_PEGOUT_GET_QUOTES,
              ...(response.status === constants.FULFILLED ? {} : { error: response.reason }),
            }).catch(() => undefined);
          });
          resolve();
        });
    });
  },
  [constants.FLYOVER_PEGOUT_USE_LIQUIDITY_PROVIDER]: ({ state }, providerId: number) => {
    state.flyoverService.useLiquidityProvider(providerId);
  },
  [constants.FLYOVER_PEGOUT_ACCEPT_AND_SEND_QUOTE]:
    ({
      state, getters, dispatch, commit,
    }, quoteHash: string) => new Promise<void>((resolve, reject) => {
      const providerId = getters[constants.FLYOVER_PEGOUT_GET_PROVIDER_ID](quoteHash);
      if (providerId === -1) {
        reject(new Error('No provider found for quote'));
      }
      dispatch(constants.FLYOVER_PEGOUT_USE_LIQUIDITY_PROVIDER, providerId)
        .then(() => dispatch(constants.FLYOVER_PEGOUT_GET_FINAL_QUOTE, { providerId, quoteHash }))
        .then(() => {
          if (state.difference.percentage > EnvironmentAccessorService.getEnvironmentVariables()
            .flyoverPegoutDiffPercentage) {
            return Promise.reject(new Error('Quote differences found: cannot accept quote'));
          }
          return state.flyoverService.acceptAndSendPegoutQuote(state.selectedQuoteHash);
        })
        .then(({ txHash, signature }) => {
          commit(constants.FLYOVER_PEGOUT_SET_TX_HASH, txHash);
          commit(constants.FLYOVER_PEGOUT_SET_ACCEPTED_QUOTE_SIGNATURE, signature);
        })
        .then(resolve)
        .catch(reject);
    }),
  [constants.FLYOVER_PEGOUT_ACCEPT_AND_SEND_QUOTE_WITH_CHANGED_CONDITIONS]:
    ({ state, commit }) => new Promise<void>((resolve, reject) => {
      commit(constants.FLYOVER_PEGOUT_SET_SELECTED_QUOTE, state.difference.currentQuote.quoteHash);
      state.flyoverService.acceptAndSendPegoutQuote(state.selectedQuoteHash)
        .then(({ txHash, signature }) => {
          commit(constants.FLYOVER_PEGOUT_SET_TX_HASH, txHash);
          commit(constants.FLYOVER_PEGOUT_SET_ACCEPTED_QUOTE_SIGNATURE, signature);
        })
        .then(resolve)
        .catch(reject);
    }),
  [constants.FLYOVER_PEGOUT_CLEAR_STATE]: ({ commit }) => {
    commit(constants.FLYOVER_PEGOUT_SET_CLEAR_STATE);
  },
  [constants.FLYOVER_PEGOUT_GET_FINAL_QUOTE]:
  (
    { state, commit, dispatch },
    { providerId, quoteHash },
  ) => new Promise<void>((resolve, reject) => {
    const currentQuote = state.quotes[providerId]
      .find((quote) => quote.quoteHash === quoteHash);
    if (!currentQuote) {
      reject(new Error('Quote not found'));
    }
    dispatch(constants.FLYOVER_PEGOUT_GET_QUOTES, currentQuote?.quote.rskRefundAddress ?? '')
      .then(() => {
        const reducedCurrentQuote = {
          callFee: currentQuote?.quote.callFee,
          gasFee: currentQuote?.quote.gasFee,
          productFeeAmount: currentQuote?.quote.productFeeAmount,
          value: currentQuote?.quote.value,
          quoteHash: currentQuote?.quoteHash,
        };
        state.quotes[providerId].forEach((quote2wp) => {
          const reducedNewQuote = {
            callFee: quote2wp.quote.callFee,
            gasFee: quote2wp.quote.gasFee,
            productFeeAmount: quote2wp.quote.productFeeAmount,
            value: quote2wp.quote.value,
            quoteHash: quote2wp.quoteHash,
          };
          const zeroWei = new WeiBig(0, 'wei');
          const currentQuoteTotal = (reducedCurrentQuote.callFee ?? zeroWei)
            .plus(reducedCurrentQuote.gasFee ?? zeroWei)
            .plus(reducedCurrentQuote.productFeeAmount ?? zeroWei)
            .plus(reducedCurrentQuote.value ?? zeroWei);
          const newQuoteTotal = (reducedNewQuote.callFee ?? zeroWei)
            .plus(reducedNewQuote.gasFee ?? zeroWei)
            .plus(reducedNewQuote.productFeeAmount ?? zeroWei)
            .plus(reducedNewQuote.value ?? zeroWei);
          const largest = newQuoteTotal
            .gt(currentQuoteTotal) ? newQuoteTotal : currentQuoteTotal;
          const minor = newQuoteTotal
            .gt(currentQuoteTotal) ? currentQuoteTotal : newQuoteTotal;
          const percentageDifference = ((largest.minus(minor)).mul('100')).div(largest.toRBTCString());
          if (Number(percentageDifference.toRBTCString()) <= EnvironmentAccessorService
            .getEnvironmentVariables().flyoverPegoutDiffPercentage) {
            commit(constants.FLYOVER_PEGOUT_SET_SELECTED_QUOTE, quote2wp.quoteHash);
          } else {
            commit(
              constants.FLYOVER_PEGOUT_SET_QUOTES_DIFFERENCE,
              {
                percentage: Number(percentageDifference.toRBTCString()),
                previousQuote: {
                  gasFee: reducedCurrentQuote.gasFee,
                  callFee: reducedCurrentQuote.callFee,
                  productFeeAmount: reducedCurrentQuote.productFeeAmount,
                  value: reducedCurrentQuote.value,
                  quoteHash: reducedCurrentQuote.quoteHash,
                } as ReducedQuote,
                currentQuote: {
                  gasFee: reducedNewQuote.gasFee,
                  callFee: reducedNewQuote.callFee,
                  productFeeAmount: reducedNewQuote.productFeeAmount,
                  value: reducedNewQuote.value,
                  quoteHash: reducedNewQuote.quoteHash,
                } as ReducedQuote,
              },
            );
          }
        });
        resolve();
      })
      .catch(reject);
  }),
  [constants.FLYOVER_PEGOUT_CLEAR_QUOTES]: ({ commit }) => {
    commit(constants.FLYOVER_PEGOUT_SET_QUOTES, {});
  },
  [constants.FLYOVER_PEGOUT_SET_SELECTED_QUOTE_HASH]: ({ commit }, quoteHash: string) => {
    commit(constants.FLYOVER_PEGOUT_SET_SELECTED_QUOTE, quoteHash);
  },
  [constants.FLYOVER_PEGOUT_CLEAR_QUOTE_DIFFERENCES]: ({ commit }) => {
    commit(constants.FLYOVER_PEGOUT_SET_QUOTES_DIFFERENCE, getClearObjectDifference());
  },
  [constants.FLYOVER_PEGOUT_GET_AVAILABLE_LIQUIDITY]:
  ({ state, dispatch, commit }) => new Promise((resolve, reject) => {
    const providersPromises:
      Promise<number | {
        providerId: number,
        peginLiquidity: WeiBig,
        pegoutLiquidity: WeiBig
      }>[] = [];
    state.liquidityProviders.forEach((provider) => {
      dispatch(constants.FLYOVER_PEGOUT_USE_LIQUIDITY_PROVIDER, provider.id);
      providersPromises.push(state.flyoverService.getAvailableLiquidity());
    });
    Promise.allSettled(providersPromises)
      .then((responses) => responses.forEach((response) => {
        if (response.status === constants.FULFILLED) {
          if (response.value instanceof Object) {
            const { providerId, pegoutLiquidity } = response.value;
            commit(
              constants.FLYOVER_PEGOUT_PROVIDERS_SET_AVAILABLE_LIQUIDITY,
              { providerId, pegoutLiquidity },
            );
          }
        }
      }))
      .then(resolve)
      .catch(reject);
  }),
  [constants.FLYOVER_PEGOUT_ACCEPT_QUOTE]:
  ({
    state, getters, dispatch,
  }, quoteHash: string) => new Promise<AcceptedPegoutQuote>((resolve, reject) => {
    const providerId = getters[constants.FLYOVER_PEGOUT_GET_PROVIDER_ID](quoteHash);
    if (providerId === -1) {
      reject(new Error('No provider found for quote'));
    }
    dispatch(constants.FLYOVER_PEGOUT_USE_LIQUIDITY_PROVIDER, providerId)
      .then(() => dispatch(constants.FLYOVER_PEGOUT_GET_FINAL_QUOTE, { providerId, quoteHash }))
      .then(() => {
        if (state.difference.percentage > EnvironmentAccessorService.getEnvironmentVariables()
          .flyoverPegoutDiffPercentage) {
          return Promise.reject(new Error('Quote differences found: cannot accept quote'));
        }
        return state.flyoverService.acceptPegoutQuote(state.selectedQuoteHash);
      })
      .then(resolve)
      .catch(reject);
  }),
  [constants.FLYOVER_PEGOUT_ESTIMATE_QUOTE_MAX_FEE]:
    (
      { state, rootState },
      { maxFlyoverTxValue, callEoaOrContractAddress, btcRecipientAddress },
    ) => new Promise((resolve) => {
      const provider = new providers.JsonRpcProvider(
        EnvironmentAccessorService.getEnvironmentVariables().vueAppRskNodeHost,
      );
      Promise.all([
        state.flyoverService
          .estimatePegoutMaxFee(maxFlyoverTxValue, callEoaOrContractAddress, btcRecipientAddress),
        provider?.estimateGas({
          from: callEoaOrContractAddress,
          to: rootState.pegOutTx?.pegoutConfiguration.bridgeContractAddress,
          value: maxFlyoverTxValue.toWeiString(),
        }),
        provider?.getGasPrice(),
      ])
        .then(([fee, gas, gasPrice]) => {
          const gasFee = new WeiBig(Number(gasPrice) * Number(gas), 'wei');
          return fee.plus(gasFee);
        })
        .then((fullFee: WeiBig) => resolve(fullFee))
        .catch(() => resolve(new WeiBig(0, 'wei')));
    }),
};
