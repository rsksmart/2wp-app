import { ActionContext } from 'vuex';
import { actions } from '@/pegout/store/FlyoverPegout/actions';
import * as constants from '@/common/store/constants';
import { EnvironmentAccessorService } from '@/common/services/enviroment-accessor.service';
import { ServiceError } from '@/common/utils';
import {
  FlyoverPegoutState, QuotePegOut2WP, RootState, WeiBig,
} from '@/common/types';

jest.mock('@/common/services/BridgeService', () => ({
  BridgeService: jest.fn().mockImplementation(() => ({
    getFederationAddress: jest.fn().mockResolvedValue('2N1federationAddress'),
  })),
}));

type FlyoverPegoutActionContext =ActionContext<FlyoverPegoutState, RootState>;
type FlyoverPegoutActionHandler = (
  context: Partial<FlyoverPegoutActionContext>,
  payload?: unknown,
) => Promise<unknown>;

function callAction(
  name: string,
  context: Partial<FlyoverPegoutActionContext>,
  payload?: unknown,
): Promise<unknown> {
  const handler = actions[name] as unknown as FlyoverPegoutActionHandler;
  return Promise.resolve(handler(context, payload));
}

const PROVIDER_ID = 1;
const QUOTE_HASH = 'cached-quote-hash';

/**
 * The final refresh before sending re-requests the quotes of the selected provider.
 * An empty refresh must stop the flow: the cached quote is no longer offered.
 */
describe(`${constants.FLYOVER_PEGOUT_ACCEPT_AND_SEND_QUOTE} — empty final refresh`, () => {
  let commit: jest.Mock;
  let dispatch: jest.Mock;
  let acceptAndSendPegoutQuote: jest.Mock;
  let state: FlyoverPegoutState;

  beforeEach(() => {
    EnvironmentAccessorService.initializeEnvironmentVariables({
      vueAppCoin: constants.BTC_NETWORK_TESTNET,
    });
    commit = jest.fn();
    acceptAndSendPegoutQuote = jest.fn()
      .mockResolvedValue({ txHash: '0xhash', signature: 'signature' });
    const cachedQuote = {
      quoteHash: QUOTE_HASH,
      quote: {
        callFee: new WeiBig(1, 'wei'),
        gasFee: new WeiBig(1, 'wei'),
        value: new WeiBig(1, 'wei'),
        rskRefundAddress: '0x7E5F4552091A69125d5DfCb7b8C2659029395Bdf',
      },
    } as unknown as QuotePegOut2WP;
    state = {
      quotes: { [PROVIDER_ID]: [cachedQuote] },
      selectedQuoteHash: QUOTE_HASH,
      difference: { percentage: 0 },
      flyoverService: { acceptAndSendPegoutQuote },
    } as unknown as FlyoverPegoutState;
    dispatch = jest.fn().mockImplementation((name: string, payload: unknown) => {
      if (name === constants.FLYOVER_PEGOUT_GET_FINAL_QUOTE) {
        return callAction(name, { state, commit, dispatch }, payload);
      }
      if (name === constants.FLYOVER_PEGOUT_GET_QUOTES) {
        state.quotes = { [PROVIDER_ID]: [] };
      }
      return Promise.resolve(undefined);
    });
  });

  it('rejects without accepting or depositing when the selected provider returns no quotes', async () => {
    const getters = { [constants.FLYOVER_PEGOUT_GET_PROVIDER_ID]: () => PROVIDER_ID };

    const error = await callAction(
      constants.FLYOVER_PEGOUT_ACCEPT_AND_SEND_QUOTE,
      {
        state, getters, commit, dispatch,
      } as unknown as Partial<FlyoverPegoutActionContext>,
      QUOTE_HASH,
    ).catch((e: unknown) => e);

    // The form only opens its error dialog for a ServiceError.
    expect(error).toBeInstanceOf(ServiceError);
    expect((error as ServiceError).userMessage)
      .toBe('No quotes are available right now. Refresh the options and try again.');
    expect(acceptAndSendPegoutQuote).not.toHaveBeenCalled();
    expect(commit).not.toHaveBeenCalledWith(
      constants.FLYOVER_PEGOUT_SET_TX_HASH,
      expect.anything(),
    );
  });
});

/**
 * The form re-searches on every input change, so two searches can overlap and finish out of
 * order. Only the most recent one may commit; an older one must not overwrite its quotes.
 */
describe(`${constants.FLYOVER_PEGOUT_GET_QUOTES} — overlapping searches`, () => {
  function deferred<T>() {
    let resolve!: (value: T) => void;
    const promise = new Promise<T>((res) => { resolve = res; });
    return { promise, resolve };
  }

  it('does not let an older search overwrite the quotes of a newer one', async () => {
    EnvironmentAccessorService.initializeEnvironmentVariables({
      vueAppCoin: constants.BTC_NETWORK_TESTNET,
    });
    const commit = jest.fn();
    const dispatch = jest.fn().mockResolvedValue(undefined);
    const olderSearch = deferred<QuotePegOut2WP[]>();
    const newerSearch = deferred<QuotePegOut2WP[]>();
    const getPegoutQuotes = jest.fn()
      .mockReturnValueOnce(olderSearch.promise)
      .mockReturnValueOnce(newerSearch.promise);
    const state = {
      liquidityProviders: [{ id: 1 }],
      btcRecipientAddress: 'tb1qrecipient',
      amountToTransfer: new WeiBig(1, 'wei'),
      flyoverService: { getPegoutQuotes, useLiquidityProvider: jest.fn() },
    } as unknown as FlyoverPegoutState;
    const search = () => callAction(
      constants.FLYOVER_PEGOUT_GET_QUOTES,
      { commit, dispatch, state },
      '0x7E5F4552091A69125d5DfCb7b8C2659029395Bdf',
    );
    const olderQuote = { quoteHash: 'older' } as unknown as QuotePegOut2WP;
    const newerQuote = { quoteHash: 'newer' } as unknown as QuotePegOut2WP;

    const older = search();
    const newer = search();
    // Let both actions get past their awaited federation address lookup.
    await new Promise((resolve) => { setTimeout(resolve, 0); });
    newerSearch.resolve([newerQuote]);
    await newer;
    olderSearch.resolve([olderQuote]);
    await older;

    expect(commit).toHaveBeenCalledTimes(1);
    expect(commit).toHaveBeenCalledWith(constants.FLYOVER_PEGOUT_SET_QUOTES, { 1: [newerQuote] });
  });
});
