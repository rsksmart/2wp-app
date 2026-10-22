import { ActionContext } from 'vuex';
import { actions } from '@/pegout/store/FlyoverPegout/actions';
import * as constants from '@/common/store/constants';
import { EnvironmentAccessorService } from '@/common/services/enviroment-accessor.service';
import { ServiceError } from '@/common/utils';
import {
  FlyoverPegoutState, QuotePegOut2WP, RootState, WeiBig,
} from '@/common/types';

type FlyoverPegoutActionContext = ActionContext<FlyoverPegoutState, RootState>;
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
