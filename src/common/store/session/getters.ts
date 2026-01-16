import { GetterTree } from 'vuex';
import * as constants from '@/common/store/constants';
import { SessionState } from '@/common/types/session';
import { RootState } from '@/common/types/store';
import { Feature, FeatureNames, WeiBig } from '@/common/types';
import * as rskUtils from '@rsksmart/rsk-utils';
import { EnvironmentAccessorService } from '@/common/services/enviroment-accessor.service';
import { useWalletInfo } from '@reown/appkit/vue';

export const getters: GetterTree<SessionState, RootState> = {
  [constants.SESSION_IN_TX_FLOW]: (state): boolean => state.txType !== undefined,
  [constants.SESSION_IS_ACCOUNT_CONNECTED]: (state): boolean => state.account !== undefined,
  [constants.SESSION_IS_LEDGER_CONNECTED]: (state): boolean => !!(state.rLogin?.provider.isLedger),
  [constants.SESSION_IS_TREZOR_CONNECTED]: (state): boolean => !!(state.rLogin?.provider.isTrezor),
  [constants.SESSION_IS_METAMASK_CONNECTED]:
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (state): boolean => (state.rLoginInstance as any).providerController?.injectedProvider.name
    === constants.RLOGIN_METAMASK_WALLET,
  [constants.SESSION_IS_RLOGIN_DEFINED]: (state): boolean => state.rLogin !== undefined,
  [constants.SESSION_GET_FEATURE]: (state) => (feature: FeatureNames)
  : Feature | undefined => state.features.find((f) => f.name === feature),
  [constants.SESSION_GET_RBTC_GAS_FEE]: async (
    { account, balance, ethersProvider },
    _,
    rootState,
  ) => {
    const gas = await ethersProvider?.estimateGas({
      from: account,
      to: rootState.pegOutTx?.pegoutConfiguration.bridgeContractAddress,
      value: balance.toWeiString(),
    });
    const gasPrice = Number(await ethersProvider?.getGasPrice());
    const calculatedFee = new WeiBig(gasPrice * Number(gas), 'wei');
    return calculatedFee;
  },
  [constants.SESSION_GET_CHECKSUMMED_ACCOUNT]: (state): string => {
    if (state.account) {
      const CHAIN_ID = EnvironmentAccessorService
        .getEnvironmentVariables().vueAppCoin === constants.BTC_NETWORK_MAINNET ? 30 : 31;
      return rskUtils.toChecksumAddress(state.account, CHAIN_ID);
    }
    return '';
  },
  [constants.SESSION_IS_ALLOWED_WALLET]: (state, moduleGetters, rootState:RootState): {
    pegin: boolean;
    pegout: boolean;
  } => {
    const response = {
      pegin: false,
      pegout: false,
    };
    const bitcoinWallet = rootState.pegInTx?.bitcoinWallet;
    const { walletInfo } = useWalletInfo();
    const walletName = walletInfo?.name;

    if (bitcoinWallet && bitcoinWallet !== constants.WALLET_NAMES.REOWN.long_name) {
      response.pegin = constants.ALLOWED_WALLETS_PEGIN.includes(bitcoinWallet as string);
    } else {
      response.pegin = constants.ALLOWED_WALLETS_PEGIN.includes(walletName || '');
    }

    if (walletName) {
      response.pegout = constants.ALLOWED_WALLETS_PEGOUT.includes(walletName);
    } else {
      response.pegout = !!state.rLoginInstance;
    }
    return response;
  },
};
