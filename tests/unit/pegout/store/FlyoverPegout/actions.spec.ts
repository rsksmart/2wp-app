import { ActionContext } from 'vuex';
import { actions } from '@/pegout/store/FlyoverPegout/actions';
import { mutations } from '@/pegout/store/FlyoverPegout/mutations';
import * as constants from '@/common/store/constants';
import { EnvironmentAccessorService } from '@/common/services/enviroment-accessor.service';
import {
  FlyoverPegoutState, QuotePegOut2WP, RootState, WeiBig,
} from '@/common/types';
import { getClearQuoteFeeDifference } from '@/common/utils';

type FlyoverPegoutActionContext = ActionContext<FlyoverPegoutState, RootState>;
type FlyoverPegoutActionHandler = (
  context: Partial<FlyoverPegoutActionContext>,
  payload?: unknown,
) => Promise<unknown>;
type FlyoverPegoutMutation = (state: FlyoverPegoutState, payload?: unknown) => void;

function callAction(
  name: string,
  context: Partial<FlyoverPegoutActionContext>,
  payload?: unknown,
): Promise<unknown> {
  const handler = actions[name] as unknown as FlyoverPegoutActionHandler;
  return Promise.resolve(handler(context, payload));
}

const PROVIDER_ID = 1;
const APPROVED_HASH = 'approved-quote-hash';
const FINAL_QUOTE_HASH = 'final-quote-hash';
const RSK_REFUND_ADDRESS = '0x7E5F4552091A69125d5DfCb7b8C2659029395Bdf';

function quote2wp(quoteHash: string, callFee: string, gasFee: string): QuotePegOut2WP {
  return {
    quote: {
      callFee: new WeiBig(callFee, 'wei'),
      gasFee: new WeiBig(gasFee, 'wei'),
      value: new WeiBig('50000000000000000', 'wei'),
      rskRefundAddress: RSK_REFUND_ADDRESS,
    },
    quoteHash,
  } as unknown as QuotePegOut2WP;
}

// Fees of 0.00003 RBTC on a 0.05 RBTC peg-out
const approvedQuote = quote2wp(APPROVED_HASH, '20000000000000', '10000000000000');
const sameFeesFinalQuote = quote2wp(FINAL_QUOTE_HASH, '20000000000000', '10000000000000');
// Fees of 0.001 RBTC: the total moves by 1.9%, under the 2% tolerance
const higherFeesFinalQuote = quote2wp(FINAL_QUOTE_HASH, '700000000000000', '300000000000000');

/**
 * Send re-quotes the Flyover peg-out before the wallet signs. The wallet must never be asked
 * for higher fees than the user saw unless the user approved them in the Review conditions dialog.
 */
describe('Flyover peg-out re-quote on Send', () => {
  let state: FlyoverPegoutState;
  let commit: jest.Mock;
  let dispatch: jest.Mock;
  let acceptAndSendPegoutQuote: jest.Mock;
  let acceptPegoutQuote: jest.Mock;
  const getters = { [constants.FLYOVER_PEGOUT_GET_PROVIDER_ID]: () => PROVIDER_ID };

  function setUp(finalQuote: QuotePegOut2WP) {
    acceptAndSendPegoutQuote = jest.fn()
      .mockResolvedValue({ txHash: '0xtxhash', signature: '0xsignature' });
    acceptPegoutQuote = jest.fn().mockResolvedValue({ signature: '0xsignature' });
    state = {
      quotes: { [PROVIDER_ID]: [approvedQuote] },
      selectedQuoteHash: APPROVED_HASH,
      difference: getClearQuoteFeeDifference(),
      flyoverService: { acceptAndSendPegoutQuote, acceptPegoutQuote },
    } as unknown as FlyoverPegoutState;
    commit = jest.fn((type: string, payload?: unknown) => {
      (mutations[type] as FlyoverPegoutMutation)(state, payload);
    });
    dispatch = jest.fn((name: string, payload?: unknown) => {
      if (name === constants.FLYOVER_PEGOUT_GET_QUOTES) {
        state.quotes = { [PROVIDER_ID]: [finalQuote] };
        return Promise.resolve();
      }
      if (name === constants.FLYOVER_PEGOUT_GET_FINAL_QUOTE) {
        return callAction(name, { state, commit, dispatch }, payload);
      }
      return Promise.resolve();
    });
  }

  beforeEach(() => {
    process.env.VUE_APP_FLYOVER_PEGOUT_QUOTE_DIFF_PERCENTAGE = '2';
    EnvironmentAccessorService.initializeEnvironmentVariables({
      vueAppCoin: constants.BTC_NETWORK_TESTNET,
    });
  });

  describe(constants.FLYOVER_PEGOUT_GET_FINAL_QUOTE, () => {
    it('selects a final quote with the same fees without asking', async () => {
      setUp(sameFeesFinalQuote);

      await callAction(
        constants.FLYOVER_PEGOUT_GET_FINAL_QUOTE,
        { state, commit, dispatch },
        { providerId: PROVIDER_ID, quoteHash: APPROVED_HASH },
      );

      expect(state.selectedQuoteHash).toBe(FINAL_QUOTE_HASH);
      expect(state.difference.requiresApproval).toBe(false);
    });

    it('keeps the approved quote and asks when the final quote has higher fees', async () => {
      setUp(higherFeesFinalQuote);

      await callAction(
        constants.FLYOVER_PEGOUT_GET_FINAL_QUOTE,
        { state, commit, dispatch },
        { providerId: PROVIDER_ID, quoteHash: APPROVED_HASH },
      );

      expect(state.selectedQuoteHash).toBe(APPROVED_HASH);
      expect(state.difference.requiresApproval).toBe(true);
      expect(state.difference.percentage).toBe(97);
      expect(state.difference.approvedQuote.quoteHash).toBe(APPROVED_HASH);
      expect(state.difference.finalQuote.quoteHash).toBe(FINAL_QUOTE_HASH);
    });

    it('drops a difference left by an earlier Send before comparing again', async () => {
      setUp(sameFeesFinalQuote);
      state.difference = {
        ...getClearQuoteFeeDifference(), percentage: 97, requiresApproval: true,
      };

      await callAction(
        constants.FLYOVER_PEGOUT_GET_FINAL_QUOTE,
        { state, commit, dispatch },
        { providerId: PROVIDER_ID, quoteHash: APPROVED_HASH },
      );

      expect(state.difference.requiresApproval).toBe(false);
    });

    it('rejects an unknown quote without requesting new quotes', async () => {
      setUp(sameFeesFinalQuote);

      await expect(callAction(
        constants.FLYOVER_PEGOUT_GET_FINAL_QUOTE,
        { state, commit, dispatch },
        { providerId: PROVIDER_ID, quoteHash: 'unknown-hash' },
      )).rejects.toThrow('Quote not found');
      expect(dispatch).not.toHaveBeenCalled();
    });
  });

  describe(constants.FLYOVER_PEGOUT_ACCEPT_AND_SEND_QUOTE, () => {
    it('sends a final quote with the same fees', async () => {
      setUp(sameFeesFinalQuote);

      await callAction(
        constants.FLYOVER_PEGOUT_ACCEPT_AND_SEND_QUOTE,
        {
          state, commit, dispatch, getters,
        },
        APPROVED_HASH,
      );

      expect(acceptAndSendPegoutQuote).toHaveBeenCalledWith(FINAL_QUOTE_HASH);
      expect(state.txHash).toBe('0xtxhash');
    });

    it('does not ask the wallet to sign a final quote with higher fees', async () => {
      setUp(higherFeesFinalQuote);

      await expect(callAction(
        constants.FLYOVER_PEGOUT_ACCEPT_AND_SEND_QUOTE,
        {
          state, commit, dispatch, getters,
        },
        APPROVED_HASH,
      )).rejects.toThrow('Quote differences found');
      expect(acceptAndSendPegoutQuote).not.toHaveBeenCalled();
    });

    it('sends the final quote shown in the dialog once the user approves it', async () => {
      setUp(higherFeesFinalQuote);
      await expect(callAction(
        constants.FLYOVER_PEGOUT_ACCEPT_AND_SEND_QUOTE,
        {
          state, commit, dispatch, getters,
        },
        APPROVED_HASH,
      )).rejects.toThrow('Quote differences found');

      await callAction(
        constants.FLYOVER_PEGOUT_ACCEPT_AND_SEND_QUOTE_WITH_CHANGED_CONDITIONS,
        { state, commit },
      );

      expect(acceptAndSendPegoutQuote).toHaveBeenCalledTimes(1);
      expect(acceptAndSendPegoutQuote).toHaveBeenCalledWith(FINAL_QUOTE_HASH);
    });
  });

  describe(constants.FLYOVER_PEGOUT_ACCEPT_QUOTE, () => {
    it('does not accept a final quote with higher fees', async () => {
      setUp(higherFeesFinalQuote);

      await expect(callAction(
        constants.FLYOVER_PEGOUT_ACCEPT_QUOTE,
        {
          state, commit, dispatch, getters,
        },
        APPROVED_HASH,
      )).rejects.toThrow('Quote differences found');
      expect(acceptPegoutQuote).not.toHaveBeenCalled();
    });
  });
});
