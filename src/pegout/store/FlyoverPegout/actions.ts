import {
  FlyoverPegoutState, QuotePegOut2WP, RootState, WeiBig, PegOutTxState,
} from '@/common/types';
import { ActionTree } from 'vuex';
import * as constants from '@/common/store/constants';
import { BridgeService } from '@/common/services/BridgeService';
import {
  getClearQuoteFeeDifference, promiseWithTimeout, requiresFeeApproval, ServiceError,
  toReducedQuote,
} from '@/common/utils';
import { FlyoverService } from '@/common/services';
import { EnvironmentAccessorService } from '@/common/services/enviroment-accessor.service';
import { captureError } from '@/sentry';
import { providers } from 'ethers';
import { AcceptedPegoutQuote } from '@rsksmart/flyover-sdk';

// Quote requests can overlap when the amount or the BTC address changes again before the
// liquidity provider answers, and the SDK cannot cancel a request. Only the latest request
// may store its quotes.
let latestQuotesRequest = 0;

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
          resolve();
        })
        .catch((e) => {
          captureError(e, { source: constants.FLYOVER_PEGOUT_GET_PROVIDERS });
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
  ): Promise<boolean> => {
    latestQuotesRequest += 1;
    const request = latestQuotesRequest;
    const bridgeService = new BridgeService();
    const tempBtcAddress = await bridgeService.getFederationAddress();
    return new Promise<boolean>((resolve) => {
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
          if (request !== latestQuotesRequest) {
            resolve(false);
            return;
          }
          responses.forEach((response, index) => {
            if (response.status === constants.FULFILLED) {
              quotesByProvider = {
                ...quotesByProvider,
                [state.liquidityProviders[index].id]: response.value,
              };
            }
          });
          commit(constants.FLYOVER_PEGOUT_SET_QUOTES, quotesByProvider);
          resolve(true);
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
          if (state.difference.requiresApproval) {
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
      commit(constants.FLYOVER_PEGOUT_SET_SELECTED_QUOTE, state.difference.finalQuote.quoteHash);
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
    const approvedQuote = state.quotes[providerId]
      .find((quote) => quote.quoteHash === quoteHash);
    if (!approvedQuote) {
      reject(new Error('Quote not found'));
      return;
    }
    commit(constants.FLYOVER_PEGOUT_SET_QUOTES_DIFFERENCE, getClearQuoteFeeDifference());
    dispatch(constants.FLYOVER_PEGOUT_GET_QUOTES, approvedQuote.quote.rskRefundAddress)
      .then((stored: boolean) => {
        // A newer request replaced these quotes, so state.quotes is not the final quote.
        if (!stored) {
          reject(new ServiceError(
            'FlyoverPegout',
            constants.FLYOVER_PEGOUT_GET_FINAL_QUOTE,
            'The options changed while sending. Check them and press Send again.',
            'A newer quote request replaced the final quote',
          ));
          return;
        }
        // The SDK already rejects a quote for another amount; this keeps the app from relying
        // on it. The amount is the user's own input, so there is nothing to approve.
        const amountChanged = state.quotes[providerId]
          .some((quote2wp) => !quote2wp.quote.value.eq(approvedQuote.quote.value));
        if (amountChanged) {
          reject(new ServiceError(
            'FlyoverPegout',
            constants.FLYOVER_PEGOUT_GET_FINAL_QUOTE,
            'The new option is for a different amount. Refresh the options and try again.',
            'Final quote value differs from the approved quote',
          ));
          return;
        }
        const reducedApprovedQuote = toReducedQuote(approvedQuote);
        const tolerancePercentage = EnvironmentAccessorService.getEnvironmentVariables()
          .flyoverPegoutDiffPercentage;
        state.quotes[providerId].forEach((quote2wp) => {
          const reducedFinalQuote = toReducedQuote(quote2wp);
          if (requiresFeeApproval(reducedApprovedQuote, reducedFinalQuote, tolerancePercentage)) {
            commit(constants.FLYOVER_PEGOUT_SET_QUOTES_DIFFERENCE, {
              requiresApproval: true,
              approvedQuote: reducedApprovedQuote,
              finalQuote: reducedFinalQuote,
            });
          } else {
            commit(constants.FLYOVER_PEGOUT_SET_SELECTED_QUOTE, quote2wp.quoteHash);
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
    commit(constants.FLYOVER_PEGOUT_SET_QUOTES_DIFFERENCE, getClearQuoteFeeDifference());
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
        if (state.difference.requiresApproval) {
          return Promise.reject(new Error('Quote differences found: cannot accept quote'));
        }
        return state.flyoverService.acceptPegoutQuote(state.selectedQuoteHash);
      })
      .then(resolve)
      .catch(reject);
  }),
  [constants.FLYOVER_PEGOUT_ESTIMATE_MAX_VALUE]:
    (
      { state, rootState, dispatch },
    ) => new Promise<WeiBig>((resolve, reject) => {
      const pegOutTxState = rootState.pegOutTx as PegOutTxState;
      const { pegoutConfiguration } = pegOutTxState;
      const { flyoverProviderId } = EnvironmentAccessorService
        .getEnvironmentVariables();
      const provider = state.liquidityProviders
        .find((p) => p.id === flyoverProviderId);
      if (!provider) {
        reject(new Error('No provider found'));
        return;
      }
      Promise.all([
        dispatch(
          constants.FLYOVER_PEGOUT_USE_LIQUIDITY_PROVIDER,
          flyoverProviderId,
        ),
        FlyoverService.getDepositPegoutGas(),
      ])
        .then(([, gas]) => {
          const maxValueToSend = rootState.web3Session?.balance.safeMinus(gas) as WeiBig;
          const minAllowedValue = WeiBig.max(
            provider.pegout.minTransactionValue,
            pegoutConfiguration.minValue,
          );
          const maxAllowedValue = WeiBig.min(
            provider.pegout.maxTransactionValue,
            maxValueToSend,
          );

          if (maxValueToSend.lt(minAllowedValue) || maxValueToSend.gt(maxAllowedValue)) {
            const errorMessage = 'Balance is not within the provider allowed range: '
              + `${minAllowedValue.toRBTCTrimmedString()} - `
              + `${provider.pegout.maxTransactionValue.toRBTCTrimmedString()}`;
            return Promise.reject(new Error(errorMessage));
          }
          return state.flyoverService.estimateRecommendedPegout(
            maxValueToSend,
            state.btcRecipientAddress ?? '',
          );
        })
        .then(resolve)
        .catch(reject);
    }),
};
