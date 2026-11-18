import { ActionContext } from 'vuex';
import { actions } from '@/pegin/store/FlyoverPegin/actions';
import * as constants from '@/common/store/constants';
import { EnvironmentAccessorService } from '@/common/services/enviroment-accessor.service';
import {
  FlyoverPeginState, QuotePegIn2WP, RootState, SatoshiBig,
} from '@/common/types';

type FlyoverPeginActionContext = ActionContext<FlyoverPeginState, RootState>;
type FlyoverPeginActionHandler = (
  context: Partial<FlyoverPeginActionContext>,
  payload?: unknown,
) => Promise<unknown>;

function callAction(
  name: string,
  context: Partial<FlyoverPeginActionContext>,
  payload?: unknown,
): Promise<unknown> {
  const handler = actions[name] as unknown as FlyoverPeginActionHandler;
  return Promise.resolve(handler(context, payload));
}

const initEnvironment = () => {
  EnvironmentAccessorService.initializeEnvironmentVariables({
    vueAppCoin: constants.BTC_NETWORK_TESTNET,
  });
};

const RECIPIENT = '0x7E5F4552091A69125d5DfCb7b8C2659029395Bdf';

/**
 * The Fast PegIn quote binds `rskRefundAddress` and `callEoaOrContractAddress`,
 * so the connected account must be revalidated before any quote is requested for it.
 */
describe(`${constants.FLYOVER_PEGIN_GET_QUOTES} — recipient revalidation`, () => {
  let commit: jest.Mock;
  let dispatch: jest.Mock;
  let getPeginQuotes: jest.Mock;

  beforeEach(() => {
    initEnvironment();
    commit = jest.fn();
    getPeginQuotes = jest.fn().mockResolvedValue([]);
  });

  function stateWithOneProvider(): FlyoverPeginState {
    return {
      liquidityProviders: [{ id: 1 }],
      amountToTransfer: new SatoshiBig(0, 'satoshi'),
      flyoverService: { getPeginQuotes, useLiquidityProvider: jest.fn() },
    } as unknown as FlyoverPeginState;
  }

  it('revalidates the connected account before requesting quotes', async () => {
    dispatch = jest.fn().mockResolvedValue(undefined);
    const state = stateWithOneProvider();

    await callAction(
      constants.FLYOVER_PEGIN_GET_QUOTES,
      { commit, dispatch, state },
      { rootstockRecipientAddress: RECIPIENT },
    );

    expect(dispatch).toHaveBeenCalledWith(
      `web3Session/${constants.SESSION_REVALIDATE_ACCOUNT}`,
      undefined,
      { root: true },
    );
  });

  it('does not request quotes when the connected account failed revalidation', async () => {
    dispatch = jest.fn().mockImplementation((name: string) => {
      if (name === `web3Session/${constants.SESSION_REVALIDATE_ACCOUNT}`) {
        return Promise.reject(new Error('Account changed'));
      }
      return Promise.resolve(undefined);
    });
    const state = stateWithOneProvider();

    await expect(callAction(
      constants.FLYOVER_PEGIN_GET_QUOTES,
      { commit, dispatch, state },
      { rootstockRecipientAddress: RECIPIENT },
    )).rejects.toThrow();

    expect(getPeginQuotes).not.toHaveBeenCalled();
    expect(commit).not.toHaveBeenCalledWith(
      constants.FLYOVER_PEGIN_SET_QUOTES,
      expect.anything(),
    );
  });

  it('still stores quotes on the happy path', async () => {
    dispatch = jest.fn().mockResolvedValue(undefined);
    const state = stateWithOneProvider();

    await callAction(
      constants.FLYOVER_PEGIN_GET_QUOTES,
      { commit, dispatch, state },
      { rootstockRecipientAddress: RECIPIENT },
    );

    expect(getPeginQuotes).toHaveBeenCalledWith(RECIPIENT, state.amountToTransfer);
    expect(commit).toHaveBeenCalledWith(constants.FLYOVER_PEGIN_SET_QUOTES, { 1: [] });
  });
});

describe(`${constants.FLYOVER_PEGIN_GET_QUOTES} — provider response time`, () => {
  const RESPONDING_PROVIDER_ID = 1;
  const SILENT_PROVIDER_ID = 2;
  const { setImmediate: realSetImmediate } = jest.requireActual<typeof import('timers')>('timers');
  const flushPromises = () => new Promise<void>((resolve) => { realSetImmediate(resolve); });

  beforeEach(() => {
    initEnvironment();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('stores the quotes of the providers that respond when another one does not', async () => {
    const respondingQuote = { quoteHash: '0x01' };
    let selectedProviderId = 0;
    const dispatch = jest.fn().mockImplementation((name: string, providerId?: number) => {
      if (name === constants.FLYOVER_PEGIN_USE_LIQUIDITY_PROVIDER) {
        selectedProviderId = providerId as number;
      }
      return Promise.resolve(undefined);
    });
    const getPeginQuotes = jest.fn().mockImplementation(() => {
      if (selectedProviderId === RESPONDING_PROVIDER_ID) {
        return Promise.resolve([respondingQuote]);
      }
      return new Promise(() => { /* never settles */ });
    });
    const commit = jest.fn();
    const state = {
      liquidityProviders: [{ id: RESPONDING_PROVIDER_ID }, { id: SILENT_PROVIDER_ID }],
      amountToTransfer: new SatoshiBig(0, 'satoshi'),
      flyoverService: { getPeginQuotes, useLiquidityProvider: jest.fn() },
    } as unknown as FlyoverPeginState;
    let settled = false;

    callAction(
      constants.FLYOVER_PEGIN_GET_QUOTES,
      { commit, dispatch, state },
      { rootstockRecipientAddress: RECIPIENT },
    ).then(() => { settled = true; });
    await flushPromises();
    jest.advanceTimersByTime(constants.FLYOVER_QUOTES_MAX_RESPONSE_TIME_IN_MS);
    await flushPromises();

    expect(getPeginQuotes).toHaveBeenCalledTimes(2);
    expect(settled).toBe(true);
    expect(commit).toHaveBeenCalledWith(
      constants.FLYOVER_PEGIN_SET_QUOTES,
      { [RESPONDING_PROVIDER_ID]: [respondingQuote] },
    );
  });
});

/**
 * The form re-searches on every input change, so two searches can overlap and finish out of
 * order. Only the most recent one may commit; an older one must not overwrite its quotes.
 */
describe(`${constants.FLYOVER_PEGIN_GET_QUOTES} — overlapping searches`, () => {
  function deferred<T>() {
    let resolve!: (value: T) => void;
    const promise = new Promise<T>((res) => { resolve = res; });
    return { promise, resolve };
  }

  it('does not let an older search overwrite the quotes of a newer one', async () => {
    initEnvironment();
    const commit = jest.fn();
    const dispatch = jest.fn().mockResolvedValue(undefined);
    const olderSearch = deferred<QuotePegIn2WP[]>();
    const newerSearch = deferred<QuotePegIn2WP[]>();
    const getPeginQuotes = jest.fn()
      .mockReturnValueOnce(olderSearch.promise)
      .mockReturnValueOnce(newerSearch.promise);
    const state = {
      liquidityProviders: [{ id: 1 }],
      amountToTransfer: new SatoshiBig(0, 'satoshi'),
      flyoverService: { getPeginQuotes, useLiquidityProvider: jest.fn() },
    } as unknown as FlyoverPeginState;
    const search = () => callAction(
      constants.FLYOVER_PEGIN_GET_QUOTES,
      { commit, dispatch, state },
      { rootstockRecipientAddress: RECIPIENT },
    );
    const olderQuote = { quoteHash: 'older' } as unknown as QuotePegIn2WP;
    const newerQuote = { quoteHash: 'newer' } as unknown as QuotePegIn2WP;

    const older = search();
    const newer = search();
    newerSearch.resolve([newerQuote]);
    await newer;
    olderSearch.resolve([olderQuote]);
    await older;

    expect(commit).toHaveBeenCalledTimes(1);
    expect(commit).toHaveBeenCalledWith(constants.FLYOVER_PEGIN_SET_QUOTES, { 1: [newerQuote] });
  });

  it('orders searches by invocation, not by when the account revalidation finishes', async () => {
    initEnvironment();
    const commit = jest.fn();
    const olderRevalidation = deferred<void>();
    const newerRevalidation = deferred<void>();
    const revalidations = [olderRevalidation, newerRevalidation];
    const dispatch = jest.fn().mockImplementation((name: string) => (
      name === `web3Session/${constants.SESSION_REVALIDATE_ACCOUNT}`
        ? revalidations.shift()?.promise
        : Promise.resolve(undefined)
    ));
    const olderQuote = { quoteHash: 'older' } as unknown as QuotePegIn2WP;
    const newerQuote = { quoteHash: 'newer' } as unknown as QuotePegIn2WP;
    const getPeginQuotes = jest.fn()
      .mockResolvedValueOnce([newerQuote])
      .mockResolvedValueOnce([olderQuote]);
    const state = {
      liquidityProviders: [{ id: 1 }],
      amountToTransfer: new SatoshiBig(0, 'satoshi'),
      flyoverService: { getPeginQuotes, useLiquidityProvider: jest.fn() },
    } as unknown as FlyoverPeginState;
    const search = () => callAction(
      constants.FLYOVER_PEGIN_GET_QUOTES,
      { commit, dispatch, state },
      { rootstockRecipientAddress: RECIPIENT },
    );

    const older = search();
    const newer = search();
    newerRevalidation.resolve();
    await newer;
    olderRevalidation.resolve();
    await older;

    expect(commit).toHaveBeenCalledTimes(1);
    expect(commit).toHaveBeenCalledWith(constants.FLYOVER_PEGIN_SET_QUOTES, { 1: [newerQuote] });
  });
});
