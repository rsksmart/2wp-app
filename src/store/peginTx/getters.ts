import { GetterTree } from 'vuex';
import * as constants from '@/store/constants';
import { PegInTxState, RootState, SatoshiBig } from '@/types';
import { EnvironmentAccessorService } from '@/services/enviroment-accessor.service';
import ApiService from '@/services/ApiService';
import { WalletService } from '@/services';

export const getters: GetterTree<PegInTxState, RootState> = {
  [constants.WALLET_NAME]: (state) => {
    switch (state.bitcoinWallet) {
      case constants.WALLET_LEDGER: {
        return 'Ledger';
      }
      case constants.WALLET_TREZOR: {
        return 'Trezor';
      }
      default: {
        return 'wallet';
      }
    }
  },
  [constants.PEGIN_TX_GET_CHANGE_ADDRESS]:
    (state: PegInTxState) => async (accountType: string): Promise<string> => {
      let address = '';
      let accountTypePath = '';
      const coin = EnvironmentAccessorService.getEnvironmentVariables().vueAppCoin;
      const coinPath = coin === 'main' ? "/0'" : "/1'";
      switch (accountType) {
        case constants.BITCOIN_LEGACY_ADDRESS:
          accountTypePath = "44'";
          break;
        case constants.BITCOIN_SEGWIT_ADDRESS:
          accountTypePath = "49'";
          break;
        case constants.BITCOIN_NATIVE_SEGWIT_ADDRESS:
          accountTypePath = "84'";
          break;
        default:
          accountTypePath = "44'";
      }
      if (state.addressList) {
        // eslint-disable-next-line no-restricted-syntax
        for (const walletAddress of state.addressList) {
          if ((walletAddress.serializedPath.startsWith(`m/${accountTypePath}${coinPath}/0'/1`)
              // eslint-disable-next-line no-await-in-loop
              && (await ApiService.areUnusedAddresses([walletAddress.address])))) {
            address = walletAddress.address;
            break;
          }
        }
      }
      return address;
    },
  [constants.PEGIN_TX_GET_REFUND_ADDRESS]: (state: PegInTxState) => {
    let address = '';
    const coin = EnvironmentAccessorService.getEnvironmentVariables().vueAppCoin;
    const coinPath = coin === 'main' ? "/0'" : "/1'";
    // eslint-disable-next-line no-unused-expressions
    state.addressList?.forEach((walletAddress) => {
      if (walletAddress.serializedPath === `m/44'${coinPath}/0'/0/0`) address = walletAddress.address;
    });
    return address;
  },
  [constants.PEGIN_TX_GET_BIP44_DERIVATION_PATH_FROM_ADDRESS]:
    (state: PegInTxState) => (address: string): string => {
      let path = '';
      // eslint-disable-next-line no-unused-expressions
      state.addressList?.forEach((walletAddress) => {
        if (walletAddress.address === address) {
          path = walletAddress.serializedPath.slice(2);
        }
      });
      return path;
    },
  [constants.PEGIN_TX_GET_ADDRESS_PUBLIC_KEY]:
    (state: PegInTxState) => (address: string): string => {
      let publicKey = '';
      // eslint-disable-next-line no-unused-expressions
      state.addressList?.forEach((walletAddress) => {
        if (walletAddress.publicKey && walletAddress.address === address) {
          publicKey = walletAddress.publicKey;
        }
      });
      return publicKey;
    },
  [constants.PEGIN_TX_GET_SAFE_TX_FEE]:
    (state: PegInTxState): SatoshiBig => {
      let fee: SatoshiBig;
      switch (state.selectedFee) {
        case constants.BITCOIN_SLOW_FEE_LEVEL:
          fee = state.calculatedFees.slow;
          break;
        case constants.BITCOIN_FAST_FEE_LEVEL:
          fee = state.calculatedFees.fast;
          break;
        default:
          fee = state.calculatedFees.average;
          break;
      }
      return fee;
    },
  [constants.PEGIN_TX_GET_SELECTED_BALANCE]:
    (state: PegInTxState): SatoshiBig => {
      switch (state.selectedAccount) {
        case constants.BITCOIN_LEGACY_ADDRESS:
          return state.balances.legacy;
        case constants.BITCOIN_NATIVE_SEGWIT_ADDRESS:
          return state.balances.nativeSegwit;
        case constants.BITCOIN_SEGWIT_ADDRESS:
          return state.balances.segwit;
        default:
          break;
      }
      return new SatoshiBig('0', 'satoshi');
    },
  [constants.PEGIN_TX_GET_WALLET_SERVICE]:
    (state: PegInTxState): WalletService | undefined => state.walletService,
};
