import {
  FlyoverPeginState, QuotePegIn2WP, RootState, SatoshiBig,
  FlyoverCall, TxStatusType,
} from '@/common/types';
import { ActionTree } from 'vuex';
import * as constants from '@/common/store/constants';
import { ApiService } from '@/common/services';

export const actions: ActionTree<FlyoverPeginState, RootState> = {
  [constants.FLYOVER_PEGIN_INIT]: ({ state, dispatch }) => new Promise((resolve, reject) => {
    state.flyoverService.initialize()
      .then(() => dispatch(constants.FLYOVER_PEGIN_GET_PROVIDERS))
      .then(resolve)
      .catch(reject);
  }),
  [constants.FLYOVER_PEGIN_GET_PROVIDERS]: ({ state, commit }) => new Promise((resolve, reject) => {
    let result = constants.FlyoverCallResult.ERROR;
    const flyoverCallPayload = {
      operationType: TxStatusType.FLYOVER_PEGIN,
      functionType: constants.FlyoverCallFunction.LPS,
    };

    (async () => {
      try {
        const providers = await state.flyoverService.getProviders();
        result = constants.FlyoverCallResult.SUCCESS;
        resolve(commit(constants.FLYOVER_PEGIN_SET_PROVIDERS, providers));
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
  [constants.FLYOVER_PEGIN_ADD_AMOUNT]: ({ commit }, amount: SatoshiBig) => {
    commit(constants.FLYOVER_PEGIN_SET_AMOUNT, amount);
  },
  [constants.FLYOVER_PEGIN_ADD_ROOTSTOCK_ADDRESS]: ({ commit }, address: string) => {
    commit(constants.FLYOVER_PEGIN_SET_ROOTSTOCK_ADDRESS, address);
  },
  [constants.FLYOVER_PEGIN_USE_LIQUIDITY_PROVIDER]: ({ state }, providerId: number) => {
    state.flyoverService.useLiquidityProvider(providerId);
  },
  [constants.FLYOVER_PEGIN_GET_QUOTES]:
  (
    { state, commit, dispatch },
    { rootstockRecipientAddress, bitcoinRefundAddress },
  ) => new Promise((resolve, reject) => {
    const quotePromises: Promise<QuotePegIn2WP[]>[] = [];
    state.liquidityProviders.forEach((provider) => {
      dispatch(constants.FLYOVER_PEGIN_USE_LIQUIDITY_PROVIDER, provider.id);
      quotePromises.push(state.flyoverService.getPeginQuotes(
        rootstockRecipientAddress,
        bitcoinRefundAddress,
        state.amountToTransfer,
      ));
    });
    let quotesByProvider: Record<number, QuotePegIn2WP[]> = {};
    let result = constants.FlyoverCallResult.ERROR;
    const flyoverCallPayload = {
      operationType: TxStatusType.FLYOVER_PEGIN,
      functionType: constants.FlyoverCallFunction.QUOTE,
    };
    (async () => {
      try {
        const responses = await Promise.allSettled(quotePromises);
        responses.forEach((response, index) => {
          if (response.status === constants.FULFILLED) {
            quotesByProvider = {
              ...quotesByProvider,
              [state.liquidityProviders[index].id]: response.value,
            };
          }
        });
        result = constants.FlyoverCallResult.SUCCESS;
        resolve(commit(constants.FLYOVER_PEGIN_SET_QUOTES, quotesByProvider));
      } catch (e) {
        reject(e);
      } finally {
        try {
          await ApiService.registerFlyoverCall({ ...flyoverCallPayload, result } as FlyoverCall);
        } catch (e) {
          console.error(`Error registering flyover ${flyoverCallPayload.functionType} call: ${e}`);
        }
      }
    })();
  }),
  [constants.FLYOVER_PEGIN_ADD_SELECTED_QUOTE]: ({ commit }, quoteHash: string) => {
    commit(constants.FLYOVER_PEGIN_SET_SELECTED_QUOTE, quoteHash);
  },
  [constants.FLYOVER_PEGIN_CLEAR_QUOTES]: ({ commit }) => {
    commit(constants.FLYOVER_PEGIN_SET_QUOTES, {});
  },
};
