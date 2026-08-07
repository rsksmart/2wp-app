import { ActionContext } from 'vuex';
import { ethers, providers } from 'ethers';
import { toUtf8Bytes } from 'ethers/lib/utils';
import { actions } from '@/common/store/session/actions';
import * as constants from '@/common/store/constants';
import { getBtcAddressFromSignedMessage } from '@/common/utils';
import { EnvironmentAccessorService } from '@/common/services/enviroment-accessor.service';
import { RootState, SessionState } from '@/common/types';

type SessionActionContext = ActionContext<SessionState, RootState>;
type SessionActionHandler = (
  context: Partial<SessionActionContext>,
  payload?: unknown,
) => Promise<unknown>;

function callAction(
  name: string,
  context: Partial<SessionActionContext>,
  payload?: unknown,
): Promise<unknown> {
  const handler = actions[name] as unknown as SessionActionHandler;
  return Promise.resolve(handler(context, payload));
}

const initEnvironment = () => {
  EnvironmentAccessorService.initializeEnvironmentVariables({
    vueAppCoin: constants.BTC_NETWORK_TESTNET,
  });
};

/**
 * The connected account funds the peg-out, but the beneficiary Bitcoin address is derived
 * from whoever signed the message. A signature produced by any other key must therefore
 * never be allowed to set the beneficiary.
 */
const VICTIM_PRIVATE_KEY = '0x0000000000000000000000000000000000000000000000000000000000000001';
const ATTACKER_PRIVATE_KEY = '0x0000000000000000000000000000000000000000000000000000000000000002';

const MESSAGE_TO_BE_SIGNED = 'Sign this message to get your Bitcoin destination address';

describe(`${constants.SESSION_SIGN_MESSAGE} — beneficiary binding`, () => {
  const victim = new ethers.Wallet(VICTIM_PRIVATE_KEY);
  const attacker = new ethers.Wallet(ATTACKER_PRIVATE_KEY);
  const messageHash = ethers.utils.keccak256(toUtf8Bytes(MESSAGE_TO_BE_SIGNED));

  let commit: jest.Mock;

  beforeEach(() => {
    initEnvironment();
    commit = jest.fn();
  });

  function providerReturning(send: jest.Mock): providers.Web3Provider {
    return { send } as unknown as providers.Web3Provider;
  }

  function signAsConnectedAccount(wallet: ethers.Wallet): Promise<string> {
    return wallet.signMessage(ethers.utils.arrayify(messageHash));
  }

  it('derives and stores the Bitcoin address when the connected account signs', async () => {
    const signature = await signAsConnectedAccount(victim);
    const state = {
      account: victim.address,
      ethersProvider: providerReturning(jest.fn().mockResolvedValue(signature)),
    } as SessionState;

    await callAction(constants.SESSION_SIGN_MESSAGE, { commit, state }, MESSAGE_TO_BE_SIGNED);

    expect(commit).toHaveBeenCalledWith(
      constants.SESSION_SET_BTC_ACCOUNT,
      getBtcAddressFromSignedMessage(signature, messageHash),
    );
  });

  it('rejects a signature that recovers to an account other than the connected one', async () => {
    const injectedSignature = await signAsConnectedAccount(attacker);
    const state = {
      account: victim.address,
      ethersProvider: providerReturning(jest.fn().mockResolvedValue(injectedSignature)),
    } as SessionState;

    await expect(
      callAction(constants.SESSION_SIGN_MESSAGE, { commit, state }, MESSAGE_TO_BE_SIGNED),
    ).rejects.toThrow(/does not belong to the connected account/i);

    expect(commit).not.toHaveBeenCalledWith(
      constants.SESSION_SET_BTC_ACCOUNT,
      expect.anything(),
    );
  });

  it('never stores the attacker Bitcoin address when the attacker signature is injected', async () => {
    const injectedSignature = await signAsConnectedAccount(attacker);
    const attackerBtcAddress = getBtcAddressFromSignedMessage(injectedSignature, messageHash);
    const state = {
      account: victim.address,
      ethersProvider: providerReturning(jest.fn().mockResolvedValue(injectedSignature)),
    } as SessionState;

    await callAction(constants.SESSION_SIGN_MESSAGE, { commit, state }, MESSAGE_TO_BE_SIGNED)
      .catch(() => undefined);

    const committedAddresses = commit.mock.calls.map(([, payload]) => payload);
    expect(committedAddresses).not.toContain(attackerBtcAddress);
  });

  it('aborts when the connected account changes while the signature is pending', async () => {
    const signature = await signAsConnectedAccount(victim);
    const state = {
      account: victim.address,
      ethersProvider: undefined,
    } as SessionState;
    state.ethersProvider = providerReturning(jest.fn().mockImplementation(() => {
      state.account = attacker.address;
      return Promise.resolve(signature);
    }));

    await expect(
      callAction(constants.SESSION_SIGN_MESSAGE, { commit, state }, MESSAGE_TO_BE_SIGNED),
    ).rejects.toThrow(/account changed/i);

    expect(commit).not.toHaveBeenCalledWith(
      constants.SESSION_SET_BTC_ACCOUNT,
      expect.anything(),
    );
  });

  it('rejects when there is no connected account to bind the signature to', async () => {
    const signature = await signAsConnectedAccount(victim);
    const state = {
      account: undefined,
      ethersProvider: providerReturning(jest.fn().mockResolvedValue(signature)),
    } as SessionState;

    await expect(
      callAction(constants.SESSION_SIGN_MESSAGE, { commit, state }, MESSAGE_TO_BE_SIGNED),
    ).rejects.toThrow();

    expect(commit).not.toHaveBeenCalledWith(
      constants.SESSION_SET_BTC_ACCOUNT,
      expect.anything(),
    );
  });

  it('does nothing when no provider is connected', async () => {
    const state = { account: victim.address, ethersProvider: undefined } as SessionState;

    await callAction(constants.SESSION_SIGN_MESSAGE, { commit, state }, MESSAGE_TO_BE_SIGNED);

    expect(commit).not.toHaveBeenCalled();
  });

  it('asks the wallet to sign with the connected account as the signer', async () => {
    const signature = await signAsConnectedAccount(victim);
    const send = jest.fn().mockResolvedValue(signature);
    const state = {
      account: victim.address,
      ethersProvider: providerReturning(send),
    } as SessionState;

    await callAction(constants.SESSION_SIGN_MESSAGE, { commit, state }, MESSAGE_TO_BE_SIGNED);

    expect(send).toHaveBeenCalledWith('personal_sign', [messageHash, victim.address, '']);
  });
});

describe(`${constants.SESSION_CLEAR_IDENTITY} — identity and beneficiary cleanup`, () => {
  let commit: jest.Mock;
  let dispatch: jest.Mock;

  beforeEach(() => {
    initEnvironment();
    commit = jest.fn();
    dispatch = jest.fn().mockResolvedValue(undefined);
  });

  it('clears the derived Bitcoin beneficiary', async () => {
    await callAction(constants.SESSION_CLEAR_IDENTITY, { commit, dispatch });

    expect(commit).toHaveBeenCalledWith(constants.SESSION_SET_BTC_ACCOUNT, '');
  });

  it('clears the Flyover peg-out Bitcoin recipient', async () => {
    await callAction(constants.SESSION_CLEAR_IDENTITY, { commit, dispatch });

    expect(dispatch).toHaveBeenCalledWith(
      `flyoverPegout/${constants.FLYOVER_PEGOUT_ADD_BTC_ADDRESS}`,
      '',
      { root: true },
    );
  });

  it('clears the Rootstock recipient used by both peg-in flows', async () => {
    await callAction(constants.SESSION_CLEAR_IDENTITY, { commit, dispatch });

    expect(dispatch).toHaveBeenCalledWith(
      `flyoverPegin/${constants.FLYOVER_PEGIN_ADD_ROOTSTOCK_ADDRESS}`,
      '',
      { root: true },
    );
    expect(commit).toHaveBeenCalledWith(
      `pegInTx/${constants.PEGIN_TX_SET_RSK_ADDRESS}`,
      '',
      { root: true },
    );
  });

  it('clears quotes that were bound to the previous identity', async () => {
    await callAction(constants.SESSION_CLEAR_IDENTITY, { commit, dispatch });

    const dispatched = dispatch.mock.calls.map(([name]) => name);
    expect(dispatched).toContain(`flyoverPegout/${constants.FLYOVER_PEGOUT_CLEAR_QUOTES}`);
    expect(dispatched).toContain(`flyoverPegin/${constants.FLYOVER_PEGIN_CLEAR_QUOTES}`);
  });
});

describe(`${constants.SESSION_REVALIDATE_ACCOUNT} — recipient revalidation`, () => {
  const CONNECTED = '0x7E5F4552091A69125d5DfCb7b8C2659029395Bdf';
  const SUBSTITUTED = '0x2B5AD5c4795c026514f8317c7a215E218DcCD6cF';

  let commit: jest.Mock;
  let dispatch: jest.Mock;

  beforeEach(() => {
    initEnvironment();
    commit = jest.fn();
    dispatch = jest.fn().mockResolvedValue(undefined);
  });

  function stateWithAccounts(account: string | undefined, reported: string[]): SessionState {
    return {
      account,
      ethersProvider: {
        listAccounts: jest.fn().mockResolvedValue(reported),
      } as unknown as providers.Web3Provider,
    } as SessionState;
  }

  it('returns the connected account when the provider still reports it', async () => {
    const state = stateWithAccounts(CONNECTED, [CONNECTED]);

    await expect(
      callAction(constants.SESSION_REVALIDATE_ACCOUNT, { commit, dispatch, state }),
    ).resolves.toBe(CONNECTED);
  });

  it('accepts a checksum-case difference from the provider', async () => {
    const state = stateWithAccounts(CONNECTED, [CONNECTED.toLowerCase()]);

    await expect(
      callAction(constants.SESSION_REVALIDATE_ACCOUNT, { commit, dispatch, state }),
    ).resolves.toBe(CONNECTED);
  });

  it('rejects when the provider reports a different account', async () => {
    const state = stateWithAccounts(CONNECTED, [SUBSTITUTED]);

    await expect(
      callAction(constants.SESSION_REVALIDATE_ACCOUNT, { commit, dispatch, state }),
    ).rejects.toThrow(/account changed/i);
  });

  it('clears the identity when the provider reports a different account', async () => {
    const state = stateWithAccounts(CONNECTED, [SUBSTITUTED]);

    await callAction(constants.SESSION_REVALIDATE_ACCOUNT, { commit, dispatch, state })
      .catch(() => undefined);

    expect(dispatch).toHaveBeenCalledWith(constants.SESSION_CLEAR_IDENTITY);
  });

  it('rejects when the provider reports no account at all', async () => {
    const state = stateWithAccounts(CONNECTED, []);

    await expect(
      callAction(constants.SESSION_REVALIDATE_ACCOUNT, { commit, dispatch, state }),
    ).rejects.toThrow();
  });

  it('rejects when there is no connected account', async () => {
    const state = stateWithAccounts(undefined, [CONNECTED]);

    await expect(
      callAction(constants.SESSION_REVALIDATE_ACCOUNT, { commit, dispatch, state }),
    ).rejects.toThrow();
  });
});

describe(`${constants.WEB3_SESSION_GET_ACCOUNT} — account swap handling`, () => {
  const CONNECTED = '0x7E5F4552091A69125d5DfCb7b8C2659029395Bdf';
  const SUBSTITUTED = '0x2B5AD5c4795c026514f8317c7a215E218DcCD6cF';

  let commit: jest.Mock;
  let dispatch: jest.Mock;

  beforeEach(() => {
    initEnvironment();
    commit = jest.fn();
    dispatch = jest.fn().mockResolvedValue(undefined);
  });

  function contextFor(account: string, reported: string[]) {
    return {
      commit,
      dispatch,
      state: {
        account,
        ethersProvider: {
          listAccounts: jest.fn().mockResolvedValue(reported),
        } as unknown as providers.Web3Provider,
      } as SessionState,
    };
  }

  it('clears the identity when the account changes', async () => {
    await callAction(
      constants.WEB3_SESSION_GET_ACCOUNT,
      contextFor(CONNECTED, [SUBSTITUTED]),
    );

    expect(dispatch).toHaveBeenCalledWith(constants.SESSION_CLEAR_IDENTITY);
    expect(commit).toHaveBeenCalledWith(constants.SESSION_SET_ACCOUNT, SUBSTITUTED);
  });

  it('keeps the identity when the account is unchanged', async () => {
    await callAction(
      constants.WEB3_SESSION_GET_ACCOUNT,
      contextFor(CONNECTED, [CONNECTED]),
    );

    expect(dispatch).not.toHaveBeenCalledWith(constants.SESSION_CLEAR_IDENTITY);
  });
});

describe(`${constants.SESSION_SETUP_EVENTS} — wallet session listeners`, () => {
  let dispatch: jest.Mock;

  beforeEach(() => {
    initEnvironment();
    dispatch = jest.fn().mockResolvedValue(undefined);
  });

  function eip1193Provider() {
    const handlers: Record<string, (...args: unknown[]) => void> = {};
    const on = jest.fn((event: string, handler: (...args: unknown[]) => void) => {
      handlers[event] = handler;
    });
    return { handlers, on };
  }

  it('listens for account, chain and disconnect events on the wallet provider', async () => {
    const wallet = eip1193Provider();
    const state = {
      ethersProvider: { provider: wallet } as unknown as providers.Web3Provider,
    } as SessionState;

    await callAction(constants.SESSION_SETUP_EVENTS, { state, dispatch });

    expect(Object.keys(wallet.handlers).sort())
      .toEqual(['accountsChanged', 'chainChanged', 'disconnect']);
  });

  it('reloads the account when the wallet reports accountsChanged', async () => {
    const wallet = eip1193Provider();
    const state = {
      ethersProvider: { provider: wallet } as unknown as providers.Web3Provider,
    } as SessionState;

    await callAction(constants.SESSION_SETUP_EVENTS, { state, dispatch });
    wallet.handlers.accountsChanged();

    expect(dispatch).toHaveBeenCalledWith(constants.WEB3_SESSION_GET_ACCOUNT);
  });

  it('clears the identity when the wallet reports chainChanged', async () => {
    const wallet = eip1193Provider();
    const state = {
      ethersProvider: { provider: wallet } as unknown as providers.Web3Provider,
    } as SessionState;

    await callAction(constants.SESSION_SETUP_EVENTS, { state, dispatch });
    wallet.handlers.chainChanged();

    expect(dispatch).toHaveBeenCalledWith(constants.SESSION_CLEAR_IDENTITY);
  });

  it('clears the whole account on disconnect', async () => {
    const wallet = eip1193Provider();
    const state = {
      ethersProvider: { provider: wallet } as unknown as providers.Web3Provider,
    } as SessionState;

    await callAction(constants.SESSION_SETUP_EVENTS, { state, dispatch });
    wallet.handlers.disconnect();

    expect(dispatch).toHaveBeenCalledWith(constants.WEB3_SESSION_CLEAR_ACCOUNT);
  });

  it('still listens on the rLogin instance when one is present', async () => {
    const rLoginInstance = { on: jest.fn() };
    const state = {
      rLoginInstance,
      ethersProvider: undefined,
    } as unknown as SessionState;

    await callAction(constants.SESSION_SETUP_EVENTS, { state, dispatch });

    expect(rLoginInstance.on).toHaveBeenCalledWith('accountsChanged', expect.any(Function));
  });
});
