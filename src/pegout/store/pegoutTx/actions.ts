import { ActionTree } from 'vuex';
import axios, { AxiosResponse } from 'axios';
import * as constants from '@/common/store/constants';
import {
  MiningSpeedFee, PegOutTxState, RootState, SatoshiBig, WeiBig,
} from '@/common/types';
import { EnvironmentAccessorService } from '@/common/services/enviroment-accessor.service';
import {
  getCookie, getEstimatedFee, sendTransaction, setCookie, ServiceError,
} from '@/common/utils';
import { useWallet } from '@/common/composables/useWallet';

export const actions: ActionTree<PegOutTxState, RootState> = {
  [constants.PEGOUT_TX_SELECT_FEE_LEVEL]: ({ commit }, feeLevel: MiningSpeedFee) => {
    commit(constants.PEGOUT_TX_SET_SELECTED_FEE_LEVEL, feeLevel);
  },
  [constants.PEGOUT_TX_ADD_AMOUNT]: ({ commit }, amountToTransfer: WeiBig) => {
    commit(constants.PEGOUT_TX_SET_AMOUNT, amountToTransfer);
  },
  [constants.PEGOUT_TX_CALCULATE_FEE]: async ({ commit, state }) => {
    const { address, provider } = useWallet();
    try {
      // RSK Fee
      const gas = await provider.value?.estimateGas({
        from: address.value ?? '',
        to: state.pegoutConfiguration.bridgeContractAddress,
        value: state.amountToTransfer.toWeiString(),
      });
      commit(constants.PEGOUT_TX_SET_GAS, gas);
      const gasPrice = Number(await provider.value?.getGasPrice());
      const calculatedFee = new WeiBig(gasPrice * Number(gas), 'wei');
      commit(constants.PEGOUT_TX_SET_RSK_ESTIMATED_FEE, calculatedFee);
    } catch (e) {
      commit(constants.PEGOUT_TX_SET_GAS, 0);
      commit(constants.PEGOUT_TX_SET_RSK_ESTIMATED_FEE, 0);
    }

    try {
      // BTC Fee
      const estimatedFee = await getEstimatedFee();
      commit(constants.PEGOUT_TX_SET_BTC_ESTIMATED_FEE, new SatoshiBig(estimatedFee, 'satoshi'));
    } catch (e) {
      commit(constants.PEGOUT_TX_SET_BTC_ESTIMATED_FEE, new SatoshiBig(0, 'satoshi'));
    }
  },
  [constants.PEGOUT_TX_ADD_PEGOUT_CONFIGURATION]: ({ commit }) => {
    commit(constants.PEGOUT_TX_SET_PEGOUT_CONFIGURATION, {
      minValue:
        new WeiBig(EnvironmentAccessorService.getEnvironmentVariables().pegoutMinValue, 'rbtc'),
      bridgeContractAddress: constants.BRIDGE_CONTRACT_ADDRESS,
    });
  },
  [constants.PEGOUT_TX_ADD_VALID_AMOUNT]: ({ commit }, valid: boolean) => {
    commit(constants.PEGOUT_TX_SET_VALID_AMOUNT, valid);
  },
  [constants.PEGOUT_TX_INIT]: ({ dispatch }):
    Promise<void> => dispatch(constants.PEGOUT_TX_ADD_BITCOIN_PRICE)
    .then(() => dispatch(constants.PEGOUT_TX_ADD_PEGOUT_CONFIGURATION)),
  [constants.PEGOUT_TX_SEND]: ({ state, commit })
    : Promise<void> => new Promise<void>((resolve, reject) => {
      const { address, provider } = useWallet();
      if (provider.value && address.value) {
        const txToSign = {
          from: address.value,
          to: state.pegoutConfiguration.bridgeContractAddress,
          value: state.amountToTransfer.toWeiString(),
        };
        Promise.all([
          sendTransaction(txToSign, provider.value)
            .then((txResponse) => {
              commit(constants.PEGOUT_TX_SET_TX_HASH, txResponse.hash);
              resolve();
              return txResponse.wait(1);
            }),
          provider.value.getGasPrice(),
        ])
          .then(([tx, gasPrice]) => {
            commit(
              constants.PEGOUT_TX_SET_EFECTIVE_FEE,
              new WeiBig(Number(gasPrice) * Number(tx.gasUsed), 'wei'),
            );
          })
          .catch((e) => {
            reject(new ServiceError(
              'RSKBlockchain',
              constants.PEGOUT_TX_SEND,
              "We didn't receive confirmation for your transaction. If you intended to complete it, please try again.",
              e.message,
            ));
          });
      }
    }),
  [constants.PEGOUT_TX_CLEAR]: ({ commit }) => {
    commit(constants.PEGOUT_TX_CLEAR_STATE);
  },
  [constants.PEGOUT_TX_ADD_BITCOIN_PRICE]: ({ commit }) => {
    const storedPrice = getCookie('BtcPrice');
    if (storedPrice) {
      commit(constants.PEGOUT_TX_SET_BITCOIN_PRICE, Number(storedPrice));
    } else {
      axios.get(constants.COINGECKO_API_URL)
        .then((response: AxiosResponse) => {
          const [result] = response.data;
          setCookie('BtcPrice', result.current_price, constants.COOKIE_EXPIRATION_HOURS);
          commit(constants.PEGOUT_TX_SET_BITCOIN_PRICE, result.current_price);
        })
        .catch(() => {
          commit(constants.PEGOUT_TX_SET_BITCOIN_PRICE, 0);
        });
    }
  },
};
