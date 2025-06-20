import {
  FlyoverPeginState, QuotePegIn2WP, RootState, SatoshiBig,
  WeiBig, LogEntryType, LogEntryOperation,
} from '@/common/types';
import { ActionTree } from 'vuex';
import * as constants from '@/common/store/constants';
import { ApiService } from '@/common/services';
import {
  promiseWithTimeout, generateMockRSKAddress, toWeiBigIntString, bigIntToUserFormattedWei,
} from '@/common/utils';
import { EnvironmentAccessorService } from '@/common/services/enviroment-accessor.service';

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
        resolve(acceptedQuote);
      })
      .catch(reject);
  }),
  [constants.FLYOVER_PEGIN_ESTIMATE_MAX_VALUE]: (
    {
      state, rootState, rootGetters,
    },
  ) => new Promise((resolve) => {
    const provider = state.liquidityProviders
      .find((p) => p.id === EnvironmentAccessorService.getEnvironmentVariables().flyoverProviderId);
    state.flyoverService.useLiquidityProvider(provider?.id || 0);

    const maxTransactionValue = provider?.pegin.maxTransactionValue || new WeiBig(0, 'wei');
    let bigIntMaxTransactionValue = toWeiBigIntString(maxTransactionValue?.toRBTCString());
    if (bigIntMaxTransactionValue === '0') bigIntMaxTransactionValue = constants.BIGGEST_BIG_INT.toString();

    const callEoaOrContractAddress = rootState.web3Session?.account || generateMockRSKAddress();
    const selectedAccountBalance = rootGetters[`pegInTx/${constants.PEGIN_TX_GET_SELECTED_BALANCE}`];
    const accountBalance = new WeiBig(toWeiBigIntString(selectedAccountBalance.toBTCString()), 'wei');
    Promise.allSettled([
      state.flyoverService.estimatePeginMaxFee(maxTransactionValue, callEoaOrContractAddress),
      state.flyoverService.getAvailableLiquidity(),
    ])
      .then(([fullMaxFeeResult, liquidityResult]) => {
        const availableLiquidity = liquidityResult.status === constants.FULFILLED
          ? liquidityResult.value.peginLiquidity : new WeiBig(0, 'wei');
        let bigIntAvailableLiquidity = toWeiBigIntString(availableLiquidity.toRBTCString() || '0');
        if (bigIntAvailableLiquidity === '0') bigIntAvailableLiquidity = constants.BIGGEST_BIG_INT.toString();

        const maxFeeBtc = rootState.pegInTx?.maxFee || new SatoshiBig(0, 'satoshi');
        const maxFeeWei = new WeiBig(toWeiBigIntString(maxFeeBtc.toBTCString()), 'wei');
        const fullMaxFee = fullMaxFeeResult.status === constants.FULFILLED
          ? fullMaxFeeResult.value : new WeiBig(0, 'wei');
        const balanceMinusFlyoverFees = accountBalance.minus(fullMaxFee).minus(maxFeeWei);
        let bigIntBalanceMinusFlyoverFees = toWeiBigIntString(
          balanceMinusFlyoverFees.toRBTCString(),
        );
        if (bigIntBalanceMinusFlyoverFees === '0') bigIntBalanceMinusFlyoverFees = constants.BIGGEST_BIG_INT.toString();

        const maxBigIntValue = [
          BigInt(bigIntAvailableLiquidity),
          BigInt(bigIntMaxTransactionValue),
          BigInt(bigIntBalanceMinusFlyoverFees),
        ].reduce((min, current) => (current < min ? current : min));

        const satoshiMaxValue = new SatoshiBig(
          bigIntToUserFormattedWei(maxBigIntValue.toString()),
          'btc',
        );
        resolve(satoshiMaxValue);
      })
      .catch(() => {
        const zero = new SatoshiBig(0, 'satoshi');
        resolve(zero);
      });
  }),
};
