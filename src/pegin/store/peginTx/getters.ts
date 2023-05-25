import { GetterTree } from 'vuex';
import * as constants from '@/common/store/constants';
import { PegInTxState, RootState } from '@/common/types';
import { EnvironmentAccessorService } from '@/common/services/enviroment-accessor.service';
import SatoshiBig from '@/common/types/SatoshiBig';
import { WalletService } from '@/common/services';
import EnvironmentContextProviderService from '@/common/providers/EnvironmentContextProvider';

export const getters: GetterTree<PegInTxState, RootState> = {
  [constants.WALLET_NAME]: (state) => {
    switch (state.bitcoinWallet) {
      case constants.WALLET_LEDGER: {
        return 'Ledger';
      }
      case constants.WALLET_TREZOR: {
        return 'Trezor';
      }
      case constants.WALLET_LIQUALITY: {
        return 'Liquality';
      }
      default: {
        return 'wallet';
      }
    }
  },
  [constants.PEGIN_TX_GET_CHANGE_ADDRESS]:
    (state: PegInTxState) => (accountType: string): string => {
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
          if ((walletAddress.derivationPath.startsWith(`m/${accountTypePath}${coinPath}/0'/1`)
              && walletAddress.unused)) {
            address = walletAddress.address;
            break;
          }
        }
      }
      return address;
    },
  [constants.PEGIN_TX_GET_REFUND_ADDRESS]:
  (state: PegInTxState, localGetters?:any, rootState?:RootState, rootGetters?: any):string => {
    let address = '';
    const currentView = rootGetters[constants.VIEW_GET_CURRENT_VIEW];
    if (currentView && currentView === 'Status') {
      address = state.statusInfo.refundAddress;
    } else {
      const coin = EnvironmentAccessorService.getEnvironmentVariables().vueAppCoin;
      const coinPath = coin === 'main' ? "/0'" : "/1'";
      // eslint-disable-next-line no-unused-expressions
      state.addressList?.forEach((walletAddress) => {
        if (walletAddress.derivationPath === `m/44'${coinPath}/0'/0/0`) address = walletAddress.address;
      });
    }
    return address;
  },
  [constants.PEGIN_TX_GET_BIP44_DERIVATION_PATH_FROM_ADDRESS]:
    (state: PegInTxState) => (address: string): string => {
      let path = '';
      // eslint-disable-next-line no-unused-expressions
      state.addressList?.forEach((walletAddress) => {
        if (walletAddress.address === address) {
          path = walletAddress.derivationPath.slice(2);
        }
      });
      return path;
    },
  [constants.PEGIN_TX_GET_DERIVATION_PATH_FROM_ADDRESS]:
    (state: PegInTxState) => (address: string): string => {
      let derivationPath = '';
      if (state.addressList) {
        state.addressList.forEach((walletAddress) => {
          if (walletAddress.address === address) {
            derivationPath = walletAddress.derivationPath;
          }
        });
      }
      return derivationPath;
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
    (state: PegInTxState, localGetters?:any, rootState?: RootState, rootGetters?: any)
      : SatoshiBig => {
      let fee: SatoshiBig;
      if (!state.normalizedTx.inputs.length) {
        const currentView = rootGetters[`view/${constants.VIEW_GET_CURRENT_VIEW}`];
        if (currentView && currentView === 'Status') {
          fee = state.statusInfo.safeFee;
        } else {
          switch (state.selectedFee) {
            case constants.BITCOIN_SLOW_FEE_LEVEL:
              fee = state.calculatedFees.slow.amount;
              break;
            case constants.BITCOIN_FAST_FEE_LEVEL:
              fee = state.calculatedFees.fast.amount;
              break;
            default:
              fee = state.calculatedFees.average.amount;
              break;
          }
        }
      } else {
        const inputsAmonut = state.normalizedTx.inputs
          .map((input) => Number(input.amount))
          .reduce((prevAmount, currAmount) => prevAmount + currAmount);
        const outputsAmount = state.normalizedTx.outputs
          .map((output) => Number(output.amount))
          .reduce((prevAmount, currAmount) => prevAmount + currAmount);
        fee = new SatoshiBig(inputsAmonut - outputsAmount, 'satoshi');
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
  [constants.PEGIN_TX_GET_STATUS_TX_ID]:
    (state: PegInTxState) => state.statusInfo.txId,
  [constants.PEGIN_TX_GET_WALLET_SERVICE]:
    (state: PegInTxState): WalletService | undefined => state.walletService,
  [constants.PEGIN_TX_IS_HD_WALLET]: (state: PegInTxState): boolean => {
    let isHdWallet = false;
    switch (state.bitcoinWallet) {
      case constants.WALLET_TREZOR:
        isHdWallet = true;
        break;
      case constants.WALLET_LEDGER:
        isHdWallet = true;
        break;
      case constants.WALLET_LIQUALITY:
        isHdWallet = false;
        break;
      default:
        isHdWallet = false;
        break;
    }
    return isHdWallet;
  },
  [constants.PEGIN_TX_IS_ENOUGH_BALANCE]: (state: PegInTxState, moduleGetters): boolean => {
    const feePlusAmount: SatoshiBig = state.amountToTransfer
      .plus(moduleGetters[constants.PEGIN_TX_GET_SAFE_TX_FEE]);
    const selectedAccountBalance = moduleGetters[constants.PEGIN_TX_GET_SELECTED_BALANCE];
    const minValue: SatoshiBig = new SatoshiBig(state.peginConfiguration.minValue, 'satoshi');
    // eslint-disable-next-line max-len
    const maxValue: SatoshiBig = new SatoshiBig(state.peginConfiguration.maxValue, 'satoshi');
    if (state.amountToTransfer.lte('0')
      || feePlusAmount.gt(selectedAccountBalance)
      || state.amountToTransfer.lt(minValue)
      || state.amountToTransfer.gt(maxValue)) {
      return false;
    }
    if (state.amountToTransfer.gt('0') && feePlusAmount.lte(selectedAccountBalance)) {
      return true;
    }
    return true;
  },
  [constants.PEGIN_TX_GET_ACCOUNT_BALANCE_TEXT]: (state: PegInTxState): string => {
    const environmentContext = EnvironmentContextProviderService.getEnvironmentContext();
    let text = '';
    switch (state.selectedAccount) {
      case constants.BITCOIN_LEGACY_ADDRESS:
        text = `Legacy - ${state.balances.legacy.toBTCStringNotZeroPadded()} ${environmentContext.getBtcTicker()}`;
        break;
      case constants.BITCOIN_SEGWIT_ADDRESS:
        text = `Segwit - ${state.balances.segwit.toBTCStringNotZeroPadded()} ${environmentContext.getBtcTicker()}`;
        break;
      case constants.BITCOIN_NATIVE_SEGWIT_ADDRESS:
        text = `Native segwit - ${state.balances.nativeSegwit.toBTCStringNotZeroPadded()} ${environmentContext.getBtcTicker()}`;
        break;
      default:
        break;
    }
    return text;
  },
  [constants.PEGIN_TX_GET_ENOUGH_FEE_VALUE]: (state: PegInTxState): boolean => {
    let enoughBalance = false;
    switch (state.selectedFee) {
      case constants.BITCOIN_SLOW_FEE_LEVEL:
        enoughBalance = state.calculatedFees.slow.enoughBalance;
        break;
      case constants.BITCOIN_FAST_FEE_LEVEL:
        enoughBalance = state.calculatedFees.fast.enoughBalance;
        break;
      default:
        enoughBalance = state.calculatedFees.average.enoughBalance;
        break;
    }
    return enoughBalance;
  },
};
