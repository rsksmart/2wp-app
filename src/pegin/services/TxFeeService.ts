import { MiningSpeedFee, SatoshiBig, Utxo } from '@/common/types';
import { ApiService } from '@/common/services';
import * as constants from '@/common/store/constants';
import { FeeSelection } from '@/pegin/types/services';
import { EnvironmentAccessorService } from '@/common/services/enviroment-accessor.service';
import { ServiceError } from '@/common/utils';

export default class TxFeeService {
  public static getTxFee(
    amountTotransfer: SatoshiBig,
    totalUtxoList: Utxo[],
    feeLevel: MiningSpeedFee,
  )
    :Promise<FeeSelection> {
    return new Promise<FeeSelection>((resolve, reject) => {
      const filteredUtxoList = totalUtxoList.filter((utxo) => utxo.selected);
      if (!totalUtxoList.length || !filteredUtxoList.length) {
        reject(new Error('Empty utxo list.'));
      }
      ApiService.estimateFee(TxFeeService.getMiningSpeedBlock(feeLevel))
        .then(({ feePerByte }) => {
          const checkedFeePerByte = TxFeeService.getCheckedFeePerByte(feePerByte, feeLevel);
          const baseFee = checkedFeePerByte.mul(constants.BITCOIN_TX_HEADER_SIZE_IN_BYTES
            + (constants.BITCOIN_TX_OUTPUT_SIZE_IN_BYTES * constants.PEGIN_OUTPUTS));
          const feePerInput = checkedFeePerByte
            .mul(constants.BITCOIN_TX_INPUT_SIZE_IN_BYTES);
          const { selectedUtxoList, enoughBalance } = TxFeeService
            .selectOptimalInputs(
              filteredUtxoList,
              amountTotransfer,
              baseFee,
              feePerInput,
            );
          const totalFeeToPay = TxFeeService
            .checkFeeBoundaries(baseFee.plus(feePerInput.mul(selectedUtxoList.length)));
          resolve({
            fee: {
              amount: totalFeeToPay,
              enoughBalance,
            },
            selectedUtxoList,
          });
        })
        .catch(() => {
          reject(new ServiceError('TxFeeService', 'getTxFee', 'Something went wrong. Please check your network connection and try again.', 'Unable to get estimated fee from API'));
        });
    });
  }

  private static checkFeeBoundaries(totalFee:SatoshiBig):SatoshiBig {
    const checkedAmount = Math.min(
      Math.max(Number(totalFee.toSatoshiString()), constants.BITCOIN_MIN_SATOSHI_FEE),
      constants.BITCOIN_MAX_SATOSHI_FEE,
    );
    return new SatoshiBig(checkedAmount, 'satoshi');
  }

  private static selectOptimalInputs(
    utxoList: Utxo[],
    amountToSendInSatoshis: SatoshiBig,
    baseFee: SatoshiBig,
    feePerInput: SatoshiBig,
  ): {selectedUtxoList: Utxo[]; enoughBalance: boolean} {
    const inputs: Utxo[] = [];
    let remainingSatoshisToBePaid = amountToSendInSatoshis.plus(baseFee);
    utxoList.sort((a, b) => b.amount - a.amount);
    utxoList.forEach((utxo) => {
      if (remainingSatoshisToBePaid.gt(0)) {
        inputs.push(utxo);
        const amount = new SatoshiBig(utxo.amount, 'satoshi');
        remainingSatoshisToBePaid = remainingSatoshisToBePaid.plus(feePerInput).minus(amount);
      }
    });
    return {
      selectedUtxoList: inputs,
      enoughBalance: remainingSatoshisToBePaid.lte(0),
    };
  }

  private static getMiningSpeedBlock(feeLevel: MiningSpeedFee): number {
    let blockNumber = 0;
    const { miningSpeedBlock } = EnvironmentAccessorService.getEnvironmentVariables();
    switch (feeLevel) {
      case constants.BITCOIN_FAST_FEE_LEVEL:
        blockNumber = miningSpeedBlock.fast;
        break;
      case constants.BITCOIN_AVERAGE_FEE_LEVEL:
        blockNumber = miningSpeedBlock.average;
        break;
      case constants.BITCOIN_SLOW_FEE_LEVEL:
        blockNumber = miningSpeedBlock.slow;
        break;
      default:
        blockNumber = 1;
    }
    return blockNumber;
  }

  private static getCheckedFeePerByte(feeFromService: SatoshiBig, feeLevel: MiningSpeedFee)
    : SatoshiBig {
    let minFee = 0;
    switch (feeLevel) {
      case constants.BITCOIN_FAST_FEE_LEVEL:
        minFee = EnvironmentAccessorService.getEnvironmentVariables().minFeeSatPerByte.fast;
        break;
      case constants.BITCOIN_AVERAGE_FEE_LEVEL:
        minFee = EnvironmentAccessorService.getEnvironmentVariables().minFeeSatPerByte.average;
        break;
      case constants.BITCOIN_SLOW_FEE_LEVEL:
        minFee = EnvironmentAccessorService.getEnvironmentVariables().minFeeSatPerByte.slow;
        break;
      default:
    }
    const fee = new SatoshiBig(minFee, 'satoshi');
    return feeFromService.gt(fee) ? feeFromService : fee;
  }
}
