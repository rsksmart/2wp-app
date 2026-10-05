import { createStore, Store } from 'vuex';
import { ethers } from 'ethers';
import { toUtf8Bytes } from 'ethers/lib/utils';
import * as constants from '@/common/store/constants';
import { EnvironmentAccessorService } from '@/common/services/enviroment-accessor.service';
import { web3Session } from '@/common/store/session';
import { pegInTx } from '@/pegin/store/PeginTx';
import { flyoverPegin } from '@/pegin/store/FlyoverPegin';
import { flyoverPegout } from '@/pegout/store/FlyoverPegout';
import {
  FlyoverPeginState, FlyoverPegoutState, PegInTxState, RootState, SessionState,
} from '@/common/types';

/**
 * Cross-origin response substitution has to be blocked at two independent layers:
 *  1. the transport must reject a `postMessage` response from an unrelated origin, and
 *  2. the app must not derive the Bitcoin beneficiary from a response without checking
 *     the signer against the connected account.
 *
 * These tests pin both: the first group drives the installed Trezor Connect message handler
 * with a foreign-origin response, the second drives a real store with an injected signature.
 */

const TRUSTED_ORIGIN = 'https://connect.trezor.io';
const ATTACKER_ORIGIN = 'https://attacker.example';

const VICTIM_PRIVATE_KEY = '0x0000000000000000000000000000000000000000000000000000000000000001';
const ATTACKER_PRIVATE_KEY = '0x0000000000000000000000000000000000000000000000000000000000000002';

const MESSAGE_TO_BE_SIGNED = 'Sign this message to get your Bitcoin destination address';

// The root state types every module slice as optional; every module used here is registered.
function slicesOf(store: Store<unknown>) {
  const state = store.state as RootState;
  return {
    session: state.web3Session as SessionState,
    flyoverPegout: state.flyoverPegout as FlyoverPegoutState,
    flyoverPegin: state.flyoverPegin as FlyoverPeginState,
    pegInTx: state.pegInTx as PegInTxState,
  };
}

const initEnvironment = () => {
  EnvironmentAccessorService.initializeEnvironmentVariables({
    vueAppCoin: constants.BTC_NETWORK_TESTNET,
    vueAppRskNodeHost: '',
    vueAppApiBaseUrl: 'https://2wp-api.testnet.rsk.co',
    lbcPeginAddress: '0x9270733402dc7c5730EA24268fC11039FD75E189',
    lbcPegoutAddress: '0x9A0678742cfB567874Eb4E99DF2106BdeD78F5e4',
  });
};

describe('Trezor Connect drops responses from unrelated origins', () => {
  type PendingRequest = { promiseId: number; promise: Promise<unknown> };
  type MessageHandler = {
    handleMessage: (event: { origin: string; data: unknown }) => void;
    // eslint-disable-next-line no-underscore-dangle
    _messagePromises: { create: () => PendingRequest };
  };

  let responseEvent: string;
  let core: MessageHandler;
  let pending: PendingRequest;

  beforeEach(() => {
    jest.resetModules();
    /* eslint-disable global-require, @typescript-eslint/no-var-requires,
       import/no-extraneous-dependencies, no-underscore-dangle */
    // `origin` is assigned by iframe.init() at runtime; it is set up front here so the
    // namespace copy taken by core-in-iframe.js carries the trusted value.
    const iframeModule = require('@trezor/connect-web/lib/iframe');
    iframeModule.origin = TRUSTED_ORIGIN;
    const trezorEvents = require('@trezor/connect/lib/events');
    const { CoreInIframe } = require('@trezor/connect-web/lib/impl/core-in-iframe');
    responseEvent = trezorEvents.RESPONSE_EVENT;
    core = new CoreInIframe();
    pending = core._messagePromises.create();
    /* eslint-enable global-require, @typescript-eslint/no-var-requires,
       import/no-extraneous-dependencies, no-underscore-dangle */
  });

  function responseFrom(origin: string, payload: string) {
    return {
      origin,
      data: {
        event: responseEvent,
        type: 'ethereumSignMessage',
        id: pending.promiseId,
        success: true,
        payload,
      },
    };
  }

  function settledValue(): Promise<unknown> {
    return Promise.race([
      pending.promise,
      new Promise((resolve) => { setTimeout(() => resolve('STILL_PENDING'), 50); }),
    ]);
  }

  it('leaves a pending request unresolved when an unrelated origin answers it', async () => {
    core.handleMessage(responseFrom(ATTACKER_ORIGIN, 'ATTACKER_SIGNATURE'));

    await expect(settledValue()).resolves.toBe('STILL_PENDING');
  });

  it('still resolves a request answered by the expected origin', async () => {
    core.handleMessage(responseFrom(TRUSTED_ORIGIN, 'VICTIM_SIGNATURE'));

    await expect(settledValue()).resolves.toMatchObject({
      id: pending.promiseId,
      success: true,
      payload: 'VICTIM_SIGNATURE',
    });
  });

  it('ignores an id-spray from an unrelated origin', async () => {
    // Request ids are sequential and low, so they can be sprayed to race the real response.
    for (let id = 1; id <= 32; id += 1) {
      core.handleMessage({
        origin: ATTACKER_ORIGIN,
        data: {
          event: responseEvent, type: 'ethereumSignMessage', id, success: true, payload: 'ATTACKER_SIGNATURE',
        },
      });
    }

    await expect(settledValue()).resolves.toBe('STILL_PENDING');
  });
});

describe('An injected signature cannot move the beneficiary or the quotes', () => {
  const victim = new ethers.Wallet(VICTIM_PRIVATE_KEY);
  const attacker = new ethers.Wallet(ATTACKER_PRIVATE_KEY);
  const messageHash = ethers.utils.keccak256(toUtf8Bytes(MESSAGE_TO_BE_SIGNED));

  function buildStore(sendResponse: () => Promise<string>) {
    const store = createStore({
      modules: {
        web3Session, pegInTx, flyoverPegin, flyoverPegout,
      },
    });
    store.commit(`web3Session/${constants.SESSION_SET_ACCOUNT}`, victim.address);
    store.commit(`web3Session/${constants.SESSION_SET_WEB3_INSTANCE}`, {
      send: () => sendResponse(),
      listAccounts: () => Promise.resolve([victim.address]),
    });
    return store;
  }

  beforeEach(initEnvironment);

  it('does not set a beneficiary derived from the attacker signature', async () => {
    const injected = await attacker.signMessage(ethers.utils.arrayify(messageHash));
    const store = buildStore(() => Promise.resolve(injected));

    await expect(
      store.dispatch(`web3Session/${constants.SESSION_SIGN_MESSAGE}`, MESSAGE_TO_BE_SIGNED),
    ).rejects.toThrow();

    expect(slicesOf(store).session.btcDerivedAddress).toBe('');
  });

  it('leaves the connected account untouched', async () => {
    const injected = await attacker.signMessage(ethers.utils.arrayify(messageHash));
    const store = buildStore(() => Promise.resolve(injected));

    await store.dispatch(`web3Session/${constants.SESSION_SIGN_MESSAGE}`, MESSAGE_TO_BE_SIGNED)
      .catch(() => undefined);

    expect(slicesOf(store).session.account).toBe(victim.address);
  });

  it('leaves the Flyover peg-out recipient and quotes untouched', async () => {
    const injected = await attacker.signMessage(ethers.utils.arrayify(messageHash));
    const store = buildStore(() => Promise.resolve(injected));

    await store.dispatch(`web3Session/${constants.SESSION_SIGN_MESSAGE}`, MESSAGE_TO_BE_SIGNED)
      .catch(() => undefined);

    expect(slicesOf(store).flyoverPegout.btcRecipientAddress).toBe('');
    expect(slicesOf(store).flyoverPegout.quotes).toEqual({});
  });

  it('derives the beneficiary when the connected account signs', async () => {
    const legitimate = await victim.signMessage(ethers.utils.arrayify(messageHash));
    const store = buildStore(() => Promise.resolve(legitimate));

    await store.dispatch(`web3Session/${constants.SESSION_SIGN_MESSAGE}`, MESSAGE_TO_BE_SIGNED);

    expect(slicesOf(store).session.btcDerivedAddress).not.toBe('');
  });
});

describe('A substituted account clears every identity-derived value', () => {
  const victim = '0x7E5F4552091A69125d5DfCb7b8C2659029395Bdf';
  const attacker = '0x2B5AD5c4795c026514f8317c7a215E218DcCD6cF';

  beforeEach(initEnvironment);

  function buildStore(reportedAccount: string) {
    const store = createStore({
      modules: {
        web3Session, pegInTx, flyoverPegin, flyoverPegout,
      },
    });
    store.commit(`web3Session/${constants.SESSION_SET_ACCOUNT}`, victim);
    store.commit(`web3Session/${constants.SESSION_SET_WEB3_INSTANCE}`, {
      listAccounts: () => Promise.resolve([reportedAccount]),
      getBalance: () => Promise.resolve(0),
    });
    store.commit(`web3Session/${constants.SESSION_SET_BTC_ACCOUNT}`, 'mkwhnCRC9H7Zy5iCQg9oB8BeRDGZufKmFn');
    store.commit(`flyoverPegout/${constants.FLYOVER_PEGOUT_SET_BTC_ADDRESS}`, 'mkwhnCRC9H7Zy5iCQg9oB8BeRDGZufKmFn');
    store.commit(`flyoverPegin/${constants.FLYOVER_PEGIN_SET_ROOTSTOCK_ADDRESS}`, victim);
    store.commit(`pegInTx/${constants.PEGIN_TX_SET_RSK_ADDRESS}`, victim);
    return store;
  }

  it('clears the beneficiary and recipients when the wallet reports another account', async () => {
    const store = buildStore(attacker);

    await store.dispatch(`web3Session/${constants.WEB3_SESSION_GET_ACCOUNT}`);

    expect(slicesOf(store).session.btcDerivedAddress).toBe('');
    expect(slicesOf(store).flyoverPegout.btcRecipientAddress).toBe('');
    expect(slicesOf(store).flyoverPegin.rootstockRecipientAddress).toBe('');
    expect(slicesOf(store).pegInTx.rskAddressSelected).toBe('');
  });

  it('keeps them when the wallet still reports the connected account', async () => {
    const store = buildStore(victim);

    await store.dispatch(`web3Session/${constants.WEB3_SESSION_GET_ACCOUNT}`);

    expect(slicesOf(store).session.btcDerivedAddress).not.toBe('');
    expect(slicesOf(store).flyoverPegout.btcRecipientAddress).not.toBe('');
  });

  it('refuses to bind a peg-in recipient to a substituted account', async () => {
    const store = buildStore(attacker);

    await expect(
      store.dispatch(`web3Session/${constants.SESSION_REVALIDATE_ACCOUNT}`),
    ).rejects.toThrow(/account changed/i);
  });

  it('clears every identity-derived value when the wallet disconnects', async () => {
    // Disconnecting and reconnecting can land on a different account, so nothing bound to
    // the previous identity may survive the disconnect.
    const store = buildStore(victim);

    await store.dispatch(`web3Session/${constants.WEB3_SESSION_CLEAR_ACCOUNT}`);

    const state = slicesOf(store);
    expect(state.session.account).toBeUndefined();
    expect(state.session.btcDerivedAddress).toBe('');
    expect(state.flyoverPegout.btcRecipientAddress).toBe('');
    expect(state.flyoverPegin.rootstockRecipientAddress).toBe('');
    expect(state.pegInTx.rskAddressSelected).toBe('');
  });

  it('clears quotes bound to the previous identity on disconnect', async () => {
    const store = buildStore(victim);
    store.commit(`flyoverPegout/${constants.FLYOVER_PEGOUT_SET_QUOTES}`, { 1: [] });
    store.commit(`flyoverPegin/${constants.FLYOVER_PEGIN_SET_QUOTES}`, { 1: [] });

    await store.dispatch(`web3Session/${constants.WEB3_SESSION_CLEAR_ACCOUNT}`);

    expect(slicesOf(store).flyoverPegout.quotes).toEqual({});
    expect(slicesOf(store).flyoverPegin.quotes).toEqual({});
  });
});
