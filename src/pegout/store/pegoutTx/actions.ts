import { ActionTree } from 'vuex';
import axios, { AxiosResponse } from 'axios';
import * as constants from '@/common/store/constants';
import {
  MiningSpeedFee, PegOutTxState, RootState, SatoshiBig, SessionState, WeiBig,
} from '@/common/types';
import { EnvironmentAccessorService } from '@/common/services/enviroment-accessor.service';
import {
  getCookie, getEstimatedFee, sendTransaction, setCookie,
} from '@/common/utils';
import { providers } from 'ethers';
import { FlyoverService } from '@/common/services';

export const actions: ActionTree<PegOutTxState, RootState> = {
  [constants.PEGOUT_TX_SELECT_FEE_LEVEL]: ({ commit }, feeLevel: MiningSpeedFee) => {
    commit(constants.PEGOUT_TX_SET_SELECTED_FEE_LEVEL, feeLevel);
  },
  [constants.PEGOUT_TX_ADD_AMOUNT]: ({ commit }, amountToTransfer: WeiBig) => {
    commit(constants.PEGOUT_TX_SET_AMOUNT, amountToTransfer);
  },
  [constants.PEGOUT_TX_CALCULATE_FEE]: async ({ commit, state, rootState }) => {
    const ethersProvider = rootState.web3Session?.ethersProvider as providers.Web3Provider;
    const sender = rootState.web3Session?.account as string;
    try {
      // RSK Fee
      const gas = await ethersProvider.estimateGas({
        from: sender,
        to: state.pegoutConfiguration.bridgeContractAddress,
        value: state.amountToTransfer.toWeiString(),
      });
      commit(constants.PEGOUT_TX_SET_GAS, gas);
      const gasPrice = Number(await ethersProvider.getGasPrice());
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
      maxValue:
        new WeiBig(EnvironmentAccessorService.getEnvironmentVariables().pegoutMaxValue, 'rbtc'),
      bridgeContractAddress: constants.BRIDGE_CONTRACT_ADDRESS,
    });
  },
  [constants.PEGOUT_TX_ADD_VALID_AMOUNT]: ({ commit }, valid: boolean) => {
    commit(constants.PEGOUT_TX_SET_VALID_AMOUNT, valid);
  },
  [constants.PEGOUT_TX_INIT]: ({ dispatch }):
    Promise<void> => dispatch(constants.PEGOUT_TX_ADD_BITCOIN_PRICE)
    .then(() => dispatch(constants.PEGOUT_TX_ADD_PEGOUT_CONFIGURATION)),
  [constants.PEGOUT_TX_SEND]: ({ state, rootState, commit })
    : Promise<void> => new Promise<void>((resolve, reject) => {
      const { ethersProvider } = rootState.web3Session as SessionState;
      if (ethersProvider) {
        const txToSign = {
          from: rootState.web3Session?.account,
          to: state.pegoutConfiguration.bridgeContractAddress,
          value: state.amountToTransfer.toWeiString(),
        };
        Promise.all([
          sendTransaction(txToSign, ethersProvider as providers.Web3Provider)
            .then((txResponse) => {
              commit(constants.PEGOUT_TX_SET_TX_HASH, txResponse.hash);
              resolve();
              return txResponse.wait(1);
            }),
          ethersProvider.getGasPrice(),
        ])
          .then(([tx, gasPrice]) => {
            commit(
              constants.PEGOUT_TX_SET_EFECTIVE_FEE,
              new WeiBig(Number(gasPrice) * Number(tx.gasUsed), 'wei'),
            );
          })
          .catch((e) => {
            console.warn(e);
            reject(new Error('User Cancelled transaction'));
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
