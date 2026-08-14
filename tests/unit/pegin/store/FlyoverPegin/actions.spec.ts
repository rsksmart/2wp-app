import { ActionContext } from 'vuex';
import { actions } from '@/pegin/store/FlyoverPegin/actions';
import * as constants from '@/common/store/constants';
import { EnvironmentAccessorService } from '@/common/services/enviroment-accessor.service';
import { FlyoverPeginState, RootState, SatoshiBig } from '@/common/types';

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
