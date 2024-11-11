import {
  FlyoverPegoutState, QuotePegOut2WP, RootState, WeiBig,
  FlyoverCall, LiquidityProvider2WP, TxStatusType,
} from '@/common/types';
import { ActionTree } from 'vuex';
import * as constants from '@/common/store/constants';
import { BridgeService } from '@/common/services/BridgeService';
import { promiseWithTimeout } from '@/common/utils';
import { ApiService } from '@/common/services';
import { EnvironmentAccessorService } from '@/common/services/enviroment-accessor.service';

export const actions: ActionTree<FlyoverPegoutState, RootState> = {
  [constants.FLYOVER_PEGOUT_INIT]: async ({ state, dispatch }) => new Promise((resolve, reject) => {
    state.flyoverService.initialize()
      .then(() => dispatch(constants.FLYOVER_PEGOUT_GET_PROVIDERS))
      .then(resolve)
      .catch(reject);
  }),
  [constants.FLYOVER_PEGOUT_GET_PROVIDERS]: async ({
    state,
    commit,
  }) => new Promise((resolve, reject) => {
    let result = constants.FlyoverCallResult.ERROR;
    const flyoverCallPayload = {
      operationType: TxStatusType.FLYOVER_PEGOUT,
      functionType: constants.FlyoverCallFunction.LPS,
    };
    (async () => {
      try {
        const providers: LiquidityProvider2WP[] = await promiseWithTimeout(
          state.flyoverService.getProviders(),
          EnvironmentAccessorService.getEnvironmentVariables().flyoverGetProvidersTimeout,
        );
        result = constants.FlyoverCallResult.SUCCESS;
        resolve(commit(constants.FLYOVER_PEGOUT_SET_PROVIDERS, providers));
      } catch (e) {
        reject();
      } finally {
        try {
          await ApiService.registerFlyoverCall({ ...flyoverCallPayload, result } as FlyoverCall);
        } catch (e) {
          console.error(`Error registering flyover ${flyoverCallPayload.functionType} call: ${e}`);
        }
      }
    })();
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
    return new Promise<void>((resolve, reject) => {
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
      let result = constants.FlyoverCallResult.ERROR;
      const flyoverCallPayload = {
        operationType: TxStatusType.FLYOVER_PEGOUT,
        functionType: constants.FlyoverCallFunction.QUOTE,
      };
      (async () => {
        try {
          const responses = await Promise.allSettled(quotePromisesWithTimeout);
          responses.forEach((response, index) => {
            if (response.status === constants.FULFILLED) {
              quotesByProvider = {
                ...quotesByProvider,
                [state.liquidityProviders[index].id]: response.value,
              };
            }
          });
          result = constants.FlyoverCallResult.SUCCESS;
          commit(constants.FLYOVER_PEGOUT_SET_QUOTES, quotesByProvider);
          resolve();
        } catch (e) {
          reject();
        } finally {
          try {
            await ApiService.registerFlyoverCall({ ...flyoverCallPayload, result } as FlyoverCall);
          } catch (e) {
            console.error(`Error registering flyover ${flyoverCallPayload.functionType} call: ${e}`);
          }
        }
      })();
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
          if (state.difference > EnvironmentAccessorService.getEnvironmentVariables()
            .flyoverPegoutDiffPercentage) {
            return Promise.reject(new Error('Quote differences found: cannot accept quote'));
          }
          return state.flyoverService.acceptAndSendPegoutQuote(state.selectedQuoteHash);
        })
        .then((txHash) => commit(constants.FLYOVER_PEGOUT_SET_TX_HASH, txHash))
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
          penaltyFee: currentQuote?.quote.penaltyFee,
          productFeeAmount: currentQuote?.quote.productFeeAmount,
          value: currentQuote?.quote.value,
        };
        state.quotes[providerId].forEach((quote2wp) => {
          const reducedNewQuote = {
            callFee: quote2wp.quote.callFee,
            gasFee: quote2wp.quote.gasFee,
            penaltyFee: quote2wp.quote.penaltyFee,
            productFeeAmount: quote2wp.quote.productFeeAmount,
            value: quote2wp.quote.value,
          };
          const zeroWei = new WeiBig(0, 'wei');
          const currentQuoteTotalFee = (reducedCurrentQuote.callFee ?? zeroWei)
            .plus(reducedCurrentQuote.gasFee ?? zeroWei)
            .plus(reducedCurrentQuote.penaltyFee ?? zeroWei)
            .plus(reducedCurrentQuote.productFeeAmount ?? zeroWei)
            .plus(reducedCurrentQuote.value ?? zeroWei);
          const newQuoteTotalFee = (reducedNewQuote.callFee ?? zeroWei)
            .plus(reducedNewQuote.gasFee ?? zeroWei)
            .plus(reducedNewQuote.penaltyFee ?? zeroWei)
            .plus(reducedNewQuote.productFeeAmount ?? zeroWei)
            .plus(reducedNewQuote.value ?? zeroWei);
          const largest = newQuoteTotalFee
            .gt(currentQuoteTotalFee) ? newQuoteTotalFee : currentQuoteTotalFee;
          const minor = newQuoteTotalFee
            .gt(currentQuoteTotalFee) ? currentQuoteTotalFee : newQuoteTotalFee;
          const difference = ((largest.minus(minor)).mul('100')).div(largest.toRBTCString());
          if (+difference.toRBTCString() <= EnvironmentAccessorService.getEnvironmentVariables()
            .flyoverPegoutDiffPercentage) {
            commit(constants.FLYOVER_PEGOUT_SET_SELECTED_QUOTE, quote2wp.quoteHash);
          } else {
            commit(constants.FLYOVER_PEGOUT_SET_QUOTES_DIFFERENCE, +difference.toRBTCString());
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
    commit(constants.FLYOVER_PEGOUT_SET_QUOTES_DIFFERENCE, 0);
  },
};
