import { MiningSpeedFee, SatoshiBig, Utxo } from '@/common/types';
import { ApiService } from '@/common/services';
import * as constants from '@/common/store/constants';
import { EnvironmentAccessorService } from '@/common/services/enviroment-accessor.service';

export default class TxFeeService {
  static async getFeePerByteByLevel() {
    const {
      miningSpeedBlock,
      minFeeSatPerByte,
    } = EnvironmentAccessorService.getEnvironmentVariables();

    const getCheckedFee = (blocks: number, minFee: number) => ApiService.estimateFee(blocks)
      .then((fee) => {
        const minSatoshi = new SatoshiBig(minFee, 'satoshi');
        return fee.gt(minSatoshi) ? fee : minSatoshi;
      });

    return Promise.all([
      getCheckedFee(miningSpeedBlock.slow, minFeeSatPerByte.slow),
      getCheckedFee(miningSpeedBlock.average, minFeeSatPerByte.average),
      getCheckedFee(miningSpeedBlock.fast, minFeeSatPerByte.fast),
    ]).then(([slow, average, fast]) => ({ slow, average, fast }));
  }

  public static getTxFee(
    amountTotransfer: SatoshiBig,
    totalUtxoList: Utxo[],
    feePerByte: SatoshiBig,
    isFlyoverTx = false,
  ) {
    if (!totalUtxoList.length) {
      throw new Error('Empty utxo list.');
    }
    const outputs = isFlyoverTx ? constants.FLYOVER_PEGIN_OUTPUTS : constants.PEGIN_OUTPUTS;
    const baseFee = feePerByte.mul(constants.BITCOIN_TX_HEADER_SIZE_IN_BYTES
            + (constants.BITCOIN_TX_OUTPUT_SIZE_IN_BYTES * outputs));
    const feePerInput = feePerByte
      .mul(constants.BITCOIN_TX_INPUT_SIZE_IN_BYTES);
    const { selectedUtxoList, enoughBalance } = TxFeeService
      .selectOptimalInputs(
        totalUtxoList,
        amountTotransfer,
        baseFee,
        feePerInput,
      );
    const totalFeeToPay = TxFeeService
      .checkFeeBoundaries(baseFee.plus(feePerInput.mul(selectedUtxoList.length)));
    return {
      amount: totalFeeToPay,
      enoughBalance,
      selectedUtxoList,
    };
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
