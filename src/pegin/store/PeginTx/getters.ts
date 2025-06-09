import { GetterTree } from 'vuex';
import * as constants from '@/common/store/constants';
import { PegInTxState, RootState, Utxo } from '@/common/types';
import { EnvironmentAccessorService } from '@/common/services/enviroment-accessor.service';
import SatoshiBig from '@/common/types/SatoshiBig';
import { WalletService } from '@/common/services';
import { getBalanceFromUtxoList } from '@/common/utils';

export const getters: GetterTree<PegInTxState, RootState> = {
  [constants.WALLET_NAME]: (state) => {
    switch (state.bitcoinWallet) {
      case constants.WALLET_NAMES.LEDGER.long_name: {
        return constants.WALLET_NAMES.LEDGER.formal_name;
      }
      case constants.WALLET_NAMES.TREZOR.long_name: {
        return constants.WALLET_NAMES.TREZOR.formal_name;
      }
      case constants.WALLET_NAMES.LEATHER.long_name: {
        return constants.WALLET_NAMES.LEATHER.formal_name;
      }
      case constants.WALLET_NAMES.XVERSE.long_name: {
        return constants.WALLET_NAMES.XVERSE.formal_name;
      }
      case constants.WALLET_NAMES.ENKRYPT.long_name: {
        return constants.WALLET_NAMES.ENKRYPT.formal_name;
      }
      default: {
        return 'wallet';
      }
    }
  },
  [constants.PEGIN_TX_GET_CHANGE_ADDRESS]:
    (state: PegInTxState): string => {
      let address = '';
      let accountTypePath = '';
      const coin = EnvironmentAccessorService.getEnvironmentVariables().vueAppCoin;
      const coinPath = coin === 'main' ? "/0'" : "/1'";
      switch (state.selectedAccount) {
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
            || walletAddress.derivationPath.startsWith(`${accountTypePath}${coinPath}/0'/1`))
              && walletAddress.unused) {
            address = walletAddress.address;
            break;
          }
        }
      }
      return address;
    },
  [constants.PEGIN_TX_GET_REFUND_ADDRESS]:
  (state: PegInTxState, localGetters) => {
    let address = '';
    const coin = EnvironmentAccessorService.getEnvironmentVariables().vueAppCoin;
    if (localGetters[constants.WALLET_NAME] === constants.WALLET_NAMES.LEATHER.formal_name
      || localGetters[constants.WALLET_NAME] === constants.WALLET_NAMES.XVERSE.formal_name
      || localGetters[constants.WALLET_NAME] === constants.WALLET_NAMES.ENKRYPT.formal_name
    ) {
      address = coin === 'main'
        ? constants.VALID_ADDRESS_UNUSED_BY_FLYOVER.mainnet
        : constants.VALID_ADDRESS_UNUSED_BY_FLYOVER.testnet;
    } else {
      const coinPath = coin === 'main' ? "/0'" : "/1'";
      state.addressList?.forEach((walletAddress) => {
        if (walletAddress.derivationPath === `m/44'${coinPath}/0'/0/0`) address = walletAddress.address;
      });
    }
    return address;
  },
  [constants.PEGIN_TX_GET_BIP44_DERIVATION_PATH_FROM_ADDRESS]:
    (state: PegInTxState) => (address: string): string => {
      let path = '';
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
      state.addressList?.forEach((walletAddress) => {
        if (walletAddress.publicKey && walletAddress.address === address) {
          publicKey = walletAddress.publicKey;
        }
      });
      return publicKey;
    },
  [constants.PEGIN_TX_GET_SAFE_TX_FEE]:
    (state: PegInTxState)
      : SatoshiBig => {
      let fee: SatoshiBig;
      if (!state.normalizedTx.inputs.length) {
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
          return getBalanceFromUtxoList(state.utxoList.legacy);
        case constants.BITCOIN_NATIVE_SEGWIT_ADDRESS:
          return getBalanceFromUtxoList(state.utxoList.nativeSegwit);
        case constants.BITCOIN_SEGWIT_ADDRESS:
          return getBalanceFromUtxoList(state.utxoList.segwit);
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
      case constants.WALLET_NAMES.TREZOR.long_name:
      case constants.WALLET_NAMES.LEDGER.long_name:
        isHdWallet = true;
        break;
      case constants.WALLET_NAMES.LEATHER.long_name:
      case constants.WALLET_NAMES.XVERSE.long_name:
      case constants.WALLET_NAMES.REOWN.long_name:
      case constants.WALLET_NAMES.ENKRYPT.long_name:
        isHdWallet = false;
        break;
      default:
        isHdWallet = false;
        break;
    }
    return isHdWallet;
  },
  [constants.PEGIN_TX_IS_SF_WALLET]: (state: PegInTxState): boolean => {
    let isSfWallet = false;
    switch (state.bitcoinWallet) {
      case constants.WALLET_NAMES.TREZOR.long_name:
        isSfWallet = false;
        break;
      case constants.WALLET_NAMES.LEDGER.long_name:
        isSfWallet = false;
        break;
      case constants.WALLET_NAMES.LEATHER.long_name:
        isSfWallet = true;
        break;
      case constants.WALLET_NAMES.XVERSE.long_name:
        isSfWallet = true;
        break;
      case constants.WALLET_NAMES.ENKRYPT.long_name:
        isSfWallet = true;
        break;
      default:
        isSfWallet = false;
        break;
    }
    return isSfWallet;
  },
  [constants.PEGIN_TX_IS_ENOUGH_BALANCE]: (state: PegInTxState, moduleGetters): boolean => {
    const feePlusAmount: SatoshiBig = state.amountToTransfer
      .plus(moduleGetters[constants.PEGIN_TX_GET_SAFE_TX_FEE]);
    const selectedAccountBalance = moduleGetters[constants.PEGIN_TX_GET_SELECTED_BALANCE];
    const minValue: SatoshiBig = new SatoshiBig(state.peginConfiguration.minValue, 'btc');
    if (state.amountToTransfer.lte('0')
      || feePlusAmount.gt(selectedAccountBalance)
      || state.amountToTransfer.lt(minValue)) {
      return false;
    }
    if (state.amountToTransfer.gt('0') && feePlusAmount.lte(selectedAccountBalance)) {
      return true;
    }
    return true;
  },
  [constants.PEGIN_TX_GET_SELECTED_ACCOUNT_TYPE]: (state: PegInTxState): string => {
    switch (state.selectedAccount) {
      case constants.BITCOIN_LEGACY_ADDRESS:
        return 'Legacy';
      case constants.BITCOIN_SEGWIT_ADDRESS:
        return 'Segwit';
      case constants.BITCOIN_NATIVE_SEGWIT_ADDRESS:
        return 'Native segwit';
      default:
        return '';
    }
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
  [constants.PEGIN_TX_GET_ACCOUNT_UTXO_LIST]: (state: PegInTxState): Utxo[] => {
    let utxoList: Utxo[] = [];
    switch (state.selectedAccount) {
      case constants.BITCOIN_LEGACY_ADDRESS:
        utxoList = state.utxoList ? state.utxoList.legacy : [];
        break;
      case constants.BITCOIN_SEGWIT_ADDRESS:
        utxoList = state.utxoList ? state.utxoList.segwit : [];
        break;
      case constants.BITCOIN_NATIVE_SEGWIT_ADDRESS:
        utxoList = state.utxoList ? state.utxoList.nativeSegwit : [];
        break;
      default:
        break;
    }
    return utxoList;
  },
  [constants.PEGIN_TX_GET_SELECTED_UTXO_LIST]: (state: PegInTxState): Utxo[] => {
    let utxoList: Utxo[] = [];
    switch (state.selectedFee) {
      case constants.BITCOIN_SLOW_FEE_LEVEL:
        utxoList = state.calculatedFees.slow.selectedUtxoList;
        break;
      case constants.BITCOIN_AVERAGE_FEE_LEVEL:
        utxoList = state.calculatedFees.average.selectedUtxoList;
        break;
      case constants.BITCOIN_FAST_FEE_LEVEL:
        utxoList = state.calculatedFees.fast.selectedUtxoList;
        break;
      default:
        break;
    }
    return utxoList;
  },
};
