import * as bitcoin from 'bitcoinjs-lib';
import { EnvironmentAccessorService } from '@/common/services/enviroment-accessor.service';
import {
  NormalizedOutput, NormalizedTx, SatoshiBig, Utxo,
} from '@/common/types';
import { validateAddress } from '@/common/utils';
import * as constants from '@/common/store/constants';

export default class PeginTxService {
  private static getRskOutput(recipientAddress: string, refundAddress: string): NormalizedOutput {
    const output: NormalizedOutput = {
      amount: '0',
      op_return_data: `52534b5401${recipientAddress}`,
    };
    const { addressType: refundAddressType } = validateAddress(refundAddress);
    const hash = bitcoin.address.fromBase58Check(refundAddress).hash.toString('hex');
    switch (refundAddressType) {
      case constants.BITCOIN_LEGACY_ADDRESS:
        output.op_return_data += `01${hash}`;
        break;
      case constants.BITCOIN_SEGWIT_ADDRESS:
        output.op_return_data += `02${hash}`;
        break;
      default:
        throw new Error(`Invalid refund address ${refundAddress}}`);
    }
    return output;
  }

  public static buildNormalizedTx({
    selectedUtxoList,
    totalFee,
    amountToTransfer,
    federationAddress,
    refundAddress,
    rskRecipientAddress,
    changeAddress,
  }: {
    selectedUtxoList: Utxo[];
    totalFee: SatoshiBig;
    amountToTransfer: SatoshiBig;
    federationAddress: string;
    refundAddress: string;
    rskRecipientAddress: string;
    changeAddress: string;
  }): NormalizedTx {
    const normalizedTx: NormalizedTx = {
      coin: EnvironmentAccessorService.getEnvironmentVariables().vueAppCoin,
      inputs: [],
      outputs: [],
    };
    normalizedTx.inputs = selectedUtxoList.map((utxo) => ({
      address: utxo.address ?? '',
      prev_hash: utxo.txid,
      amount: utxo.amount.toString(),
      address_n: utxo.derivationArray,
      prev_index: utxo.vout,
    }));
    const federationOutput: NormalizedOutput = {
      address: federationAddress,
      amount: amountToTransfer.toSatoshiString(),
    };
    normalizedTx.outputs.push(federationOutput);
    normalizedTx.outputs.push(this.getRskOutput(rskRecipientAddress, refundAddress));
    const totalBalance = selectedUtxoList.reduce((acc, { amount }) => acc + amount, 0);
    const totalBalanceInSatoshis = new SatoshiBig(totalBalance, 'satoshi');
    const changeOutput: NormalizedOutput = {
      address: changeAddress,
      amount: totalBalanceInSatoshis.minus(amountToTransfer).minus(totalFee).toSatoshiString(),
    };
    const burnDustValue = Math.min(
      EnvironmentAccessorService.getEnvironmentVariables().burnDustValue,
      constants.BURN_DUST_MAX_VALUE,
    );
    if (Number(changeOutput.amount) > burnDustValue) {
      normalizedTx.outputs.push(changeOutput);
    }
    return normalizedTx;
  }
}
